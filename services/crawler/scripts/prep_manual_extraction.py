"""
One-off prep for a manual (no-API-key) extraction pass on the 50-company
MVP batch: runs the same deterministic triage() + build_trimmed_pdf() logic
from extract_pwd_signals.py against BRSR filings only (annual reports
excluded from this pass to keep 50-company manual reading tractable),
and writes a trimmed, page-stamped PDF per company plus a summary manifest.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_pwd_signals import DATA_DIR, MANIFEST_PATH, TRIMMED_DIR, load_keywords, triage, build_trimmed_pdf

SELECTED_PATH = DATA_DIR / "selected_companies_50.json"
OUT_MANIFEST = DATA_DIR / "manual_extraction_prep.json"


def main() -> None:
    selected = json.loads(SELECTED_PATH.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    by_symbol: dict[str, list[dict]] = {}
    for r in manifest:
        by_symbol.setdefault(r["symbol"], []).append(r)

    keywords = load_keywords()
    out = []
    for c in selected:
        sym = c["symbol"]
        record = max(by_symbol[sym], key=lambda r: (r["fy_from"], r["fy_to"]))
        brsr_path = DATA_DIR / record["local_path"]
        tri = triage(brsr_path, keywords)

        # Zero flagged pages (and not already the OCR near-empty-text
        # fallback) means no keyword hit AND no "Principle 3"/"Principle 5"
        # section header was found as extractable text — rare, but
        # build_trimmed_pdf can't save a zero-page PDF, and silently
        # skipping the company would hide a real (if unlikely) filing
        # format quirk. Fall back to every page, same as the OCR case,
        # rather than crash or guess.
        pages_to_include = tri.flagged_pages
        no_signal_fallback = False
        if not pages_to_include and not tri.ocr_fallback:
            pages_to_include = list(range(tri.total_pages))
            no_signal_fallback = True

        trimmed_path = TRIMMED_DIR / f"{Path(record['local_path']).stem}-brsr.pdf"
        build_trimmed_pdf(brsr_path, pages_to_include, trimmed_path, source_label="BRSR")
        out.append({
            "symbol": sym,
            "company_name": record["company_name"],
            "fy_from": record["fy_from"],
            "fy_to": record["fy_to"],
            "source_pdf": record["local_path"],
            "trimmed_pdf": str(trimmed_path.relative_to(DATA_DIR)),
            "flagged_pages": len(tri.flagged_pages),
            "total_pages": tri.total_pages,
            "ocr_fallback": tri.ocr_fallback,
            "no_signal_fallback": no_signal_fallback,
            "pages_included": len(pages_to_include),
        })
        flag = " [NO KEYWORD/SECTION SIGNAL - full doc included]" if no_signal_fallback else ""
        print(f"{sym:15s} flagged={len(tri.flagged_pages):3d}/{tri.total_pages:3d} included={len(pages_to_include):3d}  -> {trimmed_path.name}{flag}")

    OUT_MANIFEST.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"\nWrote {len(out)} entries to {OUT_MANIFEST}")
    print(f"Total flagged pages across all 50: {sum(o['flagged_pages'] for o in out)}")


if __name__ == "__main__":
    main()
