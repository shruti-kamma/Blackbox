import { cn } from "@blackbox/ui";
import {
  getMaturityLevel,
  MATURITY_LEVEL_DOT_CLASS,
  VERIFICATION_LEVEL_LABELS,
  type VerificationLevel,
} from "@blackbox/rankings-data";

export interface ScoreBadgeProps {
  score: number;
  verificationLevel?: VerificationLevel;
  className?: string;
}

// The score is the loud element; the tier reads as a small color dot +
// quiet caption rather than a bold uppercase label, since this repeats on
// every leaderboard row and score-breakdown item — full-size tier text
// everywhere it appears gets noisy fast. The dot's color is the at-a-
// glance signal, but the text stays (small, not color-alone) per WCAG
// 1.4.1 — color reinforces the tier here, it doesn't replace it, which
// matters more on this product than most given what it's ranking.
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
      <span className="inline-flex items-center gap-1">
        <span aria-hidden="true" className={cn("h-1.5 w-1.5 shrink-0 rounded-full", MATURITY_LEVEL_DOT_CLASS[tier])} />
        <span className="text-[0.7rem] text-muted-foreground">{tier}</span>
      </span>
      {verificationLevel !== undefined && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
          {VERIFICATION_LEVEL_LABELS[verificationLevel]}
        </span>
      )}
    </span>
  );
}
