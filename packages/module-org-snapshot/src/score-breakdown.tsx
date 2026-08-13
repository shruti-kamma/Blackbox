import type { ScoreBreakdownItem } from "@blackbox/rankings-data";
import { ScoreBadge } from "@blackbox/module-leaderboards";

export interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownItem[];
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <dl className="divide-y divide-border">
      {breakdown.map((item) => {
        // Claim-gated metrics (see ScoreBreakdownItem.includedInScore)
        // don't get a maturity-tier badge — that language ("Emerging",
        // etc.) implies a real, comparable performance measure, but these
        // three are near-0 for every unclaimed org purely from lack of a
        // BRSR disclosure field, not from anything the org did or didn't do.
        const notYetDisclosed = item.includedInScore === false;
        return (
          <div key={item.category} className="grid gap-2 py-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-6">
            <div>
              <dt className="font-serif text-lg font-semibold text-foreground">{item.category}</dt>
              <dd className="mt-1">
                {notYetDisclosed ? (
                  <span className="inline-flex items-baseline gap-1.5 border-l-2 border-border pl-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Not yet disclosed
                    </span>
                  </span>
                ) : (
                  <ScoreBadge score={item.subscore} />
                )}
              </dd>
            </div>
            <div>
              <blockquote className="border-l-2 border-primary pl-4 font-serif text-lg leading-relaxed text-foreground italic">
                &ldquo;{item.rationale}&rdquo;
              </blockquote>
              {notYetDisclosed && (
                <p className="mt-3 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                  Not counted toward the overall score yet — this becomes available once the organization
                  claims its record and can self-declare this data directly.
                </p>
              )}
              {!notYetDisclosed && item.recommendation && (
                <p className="mt-3 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">How to improve: </span>
                  {item.recommendation}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </dl>
  );
}
