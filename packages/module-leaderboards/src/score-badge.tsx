import { cn } from "@blackbox/ui";
import { getMaturityLevel, VERIFICATION_LEVEL_LABELS, type VerificationLevel } from "@blackbox/rankings-data";

export interface ScoreBadgeProps {
  score: number;
  verificationLevel?: VerificationLevel;
  className?: string;
}

// Score is always paired with a text label (never color alone, per WCAG
// 1.4.1) — the tier label is the client's 5-tier maturity ladder. Severity
// is not color-coded (minimal black/white/indigo palette — see
// docs/decisions.md): the tier text carries the signal on its own.
// `verificationLevel`, when passed, shows the actual level label (e.g. "AI
// Est.", "Registered") — the same text used in company view, just without
// the full progress-bar visualization (that's company-view only).
// Shared by module-leaderboards and module-org-snapshot — see org-avatar.tsx
// for why this lives here rather than being duplicated.
export function ScoreBadge({ score, verificationLevel, className }: ScoreBadgeProps) {
  const tier = getMaturityLevel(score);
  return (
    <span className={cn("inline-flex items-baseline gap-1.5 border-l-2 border-foreground pl-2", className)}>
      <span className="font-serif text-lg font-semibold tabular-nums text-foreground">{score}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{tier}</span>
      {verificationLevel !== undefined && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          {VERIFICATION_LEVEL_LABELS[verificationLevel]}
        </span>
      )}
    </span>
  );
}
