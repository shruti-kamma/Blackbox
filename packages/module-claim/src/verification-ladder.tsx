import Link from "next/link";
import { Button, cn } from "@blackbox/ui";
import { VERIFICATION_LEVEL_LABELS, type VerificationLevel } from "@blackbox/rankings-data";

export interface VerificationLadderProps {
  level: VerificationLevel;
  orgSlug: string;
}

// Small corner "rivet" dots — purely decorative, matching the reference
// card style. aria-hidden since they carry no information.
function CornerDots() {
  return (
    <>
      <span aria-hidden="true" className="absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-border" />
      <span aria-hidden="true" className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-border" />
      <span aria-hidden="true" className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-border" />
      <span aria-hidden="true" className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-border" />
    </>
  );
}

// Reached/current state is never color-only: every stage keeps its visible
// text label, and the current stage also gets a font-weight change (not just
// a color change) plus aria-current, per the WCAG 1.4.1 rule already applied
// to ScoreBadge.
//
// Parked/unused today — no page renders this yet (see docs/decisions.md —
// "Score verification/trust ladder": the full progress-bar ladder is
// company-view-only content, not shown publicly). Kept here since it's the
// intended UI for a future claim flow, not dead code to delete.
export function VerificationLadder({ level, orgSlug }: VerificationLadderProps) {
  return (
    <section
      aria-labelledby="verification-heading"
      className="relative rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <CornerDots />
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2
          id="verification-heading"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Verification level {level}/5
        </h2>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer underline underline-offset-2">What&rsquo;s this?</summary>
          <p className="mt-2 max-w-sm">
            Every score starts as an AI estimate, produced entirely from public filings and
            other published disclosures — no company input required or assumed. Organizations
            can raise their verification level by claiming their record and submitting
            additional data, which is reviewed before it affects the published score.
          </p>
        </details>
      </div>

      <ol aria-label="Verification stages" className="mt-4 flex gap-1.5">
        {VERIFICATION_LEVEL_LABELS.map((label, index) => {
          const reached = index <= level;
          const isCurrent = index === level;
          return (
            <li key={label} className="flex-1">
              <div
                aria-hidden="true"
                className={cn("h-1.5 w-full rounded-full", reached ? "bg-primary" : "bg-border")}
              />
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "mt-1.5 block text-[0.65rem] uppercase tracking-wide",
                  isCurrent ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Is this your organization?</p>
          <p className="text-sm text-muted-foreground">
            Claim this record and start the verification journey toward a certified score.
          </p>
        </div>
        <Button
          asChild
          variant="primary"
          className="shrink-0 rounded-full bg-gradient-to-r from-primary to-secondary"
        >
          <Link href={`/rankings/claim?org=${orgSlug}`}>Claim record</Link>
        </Button>
      </div>
    </section>
  );
}
