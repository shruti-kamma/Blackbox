"""
Extracts PwD / accessibility / inclusion signals from a company's BRSR
filing and, when available, its annual report (services/crawler/scripts/
fetch_annual_reports.py) — one combined extraction per company, not two
separate ones (see docs/decisions.md — "Reading annual reports alongside
BRSR").

Pipeline per company:
  1. Read page-level text (PyMuPDF) from the BRSR PDF, and from the annual
     report PDF if one was downloaded for this symbol.
  2. Triage each document independently: flag pages matching
     data/keywords/pwd_accessibility_keywords.json, plus the whole
     Principle 3 and Principle 5 sections (BRSR's mandated disability/
     wellbeing/human-rights sections) regardless of keyword hits — some
     annual reports embed a BRSR-referenced appendix with the same
     section headers, so this anchor search applies to both document
     types, not just the BRSR filing itself.
  3. Build one trimmed PDF per available source, each page stamped with
     its source name and original page number (so citations in the LLM
     output map back to the correct source document even after trimming
     and even when two documents are involved).
  4. Send all available trimmed PDFs (one or two) to Claude in a single
     call with a fixed JSON schema via structured outputs
     (output_config.format) — one combined extraction per company, not
     a separate call per source, so the model can reconcile/cross-check
     rather than produce two disconnected answers.
  5. Save the structured result + a triage/run manifest.

If a document's extracted text is near-empty (likely a scanned/image PDF),
triage falls back to including every page rather than guessing.

Usage:
    python scripts/extract_pwd_signals.py --pilot 10          # random sample
    python scripts/extract_pwd_signals.py --company MFSL --fy 2025-2026
    python scripts/extract_pwd_signals.py --all               # full run (use Batches API instead — see docs)
"""

from __future__ import annotations

import argparse
import json
import random
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

import fitz  # PyMuPDF
from anthropic import Anthropic

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
REPORTS_DIR = DATA_DIR / "reports"
MANIFEST_PATH = DATA_DIR / "brsr_reports_manifest.json"
ANNUAL_REPORTS_MANIFEST_PATH = DATA_DIR / "annual_reports_manifest.json"
KEYWORDS_PATH = DATA_DIR / "keywords" / "pwd_accessibility_keywords.json"
TRIMMED_DIR = DATA_DIR / "trimmed_pdfs"
EXTRACTIONS_DIR = DATA_DIR / "pwd_extractions"

MODEL = "claude-opus-4-8"
NEAR_EMPTY_CHARS_PER_PAGE = 20  # below this average, assume scanned/image PDF

