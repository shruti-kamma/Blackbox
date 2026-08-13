import { LeaderboardTable } from "./leaderboard-table";
import { IndexSummary } from "./index-summary";
import { TierLegend } from "./tier-legend";
import { SectorAveragesPanel } from "./sector-averages-panel";
import { TopStatesPanel } from "./top-states-panel";
import { ScoreDistributionPanel } from "./score-distribution-panel";
import { MomentumLeadersPanel } from "./momentum-leaders-panel";
import { TopPerformersPanel } from "./top-performers-panel";
import { WatchlistPanel } from "./watchlist-panel";
import { DisclosureGapsPanel } from "./disclosure-gaps-panel";
import { PwdHeadcountPanel } from "./pwd-headcount-panel";
import { MetricHeatmap } from "./metric-heatmap";
import { getAllOrgs } from "@blackbox/rankings-data";

// Page content only — the route file (app/ranking/companies/page.tsx)
// renders this directly. Navigation into this page comes from the main
// site nav's "Rankings" dropdown (see components/nav.tsx), not a
// section-local nav bar (that Masthead was removed).
// Layout adapted from the AIDEZA reference (see docs/decisions.md —
// "Replicate AIDEZA dashboard format"): national index summary, tier
// legend, and left/right aggregate sidebars around the existing ranked
// table — in our own light editorial theme and scoring model, not
// AIDEZA's dark theme / tier system.
export async function CompaniesLeaderboardContent() {
  const orgs = (await getAllOrgs())
    .filter((org) => org.type === "COMPANY")
    .sort((a, b) => b.overallScore - a.overallScore);

  return (
    <main id="main-content" className="w-full flex-1 px-6 py-16">
      {/* Visually removed per request, but a page still needs exactly one
          h1 for screen-reader navigation — kept, just not shown. */}
      <h1 className="sr-only">Company Rankings</h1>

      <IndexSummary orgs={orgs} label="Companies" />

      {/* Ranked list comes first in document order (order-1) so mobile
          users see the actual ranking before the aggregate sidebars;
          desktop restores the left/center/right arrangement via lg:order-*. */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_280px] lg:items-start lg:gap-8">
        <aside className="order-2 flex flex-col gap-4 lg:order-1">
          <SectorAveragesPanel orgs={orgs} />
          <ScoreDistributionPanel orgs={orgs} />
          <DisclosureGapsPanel orgs={orgs} />
          <TopStatesPanel orgs={orgs} />
        </aside>

        <div className="order-1 lg:order-2">
          <TierLegend orgs={orgs} />
          <LeaderboardTable
            orgs={orgs}
            caption="Companies ranked by accessibility and inclusion score"
          />
        </div>

        <aside className="order-3 flex flex-col gap-4">
          <MomentumLeadersPanel orgs={orgs} />
          <TopPerformersPanel orgs={orgs} />
          {/* PwdHeadcountPanel reads from generated/pwd-insights.ts, a
              static snapshot of the BRSR extraction batch — BRSR only
              covers public companies, never universities (see
              load_scores.py's own comment), so it's wired into this page
              only, not universities-content.tsx. */}
          <PwdHeadcountPanel orgs={orgs} />
          <WatchlistPanel orgs={orgs} />
        </aside>
      </div>

      {/* Full-width, below the sidebar grid rather than inside either
          sidebar — a 10-industry x 10-metric grid needs real width to
          stay legible, which neither ~260-280px sidebar column has. */}
      <div className="mt-8">
        <MetricHeatmap orgs={orgs} />
      </div>
    </main>
  );
}
