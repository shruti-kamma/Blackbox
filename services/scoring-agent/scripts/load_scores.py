"""
Loads services/scoring-agent/scripts/score_orgs.py output into Postgres —
upserts an Organization row (matched by slug) and appends a new
AccessibilityScore row per company. AccessibilityScore is intentionally
append-only (see docs/plans/rankings-site-v1.md — "score over time"
story), so re-running this after a fresh scoring run adds history rather
than overwriting the previous score.

Real companies loaded this way get industry/location/logoUrl = NULL — the
BRSR pipeline has no company-metadata classification step yet (see
docs/decisions.md — "Scoring methodology"), so these are left unset
rather than guessed. type is always COMPANY: the BRSR/NSE source this
pipeline reads from only lists public companies, never universities.

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


def load_one(conn: psycopg.Connection, record: dict) -> None:
    slug = slugify(record["company_name"])
    now = datetime.now(timezone.utc)

    with conn.cursor() as cur:
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

    paths = [SCORES_DIR / f"{args.company}.json"] if args.company else sorted(SCORES_DIR.glob("*.json"))
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
                load_one(conn, record)
                print("ok")
            except Exception as exc:  # noqa: BLE001
                conn.rollback()
                print(f"FAILED: {exc}")

    print("\nDone.")


if __name__ == "__main__":
    main()