# Which extracted fields feed each of the 10 scoring metrics (see
# docs/decisions.md — "Scoring methodology"). The scoring agent
# (services/scoring-agent/scripts/score_orgs.py) reads this same mapping so
# the two pipeline stages can't silently drift apart. Two metrics —
# Employee Feedback and, more so, Culture — are expected to have low
# disclosure rates from BRSR text alone; that's a known, honest limitation
# of a public-filings-only MVP, not a bug in the extraction.
METRIC_FIELDS = {
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

EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "policy_exists": {
            "type": "boolean",
            "description": "True if the report states the company has a written disability/accessibility/inclusion policy.",
        },
        "policy_summary": {"type": ["string", "null"]},
        "accommodation_process_described": {
            "type": "boolean",
            "description": "True if the report describes a concrete process for providing workplace accommodations to employees with disabilities.",
        },
        "accommodation_process_summary": {"type": ["string", "null"]},
        "pwd_employee_count_stated": {
            "type": "boolean",
            "description": "True if the report states a specific number/percentage of employees or workers with disabilities.",
        },
        "pwd_employee_count_details": {"type": ["string", "null"]},
        "physical_accessibility_measures": {
            "type": ["string", "null"],
            "description": "Ramps, accessible restrooms, elevators, barrier-free infrastructure, etc. Null if not mentioned.",
        },
        "digital_accessibility_measures": {
            "type": ["string", "null"],
            "description": "Screen-reader support, accessible website/app, assistive technology provided, etc. Null if not mentioned.",
        },
        "training_or_sensitization_programs": {
            "type": ["string", "null"],
            "description": "Disability sensitization training, inclusive-hiring training, etc. Null if not mentioned.",
        },
        "recruitment_disclosed": {
            "type": "boolean",
            "description": "True if the report describes disability-specific hiring targets, outreach, or accessible interview/recruitment processes.",
        },
        "recruitment_details": {
            "type": ["string", "null"],
            "description": "Hiring targets and whether attainment against them is reported, disability-specific outreach, accessible interview accommodations. Null if not mentioned.",
        },
        "retention_disclosed": {
            "type": "boolean",
            "description": "True if the report states retention/attrition data, tenure, or promotion outcomes specific to employees with disabilities.",
        },
        "retention_details": {"type": ["string", "null"]},
        "leadership_representation_disclosed": {
            "type": "boolean",
            "description": "True if the report states PwD representation specifically in senior/leadership/management roles — distinct from overall workforce headcount.",
        },
        "leadership_representation_details": {"type": ["string", "null"]},
        "culture_practices_disclosed": {
            "type": "boolean",
            "description": "True if the report describes ongoing inclusive-workplace practices — employee resource groups, flexible work arrangements, accommodation response-time commitments, recognition programs. Distinct from policy_exists (written policy) and training_or_sensitization_programs (formal training).",
        },
        "culture_practices_details": {"type": ["string", "null"]},
        "employee_feedback_disclosed": {
            "type": "boolean",
            "description": "True if the report discloses employee satisfaction/grievance/feedback data specific to employees with disabilities (e.g. survey results, grievance counts and resolution). Expected to be rare in BRSR filings — leave false/null rather than inferring from general employee-satisfaction disclosures that don't mention disability.",
        },
        "employee_feedback_details": {"type": ["string", "null"]},
        "compliance_disclosed": {
            "type": "boolean",
            "description": "True if the report states compliance status against a specific statutory/regulatory requirement — RPwD Act employment quota attainment, a claimed WCAG conformance level, or explicit BRSR Principle 3/5 completeness. Distinct from policy_exists (having a policy is not the same as stating legal compliance).",
        },
        "compliance_details": {"type": ["string", "null"]},
        "evidence": {
            "type": "array",
            "description": "One entry per field above that was populated from the text (skip fields that are null/false with no basis). A field can have more than one evidence entry if both source documents mention it.",
            "items": {
                "type": "object",
                "properties": {
                    "field": {"type": "string"},
                    "quote": {"type": "string"},
                    "original_page": {"type": ["integer", "null"]},
                    "source": {
                        "type": "string",
                        "enum": ["BRSR", "Annual Report"],
                        "description": "Which stamped source document this page/quote came from — see the stamp in the page's top margin.",
                    },
                },
                "required": ["field", "quote", "original_page", "source"],
                "additionalProperties": False,
            },
        },
        "no_disclosure_found": {
            "type": "boolean",
            "description": "True only if none of the above fields could be populated from the provided pages.",
        },
    },
    "required": [
        "policy_exists",
        "policy_summary",
        "accommodation_process_described",
        "accommodation_process_summary",
        "pwd_employee_count_stated",
        "pwd_employee_count_details",
        "physical_accessibility_measures",
        "digital_accessibility_measures",
        "training_or_sensitization_programs",
        "recruitment_disclosed",
        "recruitment_details",
        "retention_disclosed",
        "retention_details",
        "leadership_representation_disclosed",
        "leadership_representation_details",
        "culture_practices_disclosed",
        "culture_practices_details",
        "employee_feedback_disclosed",
        "employee_feedback_details",
        "compliance_disclosed",
        "compliance_details",
        "evidence",
        "no_disclosure_found",
    ],
    "additionalProperties": False,
}

EXTRACTION_PROMPT = """You are reviewing pages from one or two of an Indian company's public \
disclosures: its Business Responsibility & Sustainability Report (BRSR) filing, and/or its \
annual report — you may be given pages from only one of these, or both. Each page image is \
stamped in its top margin with its source and original page number, formatted as \
"SOURCE — Original page: N" (e.g. "BRSR — Original page: 47" or \
"Annual Report — Original page: 12"). Use the stamped source for every evidence entry's \
"source" field, and the stamped N — not the page's position in this trimmed excerpt — for \
"original_page". If both documents cover the same fact, you may cite either or both; prefer \
whichever is more specific/detailed.

Extract what the report(s) say about persons with disabilities (PwD) / accessibility / \
inclusion, across these areas: stated policies and accommodation processes; PwD employee \
headcounts; physical and digital accessibility measures; training/sensitization programs; \
recruitment (hiring targets and whether attainment is reported, disability-specific \
outreach); retention (attrition/tenure/promotion data specific to PwD employees); \
leadership representation (PwD presence specifically in senior/management roles, not just \
overall headcount); culture (ongoing practices like ERGs, flexible work, accommodation \
response-time commitments — distinct from having a written policy or running training); \
employee feedback (satisfaction/grievance data specific to PwD employees — expect this to be \
rare, don't infer it from general employee-satisfaction disclosures); and compliance (stated \
adherence to a specific statutory requirement — RPwD Act quota attainment, a claimed WCAG \
conformance level — not just having a policy).

Only report what the text actually states — do not infer or assume industry-typical \
practices, and do not let a strong signal in one area (e.g. a detailed accessibility policy) \
cause you to assume disclosure in a different area (e.g. compliance or retention) that the \
text doesn't actually address. If a field genuinely isn't addressed anywhere in these pages, \
leave it null/false rather than guessing."""


