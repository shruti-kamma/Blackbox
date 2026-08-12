"""
Downloads NSE-listed companies' annual reports, to supplement the BRSR
extraction pipeline (see extract_pwd_signals.py — a real triage run showed
annual reports add real, if sparse, additional PwD/accessibility signal
beyond BRSR filings; docs/decisions.md — "LLM provider for BRSR/
annual-report extraction").

Source: https://www.nseindia.com/companies-listing/corporate-filings-annual-reports
(backed by the JSON API at /api/annual-reports — unlike the BRSR endpoint,
which returns every company for a date range in one call, this one is
per-symbol: one request per company, response is that company's available
annual reports by year.)

Scope: reuses the company universe already established by
fetch_brsr_reports.py (data/brsr_reports_manifest.json) rather than
discovering companies independently — every company here already has a
continuous 3-year BRSR filing history. For each, downloads only the single
most recent available annual report (this pipeline needs one contemporary
supplementary document per company for the current scoring cycle, not a
multi-year history the way BRSR needed one for the continuous-filer rule).

Usage:
    python scripts/fetch_annual_reports.py --dry-run          # preview scope, no downloads
    python scripts/fetch_annual_reports.py                     # download PDFs + write manifest
    python scripts/fetch_annual_reports.py --symbol MFSL       # one company, for testing
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import re
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

import httpx

NSE_HOME_URL = "https://www.nseindia.com/"
NSE_REPORTS_PAGE_URL = "https://www.nseindia.com/companies-listing/corporate-filings-annual-reports"
NSE_API_URL = "https://www.nseindia.com/api/annual-reports"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
BRSR_MANIFEST_PATH = DATA_DIR / "brsr_reports_manifest.json"
REPORTS_DIR = DATA_DIR / "annual_reports"
MANIFEST_PATH = DATA_DIR / "annual_reports_manifest.json"
UNAVAILABLE_PATH = DATA_DIR / "annual_reports_unavailable.json"

# NSE's public API is known to rate-limit around ~3 req/s; this is a
# per-symbol endpoint (413 companies = 413 requests just to discover what's
# downloadable), so concurrency is deliberately lower than the BRSR
# script's bulk single-call approach.
REQUEST_CONCURRENCY = 3
DOWNLOAD_CONCURRENCY = 6
MAX_RETRIES = 3


@dataclass
class AnnualReportRecord:
    symbol: str
    company_name: str
    year_from: str
    year_to: str
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


def load_symbols() -> list[str]:
    """Reuses the BRSR pipeline's already-qualified company universe —
    every symbol here has a continuous 3-year BRSR filing history."""
    if not BRSR_MANIFEST_PATH.exists():
        print(f"No BRSR manifest at {BRSR_MANIFEST_PATH} — run fetch_brsr_reports.py first.", file=sys.stderr)
        sys.exit(1)
    records = json.loads(BRSR_MANIFEST_PATH.read_text(encoding="utf-8"))
    return sorted({r["symbol"] for r in records})


async def bootstrap_session(client: httpx.AsyncClient) -> None:
    """NSE's API rejects requests without cookies from a prior page visit."""
    await client.get(NSE_HOME_URL)
    await client.get(NSE_REPORTS_PAGE_URL)


async def fetch_one_symbol(
    client: httpx.AsyncClient, symbol: str, semaphore: asyncio.Semaphore
) -> tuple[str, list[dict] | None]:
    """Returns (symbol, data-rows) — None if the symbol has no annual
    reports on file (a real, expected outcome, not necessarily an error)."""
    headers = {"Referer": NSE_REPORTS_PAGE_URL, "Accept": "application/json, text/plain, */*"}
    async with semaphore:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = await client.get(
                    NSE_API_URL, params={"index": "equities", "symbol": symbol}, headers=headers, timeout=30
                )
                resp.raise_for_status()
                data = resp.json().get("data") or []
                return symbol, data
            except (httpx.HTTPError, httpx.TimeoutException):
                if attempt == MAX_RETRIES:
                    return symbol, None
                await asyncio.sleep(1.5 * attempt)
    return symbol, None


def pick_latest(rows: list[dict]) -> dict | None:
    if not rows:
        return None
    return max(rows, key=lambda r: (r.get("fromYr", ""), r.get("toYr", "")))


