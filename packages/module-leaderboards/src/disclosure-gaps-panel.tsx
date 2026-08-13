import { getMetricAverages, type MockOrg } from "@blackbox/rankings-data";

export interface DisclosureGapsPanelProps {
  orgs: MockOrg[];
  limit?: number;
}

// Lowest-averaging metrics across the current org set — restricted to the
// 7 observable (non-claim-gated) metrics only. Retention/Leadership/
// Employee Feedback would always sit at the bottom by construction (no
// company can disclose them pre-claim — see docs/decisions.md, "Claim-
// gated metrics"), which would make this panel repeat a known structural
// gap instead of surfacing the differentiating, actually-actionable one:
// which of the *observable* metrics this org set most consistently
// under-discloses.
export function DisclosureGapsPanel({ orgs, limit = 5 }: DisclosureGapsPanelProps) {
  if (orgs.length === 0) return null;
  const weakest = getMetricAverages(orgs)
    .filter((m) => m.includedInScore)
    .slice(0, limit);
  if (weakest.length === 0) return null;

  return (
    <section
      aria-labelledby="disclosure-gaps-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <h2 id="disclosure-gaps-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Weakest disclosure areas
      </h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {weakest.map((m) => (
          <li key={m.category}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-foreground">{m.category}</span>
              <span className="tabular-nums text-muted-foreground">{m.averageSubscore}</span>
            </div>
            <div
              className="mt-1 h-1.5 w-full rounded-full bg-muted"
              aria-hidden="true"
              title={`${m.category}: average subscore ${m.averageSubscore}`}
            >
              <div className="h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${m.averageSubscore}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
