"""
Classifies the BRSR pipeline's 413-company universe into industries using
NSE's public sectoral index constituent lists — free, no LLM call, no API
key required (see docs/decisions.md — "Industry classification for the
50-company MVP batch"). The BRSR/annual-report manifests have no industry
field at all (NSE's filings API doesn't provide one); this fills that gap
by cross-referencing against NSE's own index-constituent data instead of
guessing from company names or spending LLM budget on it.

A company is classified into whichever candidate sectoral index it's a
constituent of; if it appears in more than one, the first match in
CANDIDATE_INDICES wins (broad sector indices like NIFTY FINANCIAL SERVICES
are ordered after narrower ones like NIFTY BANK/NIFTY PRIVATE BANK so a
bank doesn't get bucketed into the broader financial-services catch-all
if it already has a narrower home). Not every crawled company will be a
constituent of any candidate index — that's expected, not a bug.

Usage:
    python scripts/fetch_sector_classification.py                # fetch + write manifest
    python scripts/fetch_sector_classification.py --dry-run       # fetch + report coverage only
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

import httpx

NSE_HOME_URL = "https://www.nseindia.com/"
NSE_INDICES_PAGE_URL = "https://www.nseindia.com/market-data/live-equity-market"
NSE_API_URL = "https://www.nseindia.com/api/equity-stock-indices"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
BRSR_MANIFEST_PATH = DATA_DIR / "brsr_reports_manifest.json"
OUTPUT_PATH = DATA_DIR / "sector_classification.json"

# Narrower indices listed before the broader ones they'd otherwise get
# swallowed by (see module docstring). Map display name -> the API's
# `indexSymbol` query value: NSE's equity-stock-indices endpoint only
# accepts the abbreviated indexSymbol form for some indices (e.g. "NIFTY
# FIN SERVICE", not the display name "NIFTY FINANCIAL SERVICES" — passing
# the display name silently returns an empty constituent list instead of
# an error). Confirmed against /api/allIndices, where each row carries
# both `index` (display) and `indexSymbol` (the value this endpoint
# actually wants).
CANDIDATE_INDICES: dict[str, str] = {
    "NIFTY PRIVATE BANK": "NIFTY PVT BANK",
    "NIFTY PSU BANK": "NIFTY PSU BANK",
    "NIFTY BANK": "NIFTY BANK",
    "NIFTY IT": "NIFTY IT",
    "NIFTY PHARMA": "NIFTY PHARMA",
    "NIFTY FMCG": "NIFTY FMCG",
    "NIFTY AUTO": "NIFTY AUTO",
    "NIFTY METAL": "NIFTY METAL",
    "NIFTY REALTY": "NIFTY REALTY",
    "NIFTY MEDIA": "NIFTY MEDIA",
    "NIFTY ENERGY": "NIFTY ENERGY",
    "NIFTY HEALTHCARE INDEX": "NIFTY HEALTHCARE",
    "NIFTY OIL & GAS": "NIFTY OIL AND GAS",
    "NIFTY CONSUMER DURABLES": "NIFTY CONSR DURBL",
    "NIFTY CHEMICALS": "NIFTY CHEMICALS",
    "NIFTY FINANCIAL SERVICES": "NIFTY FIN SERVICE",
}

REQUEST_CONCURRENCY = 3
MAX_RETRIES = 3


def load_symbols() -> dict[str, str]:
    """symbol -> company_name for the BRSR pipeline's qualified universe."""
    if not BRSR_MANIFEST_PATH.exists():
        print(f"No BRSR manifest at {BRSR_MANIFEST_PATH} — run fetch_brsr_reports.py first.", file=sys.stderr)
        sys.exit(1)
    records = json.loads(BRSR_MANIFEST_PATH.read_text(encoding="utf-8"))
    out: dict[str, str] = {}
    for r in records:
        out[r["symbol"]] = r["company_name"]
    return out


async def bootstrap_session(client: httpx.AsyncClient) -> None:
    await client.get(NSE_HOME_URL)
    await client.get(NSE_INDICES_PAGE_URL)


async def fetch_index_constituents(
    client: httpx.AsyncClient, index: str, api_symbol: str, semaphore: asyncio.Semaphore
) -> tuple[str, list[str]]:
    """Returns (index, [symbol, ...]). Empty list on failure — logged, not fatal."""
    headers = {"Referer": NSE_INDICES_PAGE_URL, "Accept": "application/json, text/plain, */*"}
    async with semaphore:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = await client.get(NSE_API_URL, params={"index": api_symbol}, headers=headers, timeout=30)
                resp.raise_for_status()
                data = resp.json().get("data") or []
                symbols = [row["symbol"] for row in data if row.get("symbol")]
                return index, symbols
            except (httpx.HTTPError, httpx.TimeoutException, KeyError, ValueError) as exc:
                if attempt == MAX_RETRIES:
                    print(f"  {index}: failed after {MAX_RETRIES} attempts ({exc})", file=sys.stderr)
                    return index, []
                await asyncio.sleep(1.5 * attempt)
    return index, []


async def run(dry_run: bool) -> None:
    universe = load_symbols()
    print(f"Company universe: {len(universe)} symbol(s) (from the BRSR manifest).")

    async with httpx.AsyncClient(headers={"User-Agent": USER_AGENT}, follow_redirects=True, timeout=30) as client:
        print("Bootstrapping NSE session...")
        await bootstrap_session(client)

        print(f"Fetching {len(CANDIDATE_INDICES)} sectoral index constituent lists...")
        semaphore = asyncio.Semaphore(REQUEST_CONCURRENCY)
        results: dict[str, list[str]] = {}
        for coro in asyncio.as_completed(
            [
                fetch_index_constituents(client, idx, api_symbol, semaphore)
                for idx, api_symbol in CANDIDATE_INDICES.items()
            ]
        ):
            index, symbols = await coro
            results[index] = symbols
            print(f"  {index}: {len(symbols)} constituents (live NSE data)")

    # Assign each crawled symbol to the first candidate index (in priority
    # order) it's a constituent of.
    assigned: dict[str, str] = {}
    for index in CANDIDATE_INDICES:
        for symbol in results.get(index, []):
            if symbol in universe and symbol not in assigned:
                assigned[symbol] = index

    print("\nCoverage among the 413 crawled companies:")
    counts: dict[str, int] = {}
    for index in CANDIDATE_INDICES:
        count = sum(1 for v in assigned.values() if v == index)
        counts[index] = count
        marker = " <- has >=5, usable" if count >= 5 else ""
        print(f"  {index}: {count}{marker}")
    unclassified = len(universe) - len(assigned)
    print(f"  (unclassified: {unclassified})")

    usable = [idx for idx, c in counts.items() if c >= 5]
    print(f"\n{len(usable)} of {len(CANDIDATE_INDICES)} candidate indices have >=5 crawled companies.")

    if dry_run:
        print("\n--dry-run set: no manifest written.")
        return

    out = [
        {"symbol": symbol, "company_name": universe[symbol], "industry": index}
        for symbol, index in sorted(assigned.items())
    ]
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"\nWrote {len(out)} classified companies to {OUTPUT_PATH}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="Only print coverage, don't write the manifest.")
    args = parser.parse_args()

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(run(dry_run=args.dry_run))


if __name__ == "__main__":
    main()
