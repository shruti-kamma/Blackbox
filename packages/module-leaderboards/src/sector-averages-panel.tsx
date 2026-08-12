import { getSectorAverages, type MockOrg } from "@blackbox/rankings-data";

export interface SectorAveragesPanelProps {
  orgs: MockOrg[];
}

export function SectorAveragesPanel({ orgs }: SectorAveragesPanelProps) {
  const sectors = getSectorAverages(orgs);
  if (sectors.length === 0) return null;

  return (
    <section
      aria-labelledby="sector-averages-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <h2 id="sector-averages-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Sector average
      </h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {sectors.map((s) => (
          <li key={s.industry}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-foreground">{s.industry}</span>
              <span className="tabular-nums text-muted-foreground">{Math.round(s.averageScore)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted" aria-hidden="true">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${s.averageScore}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