def assign_local_path(rec: AnnualReportRecord) -> None:
    slug = slugify(rec.company_name)
    filename = f"{slug}-{rec.year_from}-{rec.year_to}.pdf"
    rec.local_path = str((REPORTS_DIR / filename).relative_to(DATA_DIR))


async def download_one(client: httpx.AsyncClient, rec: AnnualReportRecord, semaphore: asyncio.Semaphore) -> None:
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
                resp = await client.get(rec.source_url, headers={"Referer": NSE_REPORTS_PAGE_URL}, timeout=60)
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


async def run(dry_run: bool, only_symbol: str | None, concurrency: int) -> None:
    symbols = [only_symbol] if only_symbol else load_symbols()
    print(f"Company universe: {len(symbols)} symbol(s) (from the BRSR manifest).")

    async with httpx.AsyncClient(headers={"User-Agent": USER_AGENT}, follow_redirects=True, timeout=30) as client:
        print("Bootstrapping NSE session...")
        await bootstrap_session(client)

        print(f"Querying per-symbol annual-reports API (concurrency={REQUEST_CONCURRENCY})...")
        req_semaphore = asyncio.Semaphore(REQUEST_CONCURRENCY)
        results: dict[str, list[dict] | None] = {}
        done = 0
        for coro in asyncio.as_completed([fetch_one_symbol(client, s, req_semaphore) for s in symbols]):
            symbol, data = await coro
            results[symbol] = data
            done += 1
            if done % 50 == 0 or done == len(symbols):
                print(f"  {done}/{len(symbols)}")

        unavailable = [s for s, d in results.items() if not d]
        records: list[AnnualReportRecord] = []
        for symbol, rows in results.items():
            if not rows:
                continue
            latest = pick_latest(rows)
            assert latest is not None
            records.append(
                AnnualReportRecord(
                    symbol=symbol,
                    company_name=latest.get("companyName", symbol),
                    year_from=str(latest.get("fromYr", "")),
                    year_to=str(latest.get("toYr", "")),
                    source_url=latest["fileName"],
                )
            )

        print(f"\nAnnual report available: {len(records)}/{len(symbols)} companies.")
        print(f"No annual report on file: {len(unavailable)} companies.")

        for rec in records:
            assign_local_path(rec)
        DATA_DIR.mkdir(parents=True, exist_ok=True)

        if dry_run:
            UNAVAILABLE_PATH.write_text(json.dumps(sorted(unavailable), indent=2), encoding="utf-8")
            print("\n--dry-run set: no files downloaded.")
            print(f"Unavailable-companies list written to {UNAVAILABLE_PATH}")
            return

        dl_semaphore = asyncio.Semaphore(DOWNLOAD_CONCURRENCY)
        print(f"\nDownloading {len(records)} PDFs (concurrency={DOWNLOAD_CONCURRENCY})...")
        done = 0
        for coro in asyncio.as_completed([download_one(client, rec, dl_semaphore) for rec in records]):
            await coro
            done += 1
            if done % 50 == 0 or done == len(records):
                print(f"  {done}/{len(records)}")

    failed = [r for r in records if r.status.startswith("failed")]
    succeeded = [r for r in records if r.status in ("downloaded", "skipped_exists")]

    UNAVAILABLE_PATH.write_text(json.dumps(sorted(unavailable), indent=2), encoding="utf-8")
    MANIFEST_PATH.write_text(json.dumps([asdict(r) for r in succeeded], indent=2), encoding="utf-8")

    print(f"\nDownloaded/verified: {len(succeeded)}/{len(records)}. Failed: {len(failed)}.")
    print(f"Manifest: {MANIFEST_PATH}")
    print(f"Unavailable-companies list: {UNAVAILABLE_PATH}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="Only print scope, don't download anything.")
    parser.add_argument("--symbol", type=str, help="Fetch one company by symbol, for testing.")
    parser.add_argument("--concurrency", type=int, default=DOWNLOAD_CONCURRENCY, help="Parallel downloads.")
    args = parser.parse_args()

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(run(dry_run=args.dry_run, only_symbol=args.symbol, concurrency=args.concurrency))


if __name__ == "__main__":
    main()
