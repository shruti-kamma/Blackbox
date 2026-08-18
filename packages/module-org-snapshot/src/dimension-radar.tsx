import type { ScoreBreakdownItem } from "@blackbox/rankings-data";

export interface DimensionRadarProps {
  breakdown: ScoreBreakdownItem[];
}

const SIZE = 300;
const CENTER = SIZE / 2;
const MAX_RADIUS = 95;
const LABEL_RADIUS = 122;
const RING_STEPS = [25, 50, 75, 100];

function pointAt(index: number, total: number, radius: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

function pointFor(index: number, total: number, value: number, radius: number) {
  return pointAt(index, total, (value / 100) * radius);
}

function labelAnchor(index: number, total: number): { anchor: "start" | "middle" | "end"; dy: number } {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  const anchor = x > 0.15 ? "start" : x < -0.15 ? "end" : "middle";
  const dy = y > 0.5 ? 10 : y < -0.5 ? -4 : 3;
  return { anchor, dy };
}

// Client-plotted breakdown across all 10 metrics, plain SVG (no charting
// dependency in this repo). Claim-gated metrics (see includedInScore) are
// plotted at their real subscore rather than hidden — a radar chart's
// axes are fixed, so omitting three would either collapse the shape or
// require a different chart per org; instead their axis labels get a
// dagger + a caption note, same "explain, don't hide" treatment as the
// dagger convention in MetricHeatmap. A single series needs no legend box
// (the heading names it), per the accessibility pass rule.
export function DimensionRadar({ breakdown }: DimensionRadarProps) {
  if (breakdown.length === 0) return null;
  const total = breakdown.length;
  const hasClaimGated = breakdown.some((b) => b.includedInScore === false);

  const points = breakdown.map((item, i) => pointFor(i, total, item.subscore, MAX_RADIUS));
  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-labelledby="dimension-radar-title" className="mx-auto w-full max-w-sm">
        <title id="dimension-radar-title">Score across all 10 metrics</title>

        {/* Recessive reference rings + axis spokes — low-contrast, never the focal ink. */}
        {RING_STEPS.map((step) => (
          <polygon
            key={step}
            points={breakdown.map((_, i) => {
              const p = pointFor(i, total, step, MAX_RADIUS);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        ))}
        {breakdown.map((item, i) => {
          const edge = pointFor(i, total, 100, MAX_RADIUS);
          return (
            <line
              key={item.category}
              x1={CENTER}
              y1={CENTER}
              x2={edge.x}
              y2={edge.y}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          );
        })}

        {/* The data polygon itself — 2px line per the mark spec, translucent fill. */}
        <polygon points={polygonPath} fill="var(--color-primary)" fillOpacity={0.16} stroke="var(--color-primary)" strokeWidth={2} strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={breakdown[i]!.category} cx={p.x} cy={p.y} r={4} fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth={2}>
            <title>
              {breakdown[i]!.category}: {breakdown[i]!.subscore}
              {breakdown[i]!.includedInScore === false ? " (claim-gated, not yet disclosed)" : ""}
            </title>
          </circle>
        ))}

        {/* Axis labels, anchored/offset per quadrant so text reads outward rather than overlapping the plot. */}
        {breakdown.map((item, i) => {
          const label = pointAt(i, total, LABEL_RADIUS);
          const { anchor, dy } = labelAnchor(i, total);
          return (
            <text
              key={item.category}
              x={label.x}
              y={label.y + dy}
              textAnchor={anchor}
              fontSize={11}
              fill="var(--color-muted-foreground)"
            >
              {item.category}
              {item.includedInScore === false ? "†" : ""}
            </text>
          );
        })}
      </svg>

      {hasClaimGated && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          &dagger; Claim-gated — plotted at its real (near-zero) subscore, but not counted toward the overall score.
        </p>
      )}

      {/* Table fallback for the same data, per the accessibility rule that a table view always exists alongside a chart. */}
      <table className="sr-only">
        <caption>Score by metric</caption>
        <thead>
          <tr>
            <th scope="col">Metric</th>
            <th scope="col">Subscore</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((item) => (
            <tr key={item.category}>
              <td>{item.category}</td>
              <td>{item.subscore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
