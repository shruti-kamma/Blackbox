import Link from "next/link";
import { cn } from "@blackbox/ui";
import {
  getAllOrgs,
  getMaturityDistribution,
  getMaturityLevel,
  getTopPerformers,
  MATURITY_LEVEL_DOT_CLASS,
  type MockOrg,
} from "@blackbox/rankings-data";
import { OrgAvatar } from "./org-avatar";

// Landing-page teaser modeled on a reference dashboard the client shared
// (a dense "top scores" card: live badge, distribution bar, ranked grid,
// claim CTA) — same density/structure, adapted to this site's own rules:
// light editorial theme (not the reference's dark one), our own 5-tier
// Maturity Ladder (not the reference's Bronze/Silver/Gold-style system),
// and no color-coded severity badges (see ScoreBadge) — every card gets a
// tier dot + text, same pattern used across the rest of the rankings UI,
// not a colored "Amber"/"Silver" pill.
function HighlightCard({ org, rank }: { org: MockOrg; rank: number }) {
  const tier = getMaturityLevel(org.overallScore);
  return (
    <Link
      href={`/rankings/organizations/${org.slug}`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-serif text-sm text-muted-foreground tabular-nums">#{rank}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5">
          <span aria-hidden="true" className={cn("h-1.5 w-1.5 shrink-0 rounded-full", MATURITY_LEVEL_DOT_CLASS[tier])} />
          <span className="text-[0.65rem] font-medium text-muted-foreground">{tier}</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <OrgAvatar name={org.name} logoUrl={org.logoUrl} />
        <div className="min-w-0">
          <p className="truncate font-serif text-base font-semibold text-foreground">{org.name}</p>
          <p className="truncate text-xs text-muted-foreground">{org.industry ?? "Industry not yet classified"}</p>
        </div>
      </div>
      <p className="mt-auto flex items-baseline gap-1.5">
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-serif text-3xl font-bold tabular-nums text-transparent">
          {org.overallScore}
        </span>
        <span className="text-xs text-muted-foreground">/100</span>
      </p>
    </Link>
  );
}

export async function RankingsHighlights() {
  const orgs = (await getAllOrgs()).filter((o) => o.type === "COMPANY");
  if (orgs.length === 0) return null;

  const top = getTopPerformers(orgs, 6);
  const distribution = getMaturityDistribution(orgs).filter((d) => d.count > 0);
  const avgScore = Math.round(orgs.reduce((sum, o) => sum + o.overallScore, 0) / orgs.length);

  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              Live
            </span>
            <span className="text-muted-foreground">&middot; Blackbox Accessibility Index</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
              India pilot
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Top Scores &mdash; Companies in India
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {orgs.length} companies indexed &middot; the 10-metric methodology is live &middot; universities
                launching next
              </p>
            </div>
            <Link href="/rankings/companies" className="shrink-0 text-sm font-semibold text-primary hover:underline">
              Full rankings &rarr;
            </Link>
          </div>

          {/* Same "no severity color" rule as TierLegend — a single-hue
              intensity scale, never red/amber/green — plus the national
              average as a plain number, not a status judgment. */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Distribution</span>
            <div className="flex h-2 flex-1 min-w-40 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              {distribution.map((d) => (
                <div
                  key={d.level}
                  className={cn("h-full", MATURITY_LEVEL_DOT_CLASS[d.level])}
                  style={{ width: `${d.percentage}%` }}
                />
              ))}
            </div>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {distribution.map((d) => (
                <li key={d.level} className="flex items-center gap-1">
                  <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", MATURITY_LEVEL_DOT_CLASS[d.level])} />
                  {d.level} {d.count}
                </li>
              ))}
            </ul>
            <span className="text-xs text-muted-foreground">
              Avg: <span className="font-semibold text-foreground">{avgScore}</span>
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((org, i) => (
              <HighlightCard key={org.id} org={org} rank={i + 1} />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Not on this list?</span> Your organization may already
              be scored, or you can claim a free baseline.
            </p>
            <Link
              href="/rankings/claim"
              className="flex h-touch-target shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Claim or get scored &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
