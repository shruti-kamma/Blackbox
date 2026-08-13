"""
One-off finalization pass for the manually-produced (no-API-key) scores on
the 50-company MVP batch: computes each metric's peer average across all
50 real scores and attaches it to every company's breakdown, matching
compute_peer_averages() in score_orgs.py — the manual pass wrote
"manual-claude@v1" score files without this field since it can only be
computed once every company in the batch is scored.

Only touches the 50 selected companies (services/crawler/data/
selected_companies_50.json) — ignores any other files sitting in
data/scores/ (e.g. stale mock-mode runs from before this batch existed).

Usage:
    python scripts/finalize_manual_scores.py            # writes industry_average into each file
    python scripts/finalize_manual_scores.py --check     # report missing/incomplete only, no writes
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SCORING_AGENT_DIR = Path(__file__).resolve().parent.parent
CRAWLER_DIR = SCORING_AGENT_DIR.parent / "crawler"
SCORES_DIR = SCORING_AGENT_DIR / "data" / "scores"
SELECTED_PATH = CRAWLER_DIR / "data" / "selected_companies_50.json"

METRIC_NAMES = [
    "Accessibility", "Policy", "Employment", "Recruitment", "Retention",
    "Leadership", "Learning", "Culture", "Employee Feedback", "Compliance",
]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true", help="Report status only, don't write.")
    args = parser.parse_args()

    selected = json.loads(SELECTED_PATH.read_text(encoding="utf-8"))
    symbols = [c["symbol"] for c in selected]

    missing = []
    records: dict[str, dict] = {}
    for sym in symbols:
        path = SCORES_DIR / f"{sym}.json"
        if not path.exists():
            missing.append(sym)
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("mock") is True or data.get("symbol") != sym:
            missing.append(f"{sym} (bad: mock={data.get('mock')} symbol_field={data.get('symbol')})")
            continue
        cats = [b["category"] for b in data["breakdown"]]
        if cats != METRIC_NAMES:
            missing.append(f"{sym} (bad breakdown order/categories: {cats})")
            continue
        records[sym] = data

    print(f"Expected: {len(symbols)}. Ready: {len(records)}. Missing/bad: {len(missing)}.")
    if missing:
        print("Missing/bad:", missing)

    if len(records) != len(symbols):
        print("\nNot all 50 are ready — stopping without writing." if not args.check else "")
        sys.exit(1 if not args.check else 0)

    if args.check:
        print("\nAll 50 ready. Re-run without --check to compute peer averages and finalize.")
        return

    # Peer average per metric across all 50 real scores (same formula as
    # score_orgs.py's compute_peer_averages, but scoped to this batch).
    sums = {m: 0.0 for m in METRIC_NAMES}
    counts = {m: 0 for m in METRIC_NAMES}
    for data in records.values():
        for item in data["breakdown"]:
            sums[item["category"]] += item["subscore"]
            counts[item["category"]] += 1
    peer_averages = {m: round(sums[m] / counts[m], 1) for m in METRIC_NAMES}

    print("\nPeer averages across the 50:")
    for m in METRIC_NAMES:
        print(f"  {m:20s} {peer_averages[m]}")

    for sym, data in records.items():
        for item in data["breakdown"]:
            item["industry_average"] = peer_averages[item["category"]]
        path = SCORES_DIR / f"{sym}.json"
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    print(f"\nFinalized {len(records)} score files with industry_average attached.")


if __name__ == "__main__":
    main()
