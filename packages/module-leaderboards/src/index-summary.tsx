import { getIndexSummary, type MockOrg } from "@blackbox/rankings-data";

export interface IndexSummaryProps {
  orgs: MockOrg[];
  label: string;
}

// The one hero numeral on this page — the org-type average score — gets
// the gradient duo treatment, same restraint principle used everywhere
// else it's used (see docs/decisions.md — "Editorial redesign"): one
// number per page reads as "the number that matters," not every number.
export function IndexSummary({ orgs, label }: IndexSummaryProps) {
  const { averageScore, count, averageTrend } = getIndexSummary(orgs);
  const hasTrend = averageTrend !== undefined;
  const trendSign = hasTrend && averageTrend! >= 0 ? "+" : "";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label} national index</p>
      <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-3">
        <p className="flex items-baseline bg-gradient-to-r from-primary to-secondary bg-clip-text font-serif text-5xl font-bold tabular-nums text-transparent">
          {Math.round(averageScore)}
          <span className="ml-1 text-xl font-medium text-muted-foreground">/100</span>
        </p>
        <div className="flex gap-8">
          <div>
            <p className="font-serif text-xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">Institutions indexed</p>
          </div>
          {hasTrend && (
            <div>
              <p className="font-serif text-xl font-bold text-foreground">
                {trendSign}
                {averageTrend!.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Avg. improvement this cycle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