@dataclass
class TriageResult:
    flagged_pages: list[int]  # 0-indexed
    total_pages: int
    ocr_fallback: bool
    matched_keywords: list[str]


def load_keywords() -> list[str]:
    data = json.loads(KEYWORDS_PATH.read_text(encoding="utf-8"))
    return [kw.lower() for kw in data["disability_terms"] + data["accessibility_terms"]]


def find_section_pages(page_texts: list[str], start_markers: list[str], end_markers: list[str]) -> set[int]:
    """Pages from the first page matching a start marker up to (excluding) the
    first later page matching an end marker. Case-insensitive substring match."""
    start_markers = [m.lower() for m in start_markers]
    end_markers = [m.lower() for m in end_markers]

    start_idx = None
    for i, text in enumerate(page_texts):
        low = text.lower()
        if any(m in low for m in start_markers):
            start_idx = i
            break
    if start_idx is None:
        return set()

    end_idx = len(page_texts)
    for i in range(start_idx + 1, len(page_texts)):
        low = page_texts[i].lower()
        if any(m in low for m in end_markers):
            end_idx = i
            break

    return set(range(start_idx, end_idx))


def triage(pdf_path: Path, keywords: list[str]) -> TriageResult:
    doc = fitz.open(pdf_path)
    page_texts = [page.get_text() for page in doc]
    total_pages = len(page_texts)

    avg_chars = sum(len(t) for t in page_texts) / max(total_pages, 1)
    if avg_chars < NEAR_EMPTY_CHARS_PER_PAGE:
        doc.close()
        return TriageResult(
            flagged_pages=list(range(total_pages)),
            total_pages=total_pages,
            ocr_fallback=True,
            matched_keywords=[],
        )

    flagged: set[int] = set()
    matched_keywords: set[str] = set()
    for i, text in enumerate(page_texts):
        low = text.lower()
        for kw in keywords:
            if kw in low:
                flagged.add(i)
                matched_keywords.add(kw)

    flagged |= find_section_pages(page_texts, ["principle 3"], ["principle 4"])
    flagged |= find_section_pages(page_texts, ["principle 5"], ["principle 6"])

    doc.close()
    return TriageResult(
        flagged_pages=sorted(flagged),
        total_pages=total_pages,
        ocr_fallback=False,
        matched_keywords=sorted(matched_keywords),
    )


def build_trimmed_pdf(pdf_path: Path, flagged_pages: list[int], out_path: Path, source_label: str) -> None:
    src = fitz.open(pdf_path)
    trimmed = fitz.open()
    for page_num in flagged_pages:
        trimmed.insert_pdf(src, from_page=page_num, to_page=page_num)
        new_page = trimmed[-1]
        new_page.insert_text(
            (36, 24),
            f"{source_label} — Original page: {page_num + 1}",
            fontsize=9,
            color=(0.7, 0, 0),
        )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    trimmed.save(out_path)
    trimmed.close()
    src.close()


def extract_signals(client: Anthropic, trimmed_pdf_paths: list[Path]) -> dict:
    """One call covers every available trimmed source PDF for this company
    (BRSR, and the annual report when one was downloaded) — not one call
    per source — so the model reconciles both rather than producing two
    disconnected answers. `trimmed_pdf_paths` is 1 or 2 paths."""
    import base64

    document_blocks = [
        {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": base64.b64encode(path.read_bytes()).decode("ascii"),
            },
        }
        for path in trimmed_pdf_paths
    ]

    response = client.messages.create(
        model=MODEL,
        # Bumped for two-source runs — more input pages means more
        # potential evidence entries, not just a longer single document.
        max_tokens=10240,
        output_config={"format": {"type": "json_schema", "schema": EXTRACTION_SCHEMA}},
        messages=[
            {
                "role": "user",
                "content": [*document_blocks, {"type": "text", "text": EXTRACTION_PROMPT}],
            }
        ],
    )
    text_block = next(b for b in response.content if b.type == "text")
    return json.loads(text_block.text)


