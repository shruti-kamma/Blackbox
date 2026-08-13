import { getScoreDistribution, type MockOrg } from "@blackbox/rankings-data";

export interface ScoreDistributionPanelProps {
  orgs: MockOrg[];
}

// Histogram of overallScore across fixed 10-point buckets — the shape of
// the distribution (clustered, skewed, bimodal) rather than any single
// summary number. Same bar-list visual pattern as SectorAveragesPanel
// (thin rounded bar, single-hue intensity) for consistency, not a new
// chart idiom introduced just for this one widget.
export function ScoreDistributionPanel({ orgs }: ScoreDistributionPanelProps) {
  if (orgs.length === 0) return null;
  const buckets = getScoreDistribution(orgs);

  return (
    <section
      aria-labelledby="score-distribution-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <h2 id="score-distribution-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Score distribution
      </h2>
      <ul className="mt-3 flex flex-col gap-1.5">
        {buckets.map((b) => (
          <li key={b.rangeLabel} className="flex items-center gap-2 text-xs">
            <span className="w-12 shrink-0 tabular-nums text-muted-foreground">{b.rangeLabel}</span>
            <span
              className="h-3 flex-1 overflow-hidden rounded-full bg-muted"
              aria-hidden="true"
              title={`${b.count} organization${b.count === 1 ? "" : "s"} scored ${b.rangeLabel}`}
            >
              <span
                className="block h-3 rounded-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${b.percentage}%` }}
              />
            </span>
            <span className="w-4 shrink-0 text-right tabular-nums text-foreground">{b.count}</span>
          </li>
        ))}
      </ul>
      {/* Screen-reader/table fallback for the bar visualization above, per
          the "a table view always exists" accessibility rule. */}
      <table className="sr-only">
        <caption>Score distribution</caption>
        <thead>
          <tr>
            <th scope="col">Score range</th>
            <th scope="col">Organizations</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.rangeLabel}>
              <td>{b.rangeLabel}</td>
              <td>{b.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
