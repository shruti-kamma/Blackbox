"""
Turns extracted PwD/accessibility signals (services/crawler/scripts/
extract_pwd_signals.py output) into the 10-metric accessibility score shown
on the rankings site.

Pipeline per company:
  1. Load its most recent extraction JSON (services/crawler/data/pwd_extractions).
  2. For each of the 10 metrics, hand the relevant extracted fields to Claude
     and ask for a 0-100 subscore + one-line rationale (+ a recommendation
     when the subscore is below 75) — one structured-output call per
     company scores all 10 metrics at once, not 10 separate calls.
  3. overall_score is the mean of the 10 subscores (equivalent to the
     client's "10 metrics, 10 points each, sum to 100" model, just
     expressed on the same 0-100-per-metric scale the rankings site
     already displays, rather than 0-10).
  4. After every requested company is scored, compute each metric's peer
     average across that same run and attach it to every company's
     breakdown (see PEER AVERAGE CAVEAT below).

PEER AVERAGE CAVEAT: the BRSR crawler manifest has no industry/sector
classification (NSE's API doesn't provide one), so there's no real
industry grouping to average within yet. What's computed here is a
*national* peer average across whatever companies are in the current run,
used as a stand-in for the rankings site's "industry average" field until
real industry classification exists in the pipeline. Don't read too much
into it for small/filtered runs (e.g. --company only compares a company
to itself).

Usage:
    python scripts/score_orgs.py --mock --pilot 10   # verify plumbing, no API calls
    python scripts/score_orgs.py --pilot 10           # real run, random sample
    python scripts/score_orgs.py --company MFSL
    python scripts/score_orgs.py --all                 # every extracted company
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from anthropic import Anthropic

CRAWLER_DATA_DIR = Path(__file__).resolve().parents[2] / "crawler" / "data"
EXTRACTIONS_DIR = CRAWLER_DATA_DIR / "pwd_extractions"
SCORES_DIR = Path(__file__).resolve().parent.parent / "data" / "scores"

MODEL = "claude-opus-4-8"  # same house default as extraction — not yet migrated to Gemini 3.1 Pro, see docs/decisions.md
METHODOLOGY_VERSION = "v1-10metric"

# Must stay in sync with METRIC_FIELDS in
# services/crawler/scripts/extract_pwd_signals.py — duplicated rather than
# cross-imported since crawler and scoring-agent are separate services with
# separate environments (same pattern the Prisma schema/TS types already
# tolerate for AccessibilityScore.breakdown — see docs/plans/rankings-site-v1.md).
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
METRIC_NAMES = list(METRIC_FIELDS.keys())

SCORING_SCHEMA = {
    "type": "object",
    "properties": {
        "scores": {
            "type": "array",
            "description": "Exactly one entry per metric, in the order given.",
            "items": {
                "type": "object",
                "properties": {
                    "metric": {"type": "string", "enum": METRIC_NAMES},
                    "subscore": {
                        "type": "integer",
                        "description": "0-100. 0 if nothing relevant was disclosed for this metric.",
                    },
                    "rationale": {
                        "type": "string",
                        "description": "One or two sentences citing what was (or wasn't) disclosed. If nothing was disclosed, say so plainly rather than speculating.",
                    },
                    "recommendation": {
                        "type": ["string", "null"],
                        "description": "One concrete, actionable next step to raise this metric. Required (non-null) when subscore < 75; null otherwise.",
                    },
                },
                "required": ["metric", "subscore", "rationale", "recommendation"],
                "additionalProperties": False,
            },
            "minItems": 10,
            "maxItems": 10,
        },
    },
    "required": ["scores"],
    "additionalProperties": False,
}

SCORING_PROMPT = """You are scoring one company's disability-inclusion/accessibility disclosure \
across 10 metrics, using only the extracted signals below (each already pulled from that \
company's BRSR filing — you are not re-reading the filing itself).

For each metric, assign a 0-100 subscore based on the specificity and substance of what was \
disclosed, not just whether a box was checked:
- 0: nothing relevant disclosed for this metric.
- 1-40: vague or boilerplate mention with no concrete specifics (e.g. "the company values \
inclusion" with no process, number, or commitment attached).
- 41-74: a concrete disclosure exists but is limited in scope, detail, or verifiability (e.g. \
a policy exists but no response-time commitment; a headcount is given with no context).
- 75-100: specific, detailed, and verifiable — named contacts, dated commitments, numeric \
targets with attainment reported, audited claims.

Do not let a strong disclosure in one metric cause you to assume a related metric is also \
covered — score each metric only on its own extracted fields, provided below.

Give a recommendation (one concrete next step) for every metric scoring below 75; leave it \
null for metrics at or above 75, since there's nothing urgent to recommend.

