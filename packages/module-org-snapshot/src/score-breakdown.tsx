import type { ScoreBreakdownItem } from "@blackbox/rankings-data";
import { ScoreBadge } from "@blackbox/module-leaderboards";

export interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownItem[];
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <dl className="divide-y divide-border">
      {breakdown.map((item) => (
        <div key={item.category} className="grid gap-2 py-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-6">
          <div>
            <dt className="font-serif text-lg font-semibold text-foreground">{item.category}</dt>
            <dd className="mt-1">
              <ScoreBadge score={item.subscore} />
            </dd>
          </div>
          <div>
            <blockquote className="border-l-2 border-primary pl-4 font-serif text-lg leading-relaxed text-foreground italic">
              &ldquo;{item.rationale}&rdquo;
            </blockquote>
            {item.recommendation && (
              <p className="mt-3 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">How to improve: </span>
                {item.recommendation}
              </p>
            )}
          </div>
        </div>
      ))}
    </dl>
  );
}
