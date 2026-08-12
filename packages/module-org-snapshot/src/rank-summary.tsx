import { getOrgRanks, parseState, type MockOrg, type RankInfo } from "@blackbox/rankings-data";

export interface RankSummaryProps {
  org: MockOrg;
  allOrgs: MockOrg[];
}

function RankStat({ label, rank, detail }: { label: string; rank: RankInfo; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label} rank
      </dt>
      <dd className="mt-1 font-serif text-2xl font-bold text-foreground">
        #{rank.rank}
      </dd>
      <dd className="text-xs text-muted-foreground">{detail}</dd>
    </div>
  );
}

// Rank is always relative to the org's own type (companies rank against
// companies, universities against universities) — see getOrgRanks.
// `allOrgs` must be the same dataset `org` came from (mock or real).
export function RankSummary({ org, allOrgs }: RankSummaryProps) {
  const ranks = getOrgRanks(org, allOrgs);
  const state = parseState(org.location);
  const typeLabel = org.type === "COMPANY" ? "companies" : "universities";

  return (
    <section
      aria-labelledby="rank-heading"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <h2 id="rank-heading" className="font-serif text-xl font-semibold text-foreground">
        Where {org.name} stands
      </h2>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RankStat label="National" rank={ranks.national} detail={`of ${ranks.national.total} ${typeLabel}`} />
        <RankStat
          label="Industry"
          rank={ranks.industry}
          detail={org.industry ? `of ${ranks.industry.total} in ${org.industry}` : `of ${ranks.industry.total} unclassified`}
        />
        <RankStat
          label="State"
          rank={ranks.state}
          detail={state ? `of ${ranks.state.total} in ${state}` : `of ${ranks.state.total} unclassified`}
        />
      </dl>
    </section>
  );
}
