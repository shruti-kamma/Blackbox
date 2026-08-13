import type { CSSProperties } from "react";
import { getIndustryMetricMatrix, type MockOrg } from "@blackbox/rankings-data";

export interface MetricHeatmapProps {
  orgs: MockOrg[];
}

// Metrics in a fixed order (matches score_orgs.py's METRIC_FIELDS), not
// alphabetical or score-sorted — a stable column order the reader can
// learn, same reasoning as getMaturityDistribution's fixed level order.
const METRIC_ORDER = [
  "Accessibility", "Policy", "Employment", "Recruitment", "Retention",
  "Leadership", "Learning", "Culture", "Employee Feedback", "Compliance",
] as const;

const CLAIM_GATED = new Set(["Retention", "Leadership", "Employee Feedback"]);

// Sequential single-hue ramp (light -> dark primary), never a rainbow —
// matches the site's established "one intensity scale, no color-coded
// severity" rule (see ScoreBadge). Deliberately an industry x metric
// grid, not org x metric: with 10 industries and 10 metrics this stays a
// legible ~100-cell table; a per-org grid would need one row per
// organization and become illegible (and unreadable in a narrow layout)
// at any real org count.
function cellStyle(pct: number): CSSProperties {
  const clamped = Math.max(0, Math.min(100, pct));
  return {
    backgroundColor: `color-mix(in oklab, var(--color-primary) ${clamped}%, var(--color-muted) ${100 - clamped}%)`,
    color: clamped > 55 ? "var(--color-primary-foreground)" : "var(--color-foreground)",
  };
}

// Industry x metric average-subscore grid for the current org set —
// surfaces which specific metric is weak in which specific industry,
// distinct from the sidebar's single-axis views (SectorAveragesPanel:
// industry only; DisclosureGapsPanel: metric only). Needs real width
// (10 columns), so this lives as a full-width section rather than a
// narrow sidebar widget.
export function MetricHeatmap({ orgs }: MetricHeatmapProps) {
  if (orgs.length === 0) return null;
  const cells = getIndustryMetricMatrix(orgs);
  const industries = Array.from(new Set(cells.map((c) => c.industry))).sort();
  if (industries.length === 0) return null;

  const lookup = new Map(cells.map((c) => [`${c.industry} ${c.category}`, c]));

  return (
    <section aria-labelledby="metric-heatmap-heading" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 id="metric-heatmap-heading" className="font-serif text-xl font-semibold text-foreground">
            Industry x metric breakdown
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Average subscore per metric, within each industry.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Weaker</span>
          <span
            aria-hidden="true"
            className="h-2.5 w-20 rounded-full"
            style={{ background: "linear-gradient(to right, var(--color-muted), var(--color-primary))" }}
          />
          <span>Stronger</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-xs">
          <caption className="sr-only">
            Average subscore per metric within each industry. Retention, Leadership, and Employee Feedback are
            claim-gated and excluded from every organization&rsquo;s overall score.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 bg-card px-2 py-1 text-left font-medium text-muted-foreground">
                Industry
              </th>
              {METRIC_ORDER.map((metric) => (
                <th
                  key={metric}
                  scope="col"
                  className="min-w-16 px-1 py-1 text-center font-medium text-muted-foreground"
                  title={CLAIM_GATED.has(metric) ? `${metric} (claim-gated — excluded from overall score)` : metric}
                >
                  {metric}
                  {CLAIM_GATED.has(metric) && <span className="ml-0.5 align-super">†</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {industries.map((industry) => (
              <tr key={industry}>
                <th scope="row" className="sticky left-0 bg-card px-2 py-1 text-left font-medium text-foreground">
                  {industry}
                </th>
                {METRIC_ORDER.map((metric) => {
                  const cell = lookup.get(`${industry} ${metric}`);
                  const score = cell?.averageSubscore ?? 0;
                  return (
                    <td
                      key={metric}
                      className="rounded-md px-1 py-1.5 text-center font-medium tabular-nums"
                      style={cellStyle(score)}
                      title={`${industry} — ${metric}: ${score} average${cell ? ` (n=${cell.count})` : ""}`}
                    >
                      {score}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        &dagger; Claim-gated — not yet disclosable pre-claim (see the{" "}
        <a href="/ranking/methodology" className="underline underline-offset-2">
          methodology
        </a>
        ), so these columns are structurally near-zero everywhere rather than an industry-specific weakness.
      </p>
    </section>
  );
}