Extracted signals, grouped by metric:
"""


def build_scoring_context(extraction: dict) -> str:
    lines = []
    for metric, fields in METRIC_FIELDS.items():
        lines.append(f"\n## {metric}")
        for field in fields:
            lines.append(f"- {field}: {extraction.get(field)!r}")
    return "\n".join(lines)


def score_signals(client: Anthropic, extraction: dict) -> dict:
    context = build_scoring_context(extraction)
    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        output_config={"format": {"type": "json_schema", "schema": SCORING_SCHEMA}},
        messages=[{"role": "user", "content": SCORING_PROMPT + context}],
    )
    text_block = next(b for b in response.content if b.type == "text")
    return json.loads(text_block.text)


def mock_score_signals(extraction: dict) -> dict:
    """Deterministic fake scoring — no API call, no cost. A metric scores
    55 if any of its fields are truthy/non-null, 10 otherwise; content is
    clearly [MOCK] so it can't be mistaken for a real result."""
    scores = []
    for metric, fields in METRIC_FIELDS.items():
        disclosed = any(extraction.get(f) for f in fields)
        subscore = 55 if disclosed else 10
        scores.append(
            {
                "metric": metric,
                "subscore": subscore,
                "rationale": "[MOCK] placeholder rationale standing in for real scoring reasoning",
                "recommendation": None if subscore >= 75 else "[MOCK] placeholder recommendation",
            }
        )
    return {"scores": scores}


@dataclass
class ExtractionRecord:
    path: Path
    symbol: str
    company_name: str
    fy_from: int
    fy_to: int
    extraction: dict


def load_latest_extractions() -> list[ExtractionRecord]:
    """One record per symbol — the most recent fiscal year available."""
    latest: dict[str, ExtractionRecord] = {}
    for path in sorted(EXTRACTIONS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        record = ExtractionRecord(
            path=path,
            symbol=data["symbol"],
            company_name=data["company_name"],
            fy_from=data["fy_from"],
            fy_to=data["fy_to"],
            extraction=data["extraction"],
        )
        existing = latest.get(record.symbol)
        if existing is None or (record.fy_from, record.fy_to) > (existing.fy_from, existing.fy_to):
            latest[record.symbol] = record
    return sorted(latest.values(), key=lambda r: r.symbol)


def score_one(client: Anthropic | None, record: ExtractionRecord, mock: bool) -> dict:
    result = mock_score_signals(record.extraction) if mock else score_signals(client, record.extraction)  # type: ignore[arg-type]
    subscores = [s["subscore"] for s in result["scores"]]
    overall_score = round(sum(subscores) / len(subscores), 1)
    return {
        "symbol": record.symbol,
        "company_name": record.company_name,
        "fy_from": record.fy_from,
        "fy_to": record.fy_to,
        "overall_score": overall_score,
        "methodology_version": METHODOLOGY_VERSION,
        "generated_by": "scoring-agent@v1-mock" if mock else "scoring-agent@v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "mock": mock,
        "breakdown": [
            {
                "category": s["metric"],
                "subscore": s["subscore"],
                "rationale": s["rationale"],
                "recommendation": s["recommendation"],
            }
            for s in result["scores"]
        ],
    }


def compute_peer_averages(results: list[dict]) -> dict[str, float]:
    sums: dict[str, float] = {}
    counts: dict[str, int] = {}
    for r in results:
        for item in r["breakdown"]:
            sums[item["category"]] = sums.get(item["category"], 0) + item["subscore"]
            counts[item["category"]] = counts.get(item["category"], 0) + 1
    return {k: round(sums[k] / counts[k], 1) for k in sums}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--pilot", type=int, help="Score N randomly sampled companies.")
    group.add_argument("--company", type=str, help="Score one company by symbol.")
    group.add_argument("--all", action="store_true", help="Score every company with an available extraction.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for --pilot sampling.")
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Skip the Claude API call; use deterministic fake output to test the scoring plumbing without an API key or cost.",
    )
    args = parser.parse_args()

    if not EXTRACTIONS_DIR.exists():
        print(f"No extractions directory found at {EXTRACTIONS_DIR} — run extract_pwd_signals.py first.", file=sys.stderr)
        sys.exit(1)

    all_records = load_latest_extractions()
    if not all_records:
        print(f"No extraction JSON files found in {EXTRACTIONS_DIR}.", file=sys.stderr)
        sys.exit(1)

    if args.company:
        records = [r for r in all_records if r.symbol == args.company]
        if not records:
            print(f"No extraction found for symbol={args.company}", file=sys.stderr)
            sys.exit(1)
    elif args.pilot:
        rng = random.Random(args.seed)
        records = rng.sample(all_records, min(args.pilot, len(all_records)))
    else:
        records = all_records

    client = None if args.mock else Anthropic()
    mode = "MOCK (no API calls, no cost)" if args.mock else f"model={MODEL}"
    print(f"Scoring {len(records)} company/companies — {mode}...")

    results = []
    for i, record in enumerate(records, 1):
        print(f"  [{i}/{len(records)}] {record.symbol}...", end=" ")
        try:
            out = score_one(client, record, mock=args.mock)
            results.append(out)
            print(f"ok (overall={out['overall_score']})")
        except Exception as exc:  # noqa: BLE001
            print(f"FAILED: {exc}")

    if len(records) < len(all_records):
        print(
            f"\nNote: peer averages below are computed across only this run's "
            f"{len(results)} companies, not the full {len(all_records)} available — "
            f"treat them as illustrative, not real industry benchmarks, for a filtered run."
        )

    peer_averages = compute_peer_averages(results)
    for r in results:
        for item in r["breakdown"]:
            item["industry_average"] = peer_averages[item["category"]]

    SCORES_DIR.mkdir(parents=True, exist_ok=True)
    for r in results:
        slug = r["symbol"]
        (SCORES_DIR / f"{slug}.json").write_text(json.dumps(r, indent=2), encoding="utf-8")

    print(f"\nDone. {len(results)} score(s) written to {SCORES_DIR}")


if __name__ == "__main__":
    main()
