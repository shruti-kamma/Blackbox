import { cn } from "@blackbox/ui";
import { MATURITY_LEVEL_DOT_CLASS, MATURITY_LEVEL_LABELS, type MaturityLevel } from "@blackbox/rankings-data";

export interface MaturityLadderProps {
  level: MaturityLevel;
  className?: string;
}

// Reached/current state is never color-only: every stage keeps its visible
// text label, and the current stage gets a font-weight change (not just a
// color change) plus aria-current, per the WCAG 1.4.1 rule applied
// elsewhere (see ScoreBadge). Each reached rung fills with its own tier
// color (MATURITY_LEVEL_DOT_CLASS) rather than one uniform gradient
// across all of them, so the bar itself reads as a graduated intensity
// scale left-to-right, not just a single "how far along" fill.
export function MaturityLadder({ level, className }: MaturityLadderProps) {
  const levelIndex = MATURITY_LEVEL_LABELS.indexOf(level);

  return (
    <div className={cn("", className)}>
      <ol aria-label="Maturity level" className="flex gap-1.5">
        {MATURITY_LEVEL_LABELS.map((label, index) => {
          const reached = index <= levelIndex;
          const isCurrent = index === levelIndex;
          return (
            <li key={label} className="flex-1">
              <div
                aria-hidden="true"
                className={cn("h-1.5 w-full rounded-full", reached ? MATURITY_LEVEL_DOT_CLASS[label] : "bg-muted")}
              />
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "mt-1.5 block text-[0.65rem] tracking-wide",
                  isCurrent ? "font-semibold text-foreground" : "font-normal text-muted-foreground/70",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs italic text-muted-foreground">What gets measured gets improved.</p>
    </div>
  );
}