def mock_extract_signals(sources: list[tuple[str, TriageResult]]) -> dict:
    """Deterministic fake extraction — no API call, no cost. Exercises the
    downstream JSON shape/plumbing only; the content is not real analysis
    and every field is clearly marked [MOCK] so it can't be mistaken for a
    real result later. `sources` is [("BRSR", tri), ...] — one or two
    entries, matching whatever was actually triaged for this company."""
    all_keywords = {kw for _, tri in sources for kw in tri.matched_keywords}
    disability_hit = any(
        kw in ("persons with disabilities", "differently abled", "disability", "disabilities", "pwd", "pwds")
        for kw in all_keywords
    )
    accessibility_hit = any(
        kw in ("accessibility", "accessible", "barrier-free", "barrier free", "ramp")
        for kw in all_keywords
    )
    # First source with at least one flagged page, for a plausible sample citation.
    sample_source, sample_page = next(
        ((label, tri.flagged_pages[0] + 1) for label, tri in sources if tri.flagged_pages),
        (sources[0][0], None),
    )

    evidence = []
    if disability_hit:
        evidence.append(
            {
                "field": "policy_summary",
                "quote": "[MOCK] placeholder quote standing in for a real disability-related excerpt",
                "original_page": sample_page,
                "source": sample_source,
            }
        )
    if accessibility_hit:
        evidence.append(
            {
                "field": "physical_accessibility_measures",
                "quote": "[MOCK] placeholder quote standing in for a real accessibility-related excerpt",
                "original_page": sample_page,
                "source": sample_source,
            }
        )

    return {
        "policy_exists": disability_hit,
        "policy_summary": "[MOCK] placeholder policy summary" if disability_hit else None,
        "accommodation_process_described": False,
        "accommodation_process_summary": None,
        "pwd_employee_count_stated": False,
        "pwd_employee_count_details": None,
        "physical_accessibility_measures": "[MOCK] placeholder accessibility-measures summary" if accessibility_hit else None,
        "digital_accessibility_measures": None,
        "training_or_sensitization_programs": None,
        # New-metric fields all default to undisclosed in mock mode — the
        # deterministic keyword-hit heuristic above isn't fine-grained enough
        # to fake these meaningfully, and the mock's job is exercising the
        # JSON shape/plumbing, not producing plausible content.
        "recruitment_disclosed": False,
        "recruitment_details": None,
        "retention_disclosed": False,
        "retention_details": None,
        "leadership_representation_disclosed": False,
        "leadership_representation_details": None,
        "culture_practices_disclosed": False,
        "culture_practices_details": None,
        "employee_feedback_disclosed": False,
        "employee_feedback_details": None,
        "compliance_disclosed": False,
        "compliance_details": None,
        "evidence": evidence,
        "no_disclosure_found": not (disability_hit or accessibility_hit),
    }


def load_annual_report_lookup() -> dict[str, dict]:
    """symbol -> that company's annual report manifest record. Empty dict
    (not an error) if fetch_annual_reports.py hasn't been run yet —
    extraction degrades to BRSR-only, same as before that script existed."""
    if not ANNUAL_REPORTS_MANIFEST_PATH.exists():
        return {}
    records = json.loads(ANNUAL_REPORTS_MANIFEST_PATH.read_text(encoding="utf-8"))
    return {r["symbol"]: r for r in records}


