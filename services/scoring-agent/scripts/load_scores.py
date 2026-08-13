"""
Loads services/scoring-agent/scripts/score_orgs.py output into Postgres —
upserts an Organization row (matched by slug) and appends a new
AccessibilityScore row per company. AccessibilityScore is intentionally
append-only (see docs/plans/rankings-site-v1.md — "score over time"
story), so re-running this after a fresh scoring run adds history rather
than overwriting the previous score.

Real companies loaded this way get location/logoUrl = NULL — no data
source for either exists yet, so these are left unset rather than
guessed. industry IS set, for companies present in services/crawler/data/
selected_companies_50.json (see docs/decisions.md — "Claim-gated
metrics" and fetch_sector_classification.py): that file's NSE
sectoral-index classification is mapped to a clean display label via
INDEX_TO_INDUSTRY_LABEL below. Companies outside that 50-company batch
(e.g. a future full-413 run) still get industry = NULL, honestly, since
no classification exists for them yet. type is always COMPANY: the
BRSR/NSE source this pipeline reads from only lists public companies,
never universities.

Usage:
    python scripts/load_scores.py                 # load every scored company
    python scripts/load_scores.py --company MFSL   # load one
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

SCORES_DIR = Path(__file__).resolve().parent.parent / "data" / "scores"
SELECTED_COMPANIES_PATH = Path(__file__).resolve().parents[2] / "crawler" / "data" / "selected_companies_50.json"

# NSE sectoral-index name (as written in selected_companies_50.json) ->
# clean display label for the rankings site. Kept here rather than in the
# crawler package since this is a display concern of the loader, not the
# classification step itself.
INDEX_TO_INDUSTRY_LABEL = {
    "NIFTY IT": "Information Technology",
    "NIFTY AUTO": "Automotive",
    "NIFTY FINANCIAL SERVICES": "Financial Services",
    "NIFTY PSU BANK": "Public Sector Banking",
    "NIFTY CHEMICALS": "Chemicals",
    "NIFTY PHARMA": "Pharmaceuticals",
    "NIFTY FMCG": "FMCG",
    "NIFTY METAL": "Metals & Mining",
    "NIFTY REALTY": "Real Estate",
    "NIFTY ENERGY": "Energy",
}


def load_industry_lookup() -> dict[str, str]:
    """symbol -> clean industry label, for companies in the 50-company batch."""
    if not SELECTED_COMPANIES_PATH.exists():
        return {}
    records = json.loads(SELECTED_COMPANIES_PATH.read_text(encoding="utf-8"))
    return {
        r["symbol"]: INDEX_TO_INDUSTRY_LABEL.get(r["industry"], r["industry"])
        for r in records
    }


def _psycopg_safe_url(url: str) -> str:
    """Prisma's connection strings conventionally include ?schema=public
    (see packages/db/.env.example) — libpq/psycopg doesn't recognize that
    query param and errors on it. Strip it so the same DATABASE_URL value
    works for both without maintaining two separate env vars."""
    return re.sub(r"[?&]schema=[^&]*", "", url)


DATABASE_URL = _psycopg_safe_url(
    os.environ.get("DATABASE_URL", "postgresql://blackbox:blackbox@localhost:5432/blackbox")
)


def slugify(name: str) -> str:
    slug = name.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def load_one(conn: psycopg.Connection, record: dict, industry_lookup: dict[str, str]) -> None:
    slug = slugify(record["company_name"])
    now = datetime.now(timezone.utc)
    industry = industry_lookup.get(record["symbol"])

    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO "Organization" (id, type, name, slug, industry, "createdAt", "updatedAt")
            VALUES (%s, 'COMPANY', %s, %s, %s, %s, %s)
            ON CONFLICT (slug) DO UPDATE SET
                name = EXCLUDED.name,
                industry = COALESCE(EXCLUDED.industry, "Organization".industry),
                "updatedAt" = EXCLUDED."updatedAt"
            RETURNING id
            """,
            (str(uuid.uuid4()), record["company_name"], slug, industry, now, now),
        )
        row = cur.fetchone()
        assert row is not None
        org_id = row[0]

        cur.execute(
            """
            INSERT INTO "AccessibilityScore"
                (id, "organizationId", "overallScore", breakdown, "methodologyVersion", "generatedBy", "generatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                str(uuid.uuid4()),
                org_id,
                record["overall_score"],
                json.dumps(record["breakdown"]),
                record["methodology_version"],
                record["generated_by"],
                record.get("generated_at", now.isoformat()),
            ),
        )
    conn.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--company", type=str, help="Load one company by symbol (matches score_orgs.py output filename).")
    args = parser.parse_args()

    if not SCORES_DIR.exists():
        print(f"No scores directory at {SCORES_DIR} — run score_orgs.py first.", file=sys.stderr)
        sys.exit(1)

    industry_lookup = load_industry_lookup()

    if args.company:
        paths = [SCORES_DIR / f"{args.company}.json"]
    else:
        # Scoped to the classified 50-company batch, not every file in
        # data/scores/ — that directory can also hold stale runs from
        # before this batch existed (e.g. an earlier --mock --pilot test),
        # which must never get loaded onto the live site under a real
        # company's name.
        known_symbols = set(industry_lookup.keys())
        all_paths = sorted(SCORES_DIR.glob("*.json"))
        paths = [p for p in all_paths if p.stem in known_symbols]
        skipped = [p.stem for p in all_paths if p.stem not in known_symbols]
        if skipped:
            print(f"Skipping {len(skipped)} file(s) outside the 50-company batch: {skipped}")
    if not paths or not all(p.exists() for p in paths):
        print(f"No matching score file(s) found in {SCORES_DIR}.", file=sys.stderr)
        sys.exit(1)

    target = DATABASE_URL.split("@")[-1]
    print(f"Loading {len(paths)} score(s) into {target}...")
    try:
        conn_ctx = psycopg.connect(DATABASE_URL, connect_timeout=5)
    except psycopg.OperationalError as exc:
        print(f"Could not connect to Postgres at {target}: {exc}", file=sys.stderr)
        print("Is it running? (docker compose up postgres)", file=sys.stderr)
        sys.exit(1)
    with conn_ctx as conn:
        for i, path in enumerate(paths, 1):
            record = json.loads(path.read_text(encoding="utf-8"))
            print(f"  [{i}/{len(paths)}] {record['symbol']}...", end=" ")
            try:
                load_one(conn, record, industry_lookup)
                print("ok")
            except Exception as exc:  # noqa: BLE001
                conn.rollback()
                print(f"FAILED: {exc}")

    print("\nDone.")


if __name__ == "__main__":
    main()
