import { cn } from "@blackbox/ui";

const LOCKED_TABS = [
  "B4I Benchmark",
  "B4I Gap Analysis",
  "B4I Roadmap",
  "B4I Impact Simulator",
  "B4I Progress Tracker",
  "B4I Recognition",
  "B4I Executive Boardroom",
] as const;

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </svg>
  );
}

// Only Snapshot is a real, navigable tab on the public site — the other
// seven belong to the private company-view dashboard (see
// docs/decisions.md). They're still listed here, disabled, so a visitor
// can see the fuller product exists without exposing any of its content —
// no href, not focusable as a link, so this degrades to plain text with
// CSS off rather than a broken/dead link.
export function SnapshotTabs() {
  return (
    <nav aria-label="Report sections" className="overflow-x-auto border-b border-border">
      <ul className="flex min-w-max gap-1">
        <li>
          <span
            aria-current="page"
            className="inline-block border-b-2 border-foreground px-4 py-3 text-sm font-semibold text-foreground"
          >
            B4I Snapshot
          </span>
        </li>
        {LOCKED_TABS.map((label) => (
          <li key={label}>
            <span
              className={cn(
                "inline-flex cursor-not-allowed items-center gap-1.5 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground/60",
              )}
              title="Available in company view"
            >
              {label}
              <LockIcon />
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
