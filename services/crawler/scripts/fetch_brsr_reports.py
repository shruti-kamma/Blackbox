"""
Bulk-downloads NSE India Business Responsibility & Sustainability Reports (BRSR).

Source: https://www.nseindia.com/companies-listing/corporate-filings-bussiness-sustainabilitiy-reports
(backed by the JSON API at /api/corporate-bussiness-sustainabilitiy)

Scope: the three most recent fiscal years present in the data, restricted to
companies that filed continuously in all three (a company missing even one
of the three years is excluded entirely — no partial downloads for it).

Usage:
    python scripts/fetch_brsr_reports.py --dry-run   # preview scope, no downloads
    python scripts/fetch_brsr_reports.py              # download PDFs + write manifest
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import re
import sys
from dataclasses import asdict, dataclass
from datetime import date, datetime, timezone
from pathlib import Path

import httpx

NSE_HOME_URL = "https://www.nseindia.com/"
NSE_REPORTS_PAGE_URL = (
    "https://www.nseindia.com/companies-listing/"
    "corporate-filings-bussiness-sustainabilitiy-reports"
)
NSE_API_URL = "https://www.nseindia.com/api/corporate-bussiness-sustainabilitiy"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
REPORTS_DIR = DATA_DIR / "reports"
MANIFEST_PATH = DATA_DIR / "brsr_reports_manifest.json"
EXCLUDED_PATH = DATA_DIR / "brsr_excluded_companies.json"

DOWNLOAD_CONCURRENCY = 8
MAX_RETRIES = 3


@dataclass
class ReportRecord:
    symbol: str
    company_name: str
    fy_from: int
    fy_to: int
    submission_date: str
    source_url: str
    local_path: str | None = None
    size_bytes: int | None = None
    sha256: str | None = None
    downloaded_at: str | None = None
    status: str = "pending"  # pending | downloaded | skipped_exists | failed


def slugify(name: str) -> str:
    slug = name.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


async def bootstrap_session(client: httpx.AsyncClient) -> None:
    """NSE's API rejects requests without cookies from a prior page visit."""
    await client.get(NSE_HOME_URL)
    await client.get(NSE_REPORTS_PAGE_URL)


async def fetch_filings(client: httpx.AsyncClient, from_date: date, to_date: date) -> list[dict]:
    params = {
        "index": "equities",
        "from_date": from_date.strftime("%d-%m-%Y"),
        "to_date": to_date.strftime("%d-%m-%Y"),
    }
    headers = {"Referer": NSE_REPORTS_PAGE_URL, "Accept": "application/json, text/plain, */*"}
    resp = await client.get(NSE_API_URL, params=params, headers=headers)
    resp.raise_for_status()
    return resp.json()["data"]


def determine_target_fiscal_years(rows: list[dict], count: int = 3) -> list[tuple[int, int]]:
    """The `count` most recent standard (one-year-span) fiscal years present in the data."""
    pairs = {
        (r["fyFrom"], r["fyTo"])
        for r in rows
        if isinstance(r.get("fyFrom"), int)
        and isinstance(r.get("fyTo"), int)
        and r["fyTo"] - r["fyFrom"] == 1
    }
    return sorted(pairs, key=lambda p: p[1], reverse=True)[:count]


def build_records(
    rows: list[dict], target_years: list[tuple[int, int]]
) -> tuple[list[ReportRecord], list[dict]]:
    target_set = set(target_years)
    by_symbol: dict[str, dict[tuple[int, int], dict]] = {}
    for r in rows:
        key = (r.get("fyFrom"), r.get("fyTo"))
        if key not in target_set:
            continue
        symbol = r["symbol"]
        by_symbol.setdefault(symbol, {})[key] = r

    qualifying: list[ReportRecord] = []
    excluded: list[dict] = []
    for symbol, years in by_symbol.items():
        if target_set.issubset(years.keys()):
            for key in target_years:
                row = years[key]
                qualifying.append(
                    ReportRecord(
                        symbol=symbol,
                        company_name=row["companyName"],
                        fy_from=row["fyFrom"],
                        fy_to=row["fyTo"],
                        submission_date=row["submissionDate"],
                        source_url=row["attachmentFile"],
                    )
                )
        else:
            sample = next(iter(years.values()))
            excluded.append(
                {
                    "symbol": symbol,
                    "companyName": sample["companyName"],
                    "fiscalYearsFiled": [f"{f}-{t}" for f, t in sorted(years.keys())],
                    "missingFiscalYears": [
                        f"{f}-{t}" for f, t in sorted(target_set - years.keys())
                    ],
                }
            )
    return qualifying, excluded


def assign_local_paths(records: list[ReportRecord]) -> None:
    seen_slugs: dict[str, str] = {}  # slug -> symbol that claimed it
    for rec in records:
        slug = slugify(rec.company_name)
        claimant = seen_slugs.setdefault(f"{slug}::{rec.fy_from}-{rec.fy_to}", rec.symbol)
        if claimant != rec.symbol:
            slug = f"{slug}-{rec.symbol.lower()}"
        filename = f"{slug}-{rec.fy_from}-{rec.fy_to}.pdf"
        rec.local_path = str((REPORTS_DIR / filename).relative_to(DATA_DIR))


