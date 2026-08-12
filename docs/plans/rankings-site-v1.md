> **Status**: approved 2026-07-27, not yet implemented. Paused to prioritize
> getting real accessibility-score data (see `brsr-accessibility-pipeline.md`)
> before building the UI against it. See `docs/roadmap.md` for current status.

# Rankings site v1

## Context

The rankings site (`apps/rankings`) is currently the unmodified `create-next-app`
scaffold — no custom pages yet. It's meant to publicly rank companies and
universities on accessibility/inclusion for PwDs. The real pipeline (crawler →
scoring agent → score) is still stubbed, so for v1 we build the site against
directly-seeded sample data (you'll supply it) rather than waiting on the agents.
Per your answers: no user accounts/auth on this site at all, and we're
building the read path first, not a submit/claim flow.

Goal: a working public leaderboard + org detail page, backed by real Postgres
data (via the shared `@blackbox/db` Prisma package), that the scoring agent
can later populate for real without any site changes.

## Schema additions (`packages/db/prisma/schema.prisma`)

`Organization` currently has no fields for display/filtering on a public
leaderboard. Add:
- `slug String @unique` — clean URLs (`/organizations/acme-inc`)
- `logoUrl String?`
- `industry String?` — filter facet (e.g. "Software", "Higher Education")
- `location String?` — filter facet, same free-text pattern as `Job.location`

No changes to `AccessibilityScore` — its `breakdown Json` already matches the
`ScoreBreakdown` shape `services/scoring-agent/app/schemas.py` produces
(`category`, `subscore`, `rationale`), so the site and the future real agent
output stay compatible. I'll add a matching TS type in `packages/db/src` so
the rankings app doesn't parse the JSON blindly.

"Latest score per org": Prisma has no native latest-per-group query, and a
denormalized pointer field adds write-side complexity for no real benefit at
this scale. Instead, add one small raw-SQL helper in `packages/db/src/queries.ts`
(`DISTINCT ON (organization_id) ... ORDER BY organization_id, generated_at DESC`)
used by both the leaderboard and detail page. This keeps `AccessibilityScore`
as an honest append-only history table, which we want anyway for a
"score over time" story later.

## Seed data

Add `packages/db/prisma/seed.ts` (run via `prisma db seed`, using `tsx`) that
reads `packages/db/prisma/seed-data.json` (gitignored-content but
tracked-structure — actually just commit it, it's sample not secret) and
upserts `Organization` + one `AccessibilityScore` row each, auto-slugifying
names. After this plan is approved, send me the sample orgs/scores and I'll
drop them into that JSON file in whatever shape is easiest for you — I'll
adapt the seed script to match rather than asking you to conform to a schema.

## Pages (`apps/rankings/src/app`)

- **`page.tsx`** — Leaderboard. Server Component, queries orgs + latest score
  via the new helper, sorted by score desc. Filters (org type: all/company/
  university, industry, location, text search) are plain GET query params
  (`?type=company&q=...`) read from `searchParams` and turned into a Prisma
  `where` — no client JS required to filter, which matters for an
  accessibility-first product (works with JS disabled, works with
  screen-reader form navigation, no focus-management edge cases from a JS
  filter panel).
- **`organizations/[slug]/page.tsx`** — Org detail. Overall score, per-category
  breakdown (rationale text, not just a number/color), methodology version +
  generated date.
- **`methodology/page.tsx`** — Static content page explaining the rubric
  categories and how scores are produced. Proposed starting categories
  (editable copy, not a hard commitment): Digital Accessibility, Accommodation
  Policy, Inclusive Hiring Practices, Physical Accessibility, Employee
  Support Programs.
- **`layout.tsx`** — add a header (site name, nav: Home / Methodology) with
  `@blackbox/ui`'s `SkipLink` as the first element, per the a11y pattern
  already established there.

## New shared components (`apps/rankings/src/components`)

App-specific, not promoted to `@blackbox/ui` yet since nothing else needs
them:
- `leaderboard-table.tsx` — real `<table>` with `<caption>`/`scope` headers,
  not a div grid, so it's announced correctly by screen readers.
- `score-badge.tsx` — score shown as both color *and* text/number (never
  color alone, per WCAG 1.4.1).
- `org-type-filter.tsx` — the All/Company/University filter, rendered as
  links (not buttons with onClick) so it degrades to normal navigation.
- `score-breakdown.tsx` — renders the category/subscore/rationale list on the
  detail page.

`Button`, `VisuallyHidden` from `@blackbox/ui` get reused where they fit
(e.g. `VisuallyHidden` for the sort-direction indicator text).

## Setup/infra touched

- `apps/rankings/.env.local` (new, gitignored) — needs its own `DATABASE_URL`
  since Next.js reads env from the app process, not from `packages/db`.
- `packages/db/package.json` — add `tsx` devDependency + a `"prisma": {"seed": "tsx prisma/seed.ts"}` block so `prisma db seed` works.

## Verification

1. `docker compose up -d postgres`
2. `pnpm --filter @blackbox/db migrate:dev` — creates tables from the updated schema
3. `pnpm --filter @blackbox/db exec prisma db seed` — loads sample data
4. `pnpm --filter rankings dev` — confirm leaderboard renders seeded orgs,
   sorted by score; filter links work; org detail page renders breakdown;
   methodology page renders
5. `pnpm --filter rankings build` — confirm it still builds clean
6. `pnpm --filter rankings typecheck`
