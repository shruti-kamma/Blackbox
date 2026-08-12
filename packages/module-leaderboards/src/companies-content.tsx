import { LeaderboardTable } from "./leaderboard-table";
import { IndexSummary } from "./index-summary";
import { TierLegend } from "./tier-legend";
import { SectorAveragesPanel } from "./sector-averages-panel";
import { TopStatesPanel } from "./top-states-panel";
import { MomentumLeadersPanel } from "./momentum-leaders-panel";
import { TopPerformersPanel } from "./top-performers-panel";
import { WatchlistPanel } from "./watchlist-panel";
import { getAllOrgs } from "@blackbox/rankings-data";

// Page content only — the shell composes this with <Masthead active="companies" />.
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
    <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-6 py-16">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Company Rankings</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Companies ranked on how accessible and inclusive they are to persons with
        disabilities, based on published disclosures.
      </p>

      <div className="mt-8">
        <IndexSummary orgs={orgs} label="Companies" />
      </div>

      {/* Ranked list comes first in document order (order-1) so mobile
          users see the actual ranking before the aggregate sidebars;
          desktop restores the left/center/right arrangement via lg:order-*. */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_280px] lg:items-start lg:gap-8">
        <aside className="order-2 flex flex-col gap-4 lg:order-1">
          <SectorAveragesPanel orgs={orgs} />
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
          <WatchlistPanel orgs={orgs} />
        </aside>
      </div>
    </main>
  );
}
