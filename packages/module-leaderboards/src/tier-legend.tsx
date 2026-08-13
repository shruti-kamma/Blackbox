import { cn } from "@blackbox/ui";
import { getMaturityDistribution, MATURITY_LEVEL_DOT_CLASS, type MockOrg } from "@blackbox/rankings-data";

export interface TierLegendProps {
  orgs: MockOrg[];
}

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
              <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", MATURITY_LEVEL_DOT_CLASS[d.level])} />
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
                className={cn("h-full", MATURITY_LEVEL_DOT_CLASS[d.level])}
                style={{ width: `${d.percentage}%` }}
              />
            ),
        )}
      </div>
    </div>
  );
}
