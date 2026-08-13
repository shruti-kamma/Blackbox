import type { ScoreBreakdownItem } from "@blackbox/rankings-data";

export interface DimensionScorecardProps {
  breakdown: ScoreBreakdownItem[];
}

// Compact "score vs industry average" summary — the client's mockup shows
// this alongside a radar chart; we're only building the bar list for now
// (same information, much less implementation surface for an MVP pass).
export function DimensionScorecard({ breakdown }: DimensionScorecardProps) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
      {breakdown.map((item) => {
        // Claim-gated metrics (see ScoreBreakdownItem.includedInScore)
        // read as near-0 for every unclaimed org by construction — a "vs
        // industry average" delta bar would misrepresent that as a real
        // performance gap rather than data that simply isn't available
        // yet pre-claim.
        if (item.includedInScore === false) {
          return (
            <div key={item.category}>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-sm font-medium text-foreground">{item.category}</dt>
                <dd className="shrink-0 text-xs text-muted-foreground">Not yet disclosed</dd>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted" aria-hidden="true" />
            </div>
          );
        }
        const delta = item.subscore - item.industryAverage;
        const sign = delta >= 0 ? "+" : "";
        return (
          <div key={item.category}>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-sm font-medium text-foreground">{item.category}</dt>
              <dd className="shrink-0 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{item.subscore}</span> vs{" "}
                {item.industryAverage} ({sign}
                {delta})
              </dd>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted" aria-hidden="true">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${item.subscore}%` }}
              />
            </div>
          </div>
        );
      })}
    </dl>
  );
}
