# Decisions & rules of working

Append-only log of conventions and calls made along the way. If a new
decision contradicts one below, update the old entry rather than leaving
both — this should always reflect current reality, not history (git history
covers that).

## Stack & repo structure — 2026-07-22

- Monorepo: pnpm workspaces + Turborepo. `apps/*` (Next.js sites),
  `packages/*` (shared code), `services/*` (Python agents).
- Apps: Next.js + TypeScript + Tailwind v4 (CSS-first config, no
  `tailwind.config.js`) + Radix UI primitives (via `@blackbox/ui`).
- Agents: Python + FastAPI, one service per agent (`crawler`,
  `matching-agent`, `scoring-agent`), not a monolith.
- Database: PostgreSQL + `pgvector`, accessed via Prisma (`@blackbox/db`)
  from the Node side. Python services talk to the same Postgres directly.
- Queue/cache: Redis.
- No auth system stood up yet anywhere. Add per-app only when a feature
  actually needs it (e.g. job-portal accounts) — don't pre-build it.

## Accessibility is a hard constraint, not a nice-to-have — 2026-07-22

This applies to every app we build, not just the job portal:
- `jsx-a11y` ESLint rules are set to `error`, not `warn`, in
  `packages/config/eslint/next.mjs` — a11y regressions fail CI.
- Design tokens (`packages/config/tailwind/theme.css`) meet WCAG AA contrast;
  never suppress the visible focus ring; respect `prefers-reduced-motion`;
  interactive elements meet the 44px minimum touch target.
- Prefer real semantic HTML over ARIA-patched divs (e.g. an actual `<table>`
  for tabular data, not a div grid) — screen readers get correct behavior
  for free.
- Filtering/sorting UI should work via plain links/GET params where
  possible, not client-only JS state — keeps it usable with JS disabled and
  avoids focus-management bugs.
- Never convey information (like a score) by color alone — always pair with
  text/number.

## Binary files: filesystem, not the database — 2026-07-27

Large files (PDFs, résumés, report documents) are never stored as DB blobs.
Postgres holds metadata + a path/URL only. For now that's local disk
(`services/*/data/`, gitignored); the plan (from the original stack
discussion) is to move to object storage (Cloudflare R2 / S3) once this
needs to run outside a single machine — the metadata-in-DB /
blob-on-object-storage split stays the same either way.

## BRSR crawler scope rules — 2026-07-27

- Source: NSE India's BRSR filings API
  (`nseindia.com/api/corporate-bussiness-sustainabilitiy`), not the rendered
  page — see `docs/plans/brsr-accessibility-pipeline.md`.
- PDF over XBRL: the XBRL is BRSR-taxonomy-tagged XML requiring
  schema-specific parsing; the PDF is directly usable by an LLM, which is how
  we're extracting signals (see Task 2). Revisit only if we need structured
  numeric fields the PDF doesn't give us cleanly.
- **Continuous-filer rule**: a company is only included if it has a report
  for *every one* of the target fiscal years (currently the 3 most recent).
  Missing even one year — whether the source never had it, or a download
  failed — drops the company entirely. No partial company records. This
  applies to every future re-run of the crawler, not just the first one.

## LLM extraction design (BRSR pipeline Task 2) — 2026-07-27

- **Triage before extraction, always.** Don't send full 60-150 page reports
  to the LLM — scan locally first (keywords + BRSR's Principle 3/5 section
  headers as a floor) and only send flagged pages. Keeps cost down and
  extraction focused; full-document PDF input is technically supported
  (32MB/600 pages) but not the default here.
- **Structured output via `output_config.format` (JSON schema), not free
  text and not a forced tool call.** This is the "extraction" use case the
  Claude API's structured-outputs feature is meant for.
- **Citations feature not used** — it's incompatible with
  `output_config.format`. Instead the schema itself asks for an `evidence`
  array (quote + original page number) per populated field. Original page
  numbers are preserved by stamping each page with its source page number
  before trimming, since trimming changes page order/count.
- **Model: `claude-opus-4-8`** (house default — never downgrade for cost
  without being asked). For the eventual full ~1,200-document run, switch
  from synchronous calls to the **Message Batches API** (50% off, fine for
  a non-interactive bulk job) rather than looping synchronously.

## LLM provider for BRSR/annual-report extraction — 2026-08-04

