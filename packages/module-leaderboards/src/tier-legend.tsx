import { cn } from "@blackbox/ui";
import { getMaturityDistribution, type MockOrg } from "@blackbox/rankings-data";

export interface TierLegendProps {
  orgs: MockOrg[];
}

// Intensity scale (muted -> the navy/purple gradient duo), never a
// red/amber/green severity signal — the tier label text is always the
// real signal, per the established "severity is not color-coded" rule
// (see ScoreBadge). Higher maturity gets more visual weight, not a
// judgment-coded color.
const LEVEL_FILL_CLASS: Record<string, string> = {
  Emerging: "bg-muted-foreground/25",
  Developing: "bg-muted-foreground/45",
  Progressing: "bg-primary/50",
  Leading: "bg-primary/80",
  Transforming: "bg-gradient-to-r from-primary to-secondary",
};

export function TierLegend({ orgs }: TierLegendProps) {
  const distribution = getMaturityDistribution(orgs);
  const total = orgs.length;

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{total}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span>
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {distribution.map((d) => (
            <li key={d.level} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", LEVEL_FILL_CLASS[d.level])} />
              {d.level} · {d.percentage}%
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
        {distribution.map(
          (d) =>
            d.percentage > 0 && (
              <div
                key={d.level}
                className={cn("h-full", LEVEL_FILL_CLASS[d.level])}
                style={{ width: `${d.percentage}%` }}
              />
            ),
        )}
      </div>
    </div>
  );
}
