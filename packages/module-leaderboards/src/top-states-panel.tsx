import { getTopStates, type MockOrg } from "@blackbox/rankings-data";

export interface TopStatesPanelProps {
  orgs: MockOrg[];
}

export function TopStatesPanel({ orgs }: TopStatesPanelProps) {
  const states = getTopStates(orgs, 5);
  if (states.length === 0) return null;

  return (
    <section
      aria-labelledby="top-states-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <h2 id="top-states-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Top states
      </h2>
      <ol className="mt-3 flex flex-col gap-2 text-sm">
        {states.map((s, i) => (
          <li key={s.state} className="flex items-baseline justify-between gap-2">
            <span className="text-foreground">
              <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
              {s.state}
            </span>
            <span className="tabular-nums font-medium text-foreground">{s.count}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
