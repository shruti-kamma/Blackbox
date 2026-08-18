# Roadmap

Status snapshot, not a full backlog. Update as things move.

## Overall project

Three sites (see `docs/plans/`), agent services back them:

| Site | Status |
|---|---|
| `apps/job-portal` | Scaffolded only. Functionality not yet scoped beyond "hiring portal for PwDs." |
| `apps/rankings` | Public view **now reads real Postgres data** via `src/lib/get-orgs.ts` (falls back to the fictional `mock-orgs.ts` set if the DB is unreachable or empty — see decisions.md). Separate `/companies`/`/universities` leaderboards, org detail page in the client's "Snapshot" layout. 11 real companies loaded end-to-end (mock-scored, real API run still pending). Real orgs currently have null industry/location (no classification data in the pipeline yet) and no employee/AI-confidence/trend figures — UI degrades gracefully rather than guessing. Private company-view dashboard (the other 7 tabs) not started, gated behind company verification (mechanism TBD). |
| `apps/ngo-site` | Deferred, not started. |

| Agent | Status |
|---|---|
| `services/crawler` | FastAPI skeleton stubbed. Real first use: the BRSR pipeline below (currently a standalone script, not yet wired into the FastAPI service/DB). |
| `services/matching-agent` | FastAPI skeleton stubbed only. |
| `services/scoring-agent` | FastAPI skeleton stubbed. Real first use: `scripts/score_orgs.py` (standalone script, same pattern as the crawler) — see Task 3 below. |

## Modules

`apps/rankings` functionality is now split into standalone `@blackbox/module-*`
packages (see `docs/decisions.md` — "Rankings feature modules"), each
addable/removable independently of the others: `apps/rankings` itself is a
thin shell (layout, theme, `Masthead` nav chrome) that imports and composes
them. This is prep work for the eventual single combined site (job-portal +
rankings + ngo-site) — that merge itself is a separate, later task, not
done here.

| Module | Status | Covers |
|---|---|---|
| `@blackbox/rankings-data` | Done | Shared data seam (Postgres via `@blackbox/db`, falls back to mock data) — infra, not a removable feature itself. |
| `@blackbox/module-leaderboards` | Done | `/companies`, `/universities` listings; also houses `OrgAvatar`/`ScoreBadge`, shared with org-snapshot. |
| `@blackbox/module-org-snapshot` | Done | `/organizations/[slug]` — the public Snapshot page (rank summary, maturity ladder, dimension scorecard, strengths/risks, score breakdown). |
| `@blackbox/module-methodology` | Done | `/methodology` — static placeholder content. |
| `@blackbox/module-claim` | Done | `/claim` placeholder flow + the parked (unused, not yet wired to any page) `VerificationLadder` company-view component. |
| `job-portal` (site-level) | Not started | Whole site is an unmodified scaffold — nothing to extract yet. |
| `ngo-site` (site-level) | Not started | Deferred; not scaffolded beyond a README. |
| 7 private dashboard tabs (feature-level, within rankings) | Not started | Benchmark, Gap Analysis, Roadmap, Impact Simulator, Progress Tracker, Recognition, Executive Boardroom — currently shown as locked/disabled labels only (`SnapshotTabs`, in `module-org-snapshot`), gated behind company verification (mechanism TBD). Each becomes its own `@blackbox/module-*` package once built, following the same pattern. |

## BRSR accessibility-scoring pipeline

Building the data pipeline that will feed `apps/rankings` for Indian
companies, using their SEBI-mandated BRSR filings as the source. Full detail
in `docs/plans/brsr-accessibility-pipeline.md`.

- [x] **Task 1 — Crawler.** Bulk-download BRSR PDFs from NSE for companies
      with continuous filings across the 3 most recent fiscal years.
      `services/crawler/scripts/fetch_brsr_reports.py`. Done —
      **413 companies, 1,239 PDFs** (FY2023-24/24-25/25-26; companies missing
      any of the 3 years, including download failures, are excluded).
- [ ] **Task 2 — Extraction.** Scan each PDF for PwD/accessibility/inclusion
      content: keyword+section triage to find relevant pages, then Claude
      structured extraction against a fixed schema.
      `services/crawler/scripts/extract_pwd_signals.py` — schema now covers
      all 10 scoring metrics (see Task 3); plumbing re-verified via `--mock`
      mode. Real extraction still pending an API key — model decision is
      Gemini 3.1 Pro (see decisions.md), not yet migrated in code (script
      still calls the Anthropic SDK with `claude-opus-4-8`).
- [x] **Task 3 — Scoring.** `services/scoring-agent/scripts/score_orgs.py`
      (standalone script, mirrors the crawler's pattern) — one structured
      Claude call per company scores all 10 metrics (0-100 each,
      `overall_score` = their mean) from Task 2's extraction output, plus a
      peer-average pass across the run. Plumbing verified via `--mock`
      mode against real (mock-extracted) BRSR data. Real scoring blocked
      on the same API key as Task 2.
- [x] **Task 4 — Database wiring.** `scripts/load_scores.py` loads Task
      3's output into Postgres (`Organization` upserted by slug,
      `AccessibilityScore` appended — append-only by design, for a future
      "score over time" view); `packages/db/src/queries.ts` has the
      Prisma raw-SQL (`DISTINCT ON`) helpers for "latest score per org";
      `apps/rankings/src/lib/get-orgs.ts` is the site's single seam onto
      that data, with a mock fallback. Verified fully end-to-end against a
      live local Postgres (`docker compose up postgres`, migrated,
      11 companies loaded, site confirmed reading them, not the mock set).
      `industry_average` in scores is currently a *national* peer average,
      not real industry data — see decisions.md.
- [x] **Task 5 — Annual report crawler.** `services/crawler/scripts/
      fetch_annual_reports.py` — downloads each company's most recent
      annual report. Unlike BRSR's bulk date-range API, NSE's
      annual-reports endpoint is per-symbol, so this loops over the same
      413-company universe `fetch_brsr_reports.py` already established.
      Verified against real NSE (not mocked): 413/413 companies had an
      annual report available; full download run, **413/413 downloaded,
      0 failed**.
- [x] **Task 6 — Wire annual reports into extraction.**
      `extract_pwd_signals.py` now triages and sends *both* a company's
      BRSR filing and its annual report (when available) to Claude in a
      single combined call — not two separate extractions — so the model
      reconciles both sources rather than producing two disconnected
      answers. Each evidence entry now records which source it came from
      (`"source": "BRSR" | "Annual Report"`). Falls back to BRSR-only
      automatically if `fetch_annual_reports.py` hasn't been run.
      Verified in `--mock` mode against real (downloaded, not mocked)
      annual report PDFs, single company and a 5-company random sample.
- [x] **Task 7 — Evidence repository.** New `Evidence` table
      (`packages/db/prisma/schema.prisma`) + `services/crawler/scripts/
      load_evidence.py` — internal-only audit trail (never shown on the
      public site) so a published score can be traced back to its exact
      source document/page/quote if ever questioned. Independent of
      `AccessibilityScore`'s lifecycle; replaced wholesale per
      org+fiscal-year on each reload, not append-only. Verified against
      a live local Postgres: loaded, re-run confirmed to replace rather
      than duplicate rows, spot-checked with a direct SQL query.
