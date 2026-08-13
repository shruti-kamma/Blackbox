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
import { MetricHeatmap } from "./metric-heatmap";
import { getAllOrgs } from "@blackbox/rankings-data";

// Page content only — the route file (app/ranking/universities/page.tsx)
// renders this directly. Navigation into this page comes from the main
// site nav's "Rankings" dropdown (see components/nav.tsx), not a
// section-local nav bar (that Masthead was removed).
// Mirrors companies-content.tsx's layout — see that file's comment for
// the AIDEZA-format rationale.
export async function UniversitiesLeaderboardContent() {
  const orgs = (await getAllOrgs())
    .filter((org) => org.type === "UNIVERSITY")
    .sort((a, b) => b.overallScore - a.overallScore);

  return (
    <main id="main-content" className="w-full flex-1 px-6 pt-8 pb-16">
      {/* Visually removed per request, but a page still needs exactly one
          h1 for screen-reader navigation — kept, just not shown. */}
      <h1 className="sr-only">University Rankings</h1>

      <IndexSummary orgs={orgs} label="Universities" />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_280px] lg:items-start lg:gap-8">
        <aside className="order-2 flex flex-col gap-4 lg:order-1">
          <SectorAveragesPanel orgs={orgs} />
          <ScoreDistributionPanel orgs={orgs} />
          <TopStatesPanel orgs={orgs} />
        </aside>

        <div className="order-1 lg:order-2">
          <TierLegend orgs={orgs} />
          <LeaderboardTable
            orgs={orgs}
            caption="Universities ranked by accessibility and inclusion score"
          />
        </div>

        <aside className="order-3 flex flex-col gap-4">
          <MomentumLeadersPanel orgs={orgs} />
          <TopPerformersPanel orgs={orgs} />
          <DisclosureGapsPanel orgs={orgs} />
          <WatchlistPanel orgs={orgs} />
        </aside>
      </div>

      <div className="mt-8">
        <MetricHeatmap orgs={orgs} />
      </div>
    </main>
  );
}