def process_one(
    client: Anthropic | None,
    record: dict,
    annual_report_lookup: dict[str, dict],
    mock: bool = False,
) -> dict:
    slug = Path(record["local_path"]).stem
    keywords = load_keywords()

    # (label, source pdf path, triage result) — one entry for BRSR
    # (always), a second for the annual report when one was downloaded
    # for this symbol and the file actually exists on disk.
    sources: list[tuple[str, Path, TriageResult]] = []

    brsr_path = DATA_DIR / record["local_path"]
    sources.append(("BRSR", brsr_path, triage(brsr_path, keywords)))

    ar_record = annual_report_lookup.get(record["symbol"])
    if ar_record is not None:
        ar_path = DATA_DIR / ar_record["local_path"]
        if ar_path.exists():
            sources.append(("Annual Report", ar_path, triage(ar_path, keywords)))

    trimmed_paths: list[Path] = []
    for label, src_path, tri in sources:
        suffix = label.lower().replace(" ", "_")
        trimmed_path = TRIMMED_DIR / f"{slug}-{suffix}.pdf"
        build_trimmed_pdf(src_path, tri.flagged_pages, trimmed_path, source_label=label)
        trimmed_paths.append(trimmed_path)

    if mock:
        result = mock_extract_signals([(label, tri) for label, _, tri in sources])
    else:
        assert client is not None
        result = extract_signals(client, trimmed_paths)

    used_annual_report = len(sources) > 1
    EXTRACTIONS_DIR.mkdir(parents=True, exist_ok=True)
    out = {
        "symbol": record["symbol"],
        "company_name": record["company_name"],
        "fy_from": record["fy_from"],
        "fy_to": record["fy_to"],
        "source_pdf": record["local_path"],
        "annual_report_pdf": ar_record["local_path"] if used_annual_report else None,
        "sources_used": [label for label, _, _ in sources],
        "mock": mock,
        "triage": {label.lower().replace(" ", "_"): asdict(tri) for label, _, tri in sources},
        "extraction": result,
    }
    (EXTRACTIONS_DIR / f"{slug}.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--pilot", type=int, help="Run on N randomly sampled companies.")
    group.add_argument("--company", type=str, help="Run on one company by symbol.")
    group.add_argument("--all", action="store_true", help="Run on every company (expensive — see docs on Batches API instead).")
    parser.add_argument("--fy", type=str, help="With --company: fiscal year as 'from-to', e.g. 2025-2026. Defaults to most recent.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for --pilot sampling.")
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Skip the Claude API call; use deterministic fake output to test triage/trim/file-output plumbing without an API key or cost.",
    )
    args = parser.parse_args()

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    if args.company:
        candidates = [r for r in manifest if r["symbol"] == args.company]
        if args.fy:
            fy_from, fy_to = (int(x) for x in args.fy.split("-"))
            candidates = [r for r in candidates if r["fy_from"] == fy_from and r["fy_to"] == fy_to]
        if not candidates:
            print(f"No matching record for symbol={args.company} fy={args.fy}", file=sys.stderr)
            sys.exit(1)
        records = [max(candidates, key=lambda r: (r["fy_from"], r["fy_to"]))]
    elif args.pilot:
        by_symbol: dict[str, list[dict]] = {}
        for r in manifest:
            by_symbol.setdefault(r["symbol"], []).append(r)
        rng = random.Random(args.seed)
        symbols = rng.sample(sorted(by_symbol.keys()), min(args.pilot, len(by_symbol)))
        records = [max(by_symbol[s], key=lambda r: (r["fy_from"], r["fy_to"])) for s in symbols]
    else:
        records = manifest

    annual_report_lookup = load_annual_report_lookup()
    if annual_report_lookup:
        print(f"Annual reports available for {len(annual_report_lookup)} companies — will be included where the symbol matches.")
    else:
        print(f"No annual report manifest found at {ANNUAL_REPORTS_MANIFEST_PATH} — BRSR-only for this run.")

    client = None if args.mock else Anthropic()
    mode = "MOCK (no API calls, no cost)" if args.mock else f"model={MODEL}"
    print(f"Processing {len(records)} compan(y/ies) — {mode}...")
    for i, record in enumerate(records, 1):
        print(f"  [{i}/{len(records)}] {record['symbol']} FY{record['fy_from']}-{record['fy_to']}...", end=" ")
        try:
            out = process_one(client, record, annual_report_lookup, mock=args.mock)
            brsr_tri = out["triage"]["brsr"]
            pages_str = f"brsr={len(brsr_tri['flagged_pages'])}/{brsr_tri['total_pages']}"
            ar_tri = out["triage"].get("annual_report")
            if ar_tri:
                pages_str += f", ar={len(ar_tri['flagged_pages'])}/{ar_tri['total_pages']}"
            print(f"ok (no_disclosure={out['extraction']['no_disclosure_found']}, {pages_str})")
        except Exception as exc:  # noqa: BLE001
            print(f"FAILED: {exc}")

    print(f"\nDone. Extractions written to {EXTRACTIONS_DIR}")


if __name__ == "__main__":
    main()
