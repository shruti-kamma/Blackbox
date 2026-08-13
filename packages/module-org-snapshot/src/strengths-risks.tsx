import type { ScoreBreakdownItem } from "@blackbox/rankings-data";

export interface StrengthsRisksProps {
  breakdown: ScoreBreakdownItem[];
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

// Derived directly from the breakdown, not hand-authored per org — top 3
// highest-scoring categories are "strengths," the 3 lowest are "risks"
// (using each item's own rationale, so this stays consistent as breakdown
// data changes rather than drifting out of sync with separately-written
// copy). Claim-gated metrics (includedInScore === false) are excluded
// from this ranking — they score near-0 for every unclaimed org by
// construction (nothing to disclose pre-claim), so leaving them in would
// make "Quick risks" the same three claim-gated categories for every
// single company instead of a real signal.
export function StrengthsRisks({ breakdown }: StrengthsRisksProps) {
  const rankable = breakdown.filter((item) => item.includedInScore !== false);
  const sorted = [...rankable].sort((a, b) => b.subscore - a.subscore);
  const strengths = sorted.slice(0, 3);
  const risks = sorted.slice(-3).reverse();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Quick strengths</h3>
        <ul className="mt-3 space-y-3">
          {strengths.map((item) => (
            <li key={item.category} className="flex gap-2 text-sm text-muted-foreground">
              <CheckIcon />
              <span>
                <span className="font-medium text-foreground">{item.category}</span> — {item.rationale}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Quick risks</h3>
        <ul className="mt-3 space-y-3">
          {risks.map((item) => (
            <li key={item.category} className="flex gap-2 text-sm text-muted-foreground">
              <WarningIcon />
              <span>
                <span className="font-medium text-foreground">{item.category}</span> —{" "}
                {item.recommendation ?? item.rationale}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