def prune_incomplete_companies(
    records: list[ReportRecord], target_years: list[tuple[int, int]]
) -> tuple[list[ReportRecord], list[dict]]:
    """Drop every record for a company that doesn't end up with a locally-present
    file for all target fiscal years (e.g. a source-side 404). Partial data for
    a company is worse than none for a ranking product — the dataset should
    only ever contain companies with the full continuous window on disk.
    """
    by_symbol: dict[str, list[ReportRecord]] = {}
    for rec in records:
        by_symbol.setdefault(rec.symbol, []).append(rec)

    kept: list[ReportRecord] = []
    newly_excluded: list[dict] = []
    for symbol, recs in by_symbol.items():
        complete = len(recs) == len(target_years) and all(
            r.status in ("downloaded", "skipped_exists") for r in recs
        )
        if complete:
            kept.extend(recs)
            continue

        for r in recs:
            if r.status in ("downloaded", "skipped_exists") and r.local_path:
                path = DATA_DIR / r.local_path
                if path.exists():
                    path.unlink()
        newly_excluded.append(
            {
                "symbol": symbol,
                "companyName": recs[0].company_name,
                "fiscalYearsFiled": [f"{r.fy_from}-{r.fy_to}" for r in recs],
                "missingFiscalYears": [],
                "reason": "source file unavailable (404) for at least one fiscal year",
            }
        )
    return kept, newly_excluded


async def download_one(
    client: httpx.AsyncClient, rec: ReportRecord, semaphore: asyncio.Semaphore
) -> None:
    dest = DATA_DIR / rec.local_path
    if dest.exists() and dest.stat().st_size > 0:
        rec.status = "skipped_exists"
        rec.size_bytes = dest.stat().st_size
        rec.sha256 = hashlib.sha256(dest.read_bytes()).hexdigest()
        return

    dest.parent.mkdir(parents=True, exist_ok=True)
    async with semaphore:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = await client.get(
                    rec.source_url, headers={"Referer": NSE_REPORTS_PAGE_URL}, timeout=30
                )
                resp.raise_for_status()
                content = resp.content
                dest.write_bytes(content)
                rec.size_bytes = len(content)
                rec.sha256 = hashlib.sha256(content).hexdigest()
                rec.downloaded_at = datetime.now(timezone.utc).isoformat()
                rec.status = "downloaded"
                return
            except (httpx.HTTPError, httpx.TimeoutException) as exc:
                if attempt == MAX_RETRIES:
                    rec.status = f"failed: {exc}"
                else:
                    await asyncio.sleep(1.5 * attempt)


async def run(dry_run: bool, concurrency: int) -> None:
    today = date.today()
    from_date = date(today.year - 4, 4, 1)

    async with httpx.AsyncClient(
        headers={"User-Agent": USER_AGENT}, follow_redirects=True, timeout=30
    ) as client:
        print("Bootstrapping NSE session...")
        await bootstrap_session(client)

        print(f"Fetching BRSR filing list ({from_date} to {today})...")
        rows = await fetch_filings(client, from_date, today)
        print(f"  {len(rows)} filings returned")

        target_years = determine_target_fiscal_years(rows)
        print(f"Target fiscal years (most recent 3): {target_years}")

        records, excluded = build_records(rows, target_years)
        n_companies = len(records) // len(target_years) if target_years else 0
        print(
            f"Qualifying companies (filed continuously in all 3 years): {n_companies} "
            f"({len(records)} reports to fetch)"
        )
        print(f"Excluded companies (missing at least one year): {len(excluded)}")

        assign_local_paths(records)
        DATA_DIR.mkdir(parents=True, exist_ok=True)

        if dry_run:
            EXCLUDED_PATH.write_text(json.dumps(excluded, indent=2), encoding="utf-8")
            print("\n--dry-run set: no files downloaded.")
            print(f"Excluded-companies list written to {EXCLUDED_PATH}")
            return

        semaphore = asyncio.Semaphore(concurrency)
        print(f"\nDownloading {len(records)} PDFs (concurrency={concurrency})...")
        done = 0
        for coro in asyncio.as_completed(
            [download_one(client, rec, semaphore) for rec in records]
        ):
            await coro
            done += 1
            if done % 50 == 0 or done == len(records):
                print(f"  {done}/{len(records)}")

    n_before_prune = len(records) // len(target_years) if target_years else 0
    records, newly_excluded = prune_incomplete_companies(records, target_years)
    excluded.extend(newly_excluded)
    EXCLUDED_PATH.write_text(json.dumps(excluded, indent=2), encoding="utf-8")

    MANIFEST_PATH.write_text(
        json.dumps([asdict(r) for r in records], indent=2), encoding="utf-8"
    )

    n_final_companies = len(records) // len(target_years) if target_years else 0
    print(
        f"\nPruned {len(newly_excluded)} companies with an incomplete download "
        f"(source-side 404 for at least one year); deleted their partial files."
    )
    print(f"Final dataset: {n_final_companies}/{n_before_prune} companies, {len(records)} PDFs.")
    print(f"Manifest: {MANIFEST_PATH}")
    print(f"Excluded-companies list: {EXCLUDED_PATH}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run", action="store_true", help="Only print scope, don't download anything."
    )
    parser.add_argument(
        "--concurrency", type=int, default=DOWNLOAD_CONCURRENCY, help="Parallel downloads."
    )
    args = parser.parse_args()

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(run(dry_run=args.dry_run, concurrency=args.concurrency))


if __name__ == "__main__":
    main()