- **Gemini 3.1 Pro**, not Opus, is the chosen model for the extraction
  pipeline — set once an API key is available; integration rewrite from
  Anthropic's structured-output conventions is accepted as a non-issue.
  Reasoning: ~60% cheaper at the ~1,500-doc/year volume (₹3,500–7,000 vs
  Opus's ₹8,800–17,600, at ₹95.32/$), plus a genuine (not just cheaper)
  capability edge — Gemini's multimodal document understanding is a better
  fit for the mixed text/table/layout PDFs this pipeline reads (confirmed by
  triaging a real TCS annual report: the PwD headcount table and BRSR
  appendix are exactly this shape). Open risk, not yet validated: whether it
  matches Opus on nuance detection (negation, hedged language,
  genuine-vs-boilerplate claims) — pilot before fully committing.
- Annual reports were assumed to need *more* per-document tokens than BRSR
  filings (longer documents); a real triage run showed the opposite — only
  11 of 362 pages matched the PwD/accessibility keyword list, fewer than
  BRSR's ~17.5-page average. Treat "pages/doc could run higher for annual
  reports" as disproven, not just unconfirmed.

## Score verification/trust ladder — 2026-08-04, revised 2026-08-10

Client-supplied reference (`aideza-inclusion.org`) established the
transparency model: every score starts **AI-estimated** (produced from
public filings/crawled data only, no company involvement) and is visibly
labeled as such. Companies can raise their own score's trust level by
claiming their record and submitting more data — the mechanism for
collecting data (like "Employee Feedback") that can't be extracted from
public documents at all.

- **Six-level ladder**: AI Est. (0) → Registered (1) → Self-Declared (2) →
  Doc-Verified (3) → Audited (4) → Certified (5).
- **The platform has two views, per the client's own prompt for the
  platform**: a **public view** (anonymous visitors — leaderboards, org
  pages) and a **company view** (private, login-gated behind company-email
  or similar verification, mechanism TBD) that's the full
  Intelligence dashboard — eight tabs (Snapshot, Benchmark, Gap Analysis,
  Roadmap, Impact Simulator, Progress Tracker, Recognition, Executive
  Boardroom). Only Snapshot is public; the other seven are shown as
  disabled/locked tab labels on the public org page (visible that they
  exist, no content exposed) rather than built out.
- **Revised from the original entry**: the full 6-stage progress-bar
  ladder UI and the detailed "Claim record" flow are **company-view-only**
  content, not shown publicly. The public view instead shows just the
  current level's *label* (e.g. "AI Est.", "Registered") as a simple
  signal next to the score, plus a lightweight "Is this your
  organization?" CTA on the org's own page (not on the leaderboard list,
  matching AIDEZA's actual pattern) linking to the `/claim` placeholder.
- **Maturity ladder, not the verification ladder, is the score-driven
  system shown in both views**: Emerging → Developing → Progressing →
  Leading → Transforming, derived purely from `overall_score` (not from
  verification level — a company can be highly "Transforming" in
  maturity while still fully unclaimed/AI-estimated in verification
  status; these are two independent axes).
- **v1/MVP scope is still UI-only** for anything claim/auth-shaped — the
  CTA leads to a placeholder page, not a real flow. Doesn't contradict the
  "no auth system until a feature actually needs it" rule; no auth is
  being built yet.
- **Rankings site routing**: companies and universities are separate pages
  (`/companies`, `/universities`), not a shared page with an org-type tab
  filter. No combined "All" view exists. `/` redirects to `/companies`.

## Scoring methodology — 10 metrics — 2026-08-10

Client requirement: exactly 10 metrics, equally weighted, each contributing
up to 10 points to a 0-100 composite (`overall_score`). Implemented as the
mean of ten independent 0-100 subscores — mathematically identical to the
10-points-each framing, just on the same 0-100-per-metric scale the
rankings site already displays rather than 0-10.

Final 10 (8 from the client's own mockup, kept as-is since they're
already visually validated there, not just verbally specified):
**Accessibility, Policy, Employment, Recruitment, Retention, Leadership,
Learning, Culture, Employee Feedback, Compliance.**

- **Employee Feedback** (9th) — the client's own addition to the mockup's
  8. Sentiment/self-reported signal; expected to have low disclosure from
  BRSR text alone (that's honest, not a bug) until company-submitted data
  exists.
- **Compliance** (10th, our proposal, accepted) — statutory/regulatory
  adherence (RPwD Act quota attainment, WCAG conformance claims, BRSR
  completeness). Chosen over Governance (too redundant with
  Leadership/Policy evidence) and External/Community Impact (risks
  rewarding CSR/PR spend over substantive accessibility work — cuts
  against the evidence-based credibility premise of the whole score).
  Pulled from the client's original data-taxonomy mindmap, not invented.
- **Leadership vs. Employment vs. Recruitment vs. Retention**: deliberately
  kept as 4 separate metrics, not merged. Employment = overall PwD
  headcount/%. Recruitment = hiring process/attainment. Retention =
  whether PwD employees stay. Leadership = PwD representation specifically
  in senior/leadership roles. Each is a different lens on the same
  workforce-lifecycle data.
- **Culture vs. Employee Feedback vs. Learning**: Culture = observable
  practices the company runs (ERGs, flexible work, accommodation
  response-time commitments). Employee Feedback = what employees say
  (sentiment/survey). Learning = formal training/sensitization programs.

**Extraction schema extended to match** (`extract_pwd_signals.py`): added
12 new fields (a `_disclosed` boolean + `_details` string pair per new
metric) for Recruitment, Retention, Leadership, Culture, Employee
Feedback, and Compliance — the other 4 metrics reuse fields that already
existed. `METRIC_FIELDS` in that script is the canonical mapping from
schema field → metric; `score_orgs.py` duplicates it (cross-service
import isn't practical — separate Python environments) and must be kept
in sync by hand.

**Scoring agent** (`services/scoring-agent/scripts/score_orgs.py`, new):
one structured-output Claude call per company scores all 10 metrics at
once from that company's extraction JSON (not 10 separate calls) — cheap
relative to extraction since the input is already-extracted text, not raw
PDF pages. A 0-100 rubric (0 = nothing disclosed, 75+ = specific/
verifiable) with per-metric rationale + a recommendation whenever a
subscore is below 75, mirroring the rankings site's existing convention.

**Peer average is a known placeholder, not real industry data**: the BRSR
crawler manifest has no industry/sector classification (NSE's API doesn't
provide one), so `industry_average` in the output is actually a *national*
average across whichever companies were scored in that run — labeled for
UI compatibility with the rankings site's `industryAverage` field, but not
a real industry comparison yet. Fix requires a company-industry
classification step that doesn't exist anywhere in the pipeline yet.

## Database wiring — 2026-08-10

The rankings site (`apps/rankings`) now reads real Postgres data end to
end: `load_scores.py` → Postgres → `packages/db/src/queries.ts` →
`apps/rankings/src/lib/get-orgs.ts` → the site's pages. Verified live
against a local Postgres (`docker compose up postgres`), not just typechecked.

- **`get-orgs.ts` is the single seam** between the site and its data
  source. It tries Postgres first and falls back to the fictional
  `mock-orgs.ts` data if the DB is unreachable *or* reachable-but-empty
  (migrated, not yet loaded) — so local dev and the deployed site never
  hard-fail just because the pipeline hasn't populated real data yet.
  Warns once per process (not per request) when it falls back.
- **Real orgs have honest gaps, not guessed values.** `Organization` grew
  `slug`/`logoUrl`/`industry`/`location` (per the original
  `docs/plans/rankings-site-v1.md` plan, only now applied) — all nullable,
  because the BRSR pipeline has no company-metadata classification step.
  Loading a real company sets these null rather than inventing a plausible
  industry for an entity that actually exists — that's a different
  standard than the fictional `mock-orgs.ts` set, where inventing detail
  is fine. Every Snapshot UI field that depends on data the pipeline
  doesn't produce yet (employees, employee-with-disabilities count, score
  trend, AI confidence, evidence-item count) is optional end-to-end and
  the relevant card/line is omitted rather than shown as 0/undefined/NaN.
  `verificationLevel` is hardcoded to 0 for every DB-sourced org — not a
  placeholder, an accurate fact: no claim/verification workflow exists
  yet, so nothing has actually moved off level 0.
- **`AccessibilityScore` stays append-only** (already the design per the
  original plan) — `load_scores.py` always inserts a new row rather than
  updating, so re-running scoring after a fresh pipeline run builds real
  score history instead of erasing the previous one.
- **Ranking/rank-adjacent logic (`getOrgRanks`, maturity, etc.) takes the
  org list as a parameter now**, rather than always reading the mock
  array internally — so the exact same functions work correctly against
  whichever dataset (`mock` or real) `get-orgs.ts` actually returned for
  that request.
- **DB writes from Python go through `psycopg` directly, not Prisma** —
  consistent with the existing "Python services talk to Postgres
  directly" stack decision. One real friction point worth remembering:
  Prisma's conventional `?schema=public` connection-string suffix isn't
  valid libpq syntax and makes `psycopg.connect()` error immediately;
  `load_scores.py` strips it so the same `DATABASE_URL` value works for
  both tools without maintaining two separate env vars.
- **`psycopg.connect()` needs an explicit `connect_timeout`** — against an
  unreachable host on Windows it was observed to hang rather than fail
  fast with connection-refused; a 5s timeout turns that into a clear,
  immediate error instead.

## Annual report crawler — 2026-08-11

- **Source verified from the actual library implementation**, not
  guessed: `https://www.nseindia.com/api/annual-reports?index=equities&
  symbol=<SYMBOL>` (confirmed against BennyThadikaran/NseIndiaApi's real
  source + committed sample response, not just documentation prose,
  which turned out to describe the response shape incorrectly — the real
  shape is a flat `data` array, not a year-keyed dict). Files are served
  from `nsearchives.nseindia.com`, the same archive host the BRSR
  downloader already handles.
- **Per-symbol, not bulk** — unlike BRSR's single date-range call
  covering every company, this endpoint takes one symbol per request.
  `fetch_annual_reports.py` loops over the company universe
  `fetch_brsr_reports.py` already established (the same 413 companies
  with continuous 3-year BRSR history) rather than discovering companies
  independently.
- **Only the most recent annual report per company is fetched** — no
  continuous-filer/3-year rule here. This pipeline needs one contemporary
  supplementary document per company for the current scoring cycle, not
  a multi-year history the way BRSR needed one for its continuous-filer
  requirement.
- **Real coverage confirmed, not assumed**: a dry run against all 413
  companies (real NSE, not mocked) found an annual report available for
  413/413 — full coverage, no gaps to reason about for this data source.

## Reading annual reports alongside BRSR — 2026-08-11

- **One combined extraction call per company, not two separate ones.**
  When a company has both a BRSR filing and a downloaded annual report,
  `extract_pwd_signals.py` triages each independently but sends both
  trimmed PDFs to Claude in a single message. Rejected the alternative
  (extract each source separately, reconcile at scoring time) because it
  would double the LLM call count at the extraction stage for a benefit
  the model can already get for free by seeing both sources together in
  one reasoning pass — same cost-consciousness precedent as
  `score_orgs.py` scoring all 10 metrics in one call, not ten.
- **Every evidence entry now records its source** (`"BRSR"` or
  `"Annual Report"`) — added directly to the schema, not inferred after
  the fact. Trimmed-page stamps changed from `"Original page: N"` to
  `"SOURCE — Original page: N"` so the model (and any future human
  reviewer) can always tell which document a citation came from.
- **The Principle 3/5 section-anchor search runs on annual reports too**,
  not just BRSR filings — some annual reports embed a BRSR-referenced
  appendix with the same section headers (observed directly in a real
  filing during earlier triage testing), so the same anchor logic finds
  it there as well.
- **Graceful degradation, not a hard dependency**: if
  `fetch_annual_reports.py` hasn't been run (no manifest file), extraction
  proceeds BRSR-only, exactly as it did before annual reports existed in
  the pipeline — this was never made a required input.

## Evidence repository — 2026-08-12

**Purpose, confirmed directly**: internal audit trail only, never shown
on the public site. If a published score is ever questioned, the team
needs to be able to point to the exact document/page/quote that backed
it — that's the entire requirement, nothing more.

- **Discovered while answering "what's the situation with it": evidence
  was being captured at extraction time but went nowhere from there.**
  `score_orgs.py`'s `build_scoring_context()` only sends extracted field
  *values* to the scoring LLM, never the `evidence` array; the final
  `breakdown` written to the site only has category/subscore/rationale
  (the scoring LLM's own sentence, not the original filing quote). The
  citations extraction already produced were sitting unused in
  `data/pwd_extractions/*.json` with nothing downstream ever reading them
  again.
- **New `Evidence` model** (`packages/db/prisma/schema.prisma`) — one row
  per citation: organization, fiscal year, which of the 10 metrics it
  supports, the raw extraction field name, the quote, source (BRSR /
  Annual Report), source document path, original page. Independent of
  `AccessibilityScore` — not surfaced through any rankings-site query
  path, doesn't need to be, per the confirmed purpose above.
- **Replaced wholesale on reload, not append-only** — unlike
  `AccessibilityScore` (deliberately append-only for a future
  score-history view), `Evidence` represents "the current best citation
  set for what this filing says," so `load_evidence.py` deletes an
  org+fiscal-year's existing rows before inserting fresh ones on each run.
- **`services/crawler/scripts/load_evidence.py`** reads directly from
  extraction JSON (not from scoring output) — evidence's lifecycle is
  independent of scoring's, so loading it never depends on
  `score_orgs.py`/`load_scores.py` having run first.

## Rankings feature modules — 2026-08-12

Converted `apps/rankings`'s functionality into standalone packages ahead of
the eventual single combined site (job-portal + rankings + ngo-site) — that
merge itself is a separate, later task; this is prep so pieces can be
added/removed cleanly once it happens. See `docs/roadmap.md` — "Modules"
for the completed/pending checklist.

- **Modules are `@blackbox/module-*` workspace packages, not a runtime
  plugin system.** Extends the existing shared-package convention
  (`@blackbox/ui`, `@blackbox/db`, `@blackbox/config`) to feature code
  instead of inventing new tooling — Turborepo's build graph already
  assumes package boundaries. A runtime toggle/registry was considered and
  rejected as speculative: there's currently one consuming app, so
  "remove a module" just means deleting its package and its one import
  line in the shell.
- **`apps/rankings` is now a thin shell**: `layout.tsx`, `theme-toggle.tsx`,
  `globals.css`, and `masthead.tsx` (chrome) stay in the app; each
  `app/**/page.tsx` route file is reduced to composing `<Masthead />` with
  a content component imported from a module package.
- **`@blackbox/rankings-data`** (promoted from the old `src/lib/get-orgs.ts`
  + `mock-orgs.ts`) is shared infra, not a feature module itself — both
  `module-leaderboards` and `module-org-snapshot` depend on it for the
  data seam.
- **Masthead injected as a prop, only where needed.** Most modules don't
  need to know about `Masthead` at all — the shell renders it directly
  alongside the content component. `module-org-snapshot` is the exception:
  which nav tab is "active" depends on the fetched org's type
  (company/university), which the module doesn't know until it fetches —
  so `OrgSnapshotContent` takes `Masthead` as a component prop rather than
  importing it, keeping the package dependency direction correct (modules
  never import from the app).
- **`OrgAvatar`/`ScoreBadge` live in `module-leaderboards`**, not split out
  further, even though `module-org-snapshot` also uses them (org header,
  score breakdown) — genuinely shared low-level UI atoms between the two
  feature modules. `module-org-snapshot` depends on `module-leaderboards`
  for them rather than duplicating.
- **`masthead.tsx`'s nav list moved to `apps/rankings/src/lib/site-nav.ts`**
  — previously a hardcoded array inside the component. This is the actual
  "remove a module updates nav automatically" mechanism: one small
  shell-owned config file, not a structural dependency inside `Masthead`.
- **Tailwind v4 content-scanning gotcha, confirmed by direct test**: the
  app's `globals.css` has no `@source` directive, so Tailwind's automatic
  detection only covers `apps/rankings`'s own directory tree — sibling
  `packages/module-*` source is invisible to it (workspace packages are
  symlinked under `node_modules`, which is `.gitignore`d and therefore
  skipped by the heuristic). Verified directly: removing the `@source`
  line for `module-methodology` dropped `max-w-3xl` from the production
  build's CSS entirely; restoring it brought the class back. Every module
  package needs its own explicit `@source "../../../../packages/module-*/
  src/**/*.tsx";` line in `globals.css` — dev mode looks fine either way,
  so this only surfaces in a real `next build`, not typecheck.
