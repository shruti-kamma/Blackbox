# BRSR accessibility-scoring pipeline

Feeds `apps/rankings` for Indian companies using their SEBI-mandated Business
Responsibility & Sustainability Reports (BRSR) as the data source. Three
tasks: crawl the reports, extract accessibility/PwD-related signal from them,
then score it. See `docs/roadmap.md` for current status.

## Task 1 — Crawler (done)

**Source**: NSE India's BRSR filings page is a React SPA; the actual data
comes from `GET https://www.nseindia.com/api/corporate-bussiness-sustainabilitiy`
(needs session cookies from a prior page visit + a `Referer` header, or it
403s — no login required). Params `from_date`/`to_date` (`DD-MM-YYYY`) filter
by submission date. Each row gives company, symbol, fiscal year, and both a
PDF (`attachmentFile`) and XBRL (`xbrlFile`) URL. The PDF host
(`nsearchives.nseindia.com`) needs no auth at all.

**Format**: PDF over XBRL — see `docs/decisions.md`.

**Scope rule**: only companies with a report for *every one* of the 3 most
recent fiscal years qualify (determined dynamically from the fetched data,
not hardcoded) — see `docs/decisions.md` for the continuous-filer rule.

**Script**: `services/crawler/scripts/fetch_brsr_reports.py`. Async,
idempotent (skips files already on disk), retries transient failures,
self-prunes any company that ends up without the full 3-year set (deletes
its partial files, moves it to the excluded list) so the manifest is always
internally consistent. Run with `--dry-run` to preview scope without
downloading.

**Output** (`services/crawler/data/`, gitignored):
- `reports/<company-slug>-<fyfrom>-<fyto>.pdf`
- `brsr_reports_manifest.json` — one row per downloaded file (status, size,
  sha256, source URL)
- `brsr_excluded_companies.json` — every company that didn't qualify, with
  which fiscal years it's missing and why (source never had it vs. the
  download failed even on retry)

**Result** (as of 2026-07-27): **413 companies, 1,239 PDFs** covering FY
2023-24, 2024-25, 2025-26. 870 companies excluded (partial filing history —
either the source never had a filing for one of the 3 years, or a download
failed even on retry; the script self-prunes so the manifest only ever
contains companies with the full 3-year set on disk).

## Task 2 — Extraction (built, pilot pending)

Goal: turn the 1,239 mostly-narrative PDFs into structured, per-company
accessibility/inclusion signal that Task 3 can score.

**Script**: `services/crawler/scripts/extract_pwd_signals.py`.

1. **Triage** (PyMuPDF, no API calls): scan page text against
   `services/crawler/data/keywords/pwd_accessibility_keywords.json`
   (disability + accessibility terms), and separately locate the full
   Principle 3 and Principle 5 sections by heading — BRSR's mandated
   employee-wellbeing and human-rights sections — as a floor, since SEBI
   requires at least token disclosure there even when a company says little.
   If a document's extracted text is near-empty (likely scanned/image PDF),
   triage falls back to including every page.
2. **Trim**: build a new PDF containing only flagged pages, each stamped
   with its original page number in the margin (so the LLM's page citations
   still map back to the source document post-trim).
3. **Extract**: one Claude call per document (`claude-opus-4-8`), trimmed
   PDF passed as a native `document` content block, structured output via
   `output_config.format` against a fixed JSON schema — policy exists,
   accommodation process, PwD headcount if stated, physical/digital
   accessibility measures, training programs, plus an `evidence` array of
   quotes + original page numbers for each populated field. Not free text,
   not a custom-tool call — a JSON-schema-constrained response.
4. **Output**: one JSON file per company-year in
   `services/crawler/data/pwd_extractions/`, shaped close to `CrawlFinding`
   (`category`, `rawContent`-equivalent via triage info, `extractedSignal`)
   so importing into Postgres later is a straight mapping, not a rework.

**Model/cost note**: `claude-opus-4-8` is the default per house convention
(never downgraded for cost without being asked). For the ~1,200-document
full run, switch from synchronous calls to the **Message Batches API**
(50% off, not latency-sensitive here) — the pilot script's `--all` flag
currently just loops synchronously and should be swapped to batches before
a full run; not done yet since the pilot output should be reviewed first.

**Status**: full pipeline (triage → trim → extract → write output) verified
end-to-end via `--mock` mode (deterministic fake extraction, no API calls) —
`--pilot 10 --mock` ran cleanly across 10 companies, output shape confirmed
correct. The real Claude extraction call is still untested against actual
document content.

**Open decision, deliberately deferred**: whether to run real extraction via
the Claude API (best quality — needed to catch nuance like negation and
distinguish genuine commitments from boilerplate, which a small/local model
is materially weaker at) vs. a self-hosted/local model (no per-call cost,
but slower and lower quality, plus an ongoing maintenance burden). Decision
is blocked on a cost analysis of the Claude API route (~1,239 documents via
the Batches API, see `docs/decisions.md`) once real pricing/quality can be
checked against a small paid pilot — not committing to a direction until
then. Next step: get an `ANTHROPIC_API_KEY`, run `--pilot 10` for real,
estimate full-run cost from the actual token usage, then decide.

## Task 3 — Scoring (not started)

Turn Task 2's structured extraction into `AccessibilityScore.breakdown` —
the rubric, category weights, and score formula. Depends on seeing what
Task 2 actually surfaces before defining categories for real (the categories
in `rankings-site-v1.md`'s methodology page are a placeholder guess).
