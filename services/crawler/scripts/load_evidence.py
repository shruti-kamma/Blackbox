"""
Loads extract_pwd_signals.py's per-evidence-entry citations into Postgres
— an internal audit trail (Evidence table), never surfaced on the public
site. Purpose: if a published score is ever questioned, we can point to
the exact document, page, and quote that backed it (see docs/decisions.md
— "Evidence repository").

Unlike load_scores.py's AccessibilityScore (deliberately append-only, for
a future score-history view), this replaces an organization's evidence
wholesale on each reload — Evidence represents "the current best citation
set for what this filing says," not a history of extraction attempts.

Usage:
    python scripts/load_evidence.py                 # load every extracted company
    python scripts/load_evidence.py --company MFSL  # load one
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import psycopg

EXTRACTIONS_DIR = Path(__file__).resolve().parent.parent / "data" / "pwd_extractions"

# Must stay in sync with METRIC_FIELDS in extract_pwd_signals.py (same
# service, same directory even, but kept as a plain duplicate rather than
# an import — this script has no reason to pull in that module's anthropic/
# fitz dependencies just for a 10-entry lookup table; same tradeoff already
# accepted for the crawler/scoring-agent duplication, see docs/decisions.md).
METRIC_FIELDS: dict[str, list[str]] = {
    "Accessibility": ["physical_accessibility_measures", "digital_accessibility_measures"],
    "Policy": ["policy_exists", "policy_summary", "accommodation_process_described", "accommodation_process_summary"],
    "Employment": ["pwd_employee_count_stated", "pwd_employee_count_details"],
    "Recruitment": ["recruitment_disclosed", "recruitment_details"],
    "Retention": ["retention_disclosed", "retention_details"],
    "Leadership": ["leadership_representation_disclosed", "leadership_representation_details"],
    "Learning": ["training_or_sensitization_programs"],
    "Culture": ["culture_practices_disclosed", "culture_practices_details"],
    "Employee Feedback": ["employee_feedback_disclosed", "employee_feedback_details"],
    "Compliance": ["compliance_disclosed", "compliance_details"],
}
FIELD_TO_METRIC = {field: metric for metric, fields in METRIC_FIELDS.items() for field in fields}


def _psycopg_safe_url(url: str) -> str:
    """Prisma's connection strings conventionally include ?schema=public —
    libpq/psycopg doesn't recognize that query param and errors on it."""
    return re.sub(r"[?&]schema=[^&]*", "", url)


DATABASE_URL = _psycopg_safe_url(
    os.environ.get("DATABASE_URL", "postgresql://blackbox:blackbox@localhost:5432/blackbox")
)


def slugify(name: str) -> str:
    slug = name.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def load_one(conn: psycopg.Connection, record: dict) -> int:
    """Returns how many evidence rows were inserted for this company."""
    slug = slugify(record["company_name"])
    now = datetime.now(timezone.utc)
    fy_from, fy_to = record["fy_from"], record["fy_to"]

    source_pdf_by_label = {
        "BRSR": record["source_pdf"],
        "Annual Report": record.get("annual_report_pdf"),
    }

    with conn.cursor() as cur:
        # Same upsert-by-slug as load_scores.py — evidence loading doesn't
        # depend on scoring having run first, so this can't assume the
        # Organization row already exists.
        cur.execute(
            """
            INSERT INTO "Organization" (id, type, name, slug, "createdAt", "updatedAt")
            VALUES (%s, 'COMPANY', %s, %s, %s, %s)
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = EXCLUDED."updatedAt"
            RETURNING id
            """,
            (str(uuid.uuid4()), record["company_name"], slug, now, now),
        )
        row = cur.fetchone()
        assert row is not None
        org_id = row[0]

        # Replace, not append — see module docstring.
        cur.execute(
            """DELETE FROM "Evidence" WHERE "organizationId" = %s AND "fyFrom" = %s AND "fyTo" = %s""",
            (org_id, fy_from, fy_to),
        )

        evidence_entries = record["extraction"].get("evidence", [])
        for entry in evidence_entries:
            metric = FIELD_TO_METRIC.get(entry["field"], "Unmapped")
            source_label = entry.get("source", "BRSR")  # older extractions predate the source field
            cur.execute(
                """
                INSERT INTO "Evidence"
                    (id, "organizationId", "fyFrom", "fyTo", metric, field, quote, source, "sourceDocument", "originalPage", "createdAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    str(uuid.uuid4()),
                    org_id,
                    fy_from,
                    fy_to,
                    metric,
                    entry["field"],
                    entry["quote"],
                    source_label,
                    source_pdf_by_label.get(source_label),
                    entry.get("original_page"),
                    now,
                ),
            )
    conn.commit()
    return len(evidence_entries)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--company", type=str, help="Load one company by symbol (matches extract_pwd_signals.py output filename prefix).")
    args = parser.parse_args()

    if not EXTRACTIONS_DIR.exists():
        print(f"No extractions directory at {EXTRACTIONS_DIR} — run extract_pwd_signals.py first.", file=sys.stderr)
        sys.exit(1)

    all_paths = sorted(EXTRACTIONS_DIR.glob("*.json"))
    if args.company:
        paths = [p for p in all_paths if json.loads(p.read_text(encoding="utf-8"))["symbol"] == args.company]
    else:
        paths = all_paths
    if not paths:
        print(f"No matching extraction file(s) found in {EXTRACTIONS_DIR}.", file=sys.stderr)
        sys.exit(1)

    target = DATABASE_URL.split("@")[-1]
    print(f"Loading evidence from {len(paths)} extraction(s) into {target}...")
    try:
        conn_ctx = psycopg.connect(DATABASE_URL, connect_timeout=5)
    except psycopg.OperationalError as exc:
        print(f"Could not connect to Postgres at {target}: {exc}", file=sys.stderr)
        print("Is it running? (docker compose up postgres)", file=sys.stderr)
        sys.exit(1)

    total_rows = 0
    with conn_ctx as conn:
        for i, path in enumerate(paths, 1):
            record = json.loads(path.read_text(encoding="utf-8"))
            print(f"  [{i}/{len(paths)}] {record['symbol']}...", end=" ")
            try:
                n = load_one(conn, record)
                total_rows += n
                print(f"ok ({n} evidence rows)")
            except Exception as exc:  # noqa: BLE001
                conn.rollback()
                print(f"FAILED: {exc}")

    print(f"\nDone. {total_rows} evidence row(s) loaded across {len(paths)} companies.")


if __name__ == "__main__":
    main()
