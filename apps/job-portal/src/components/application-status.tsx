import {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_STEPS,
  applicationStatusColor,
  type ApplicationStatus,
} from "@/lib/application-status";

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const color = applicationStatusColor(status);
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
      style={{ borderColor: color.border, color: color.text, backgroundColor: color.background }}
    >
      {APPLICATION_STATUS_META[status].label}
    </span>
  );
}

// A left-to-right progress line through the happy path (Applied -> Viewed ->
// Interviewing -> Offer). REJECTED/WITHDRAWN are terminal off-ramps, not a
// step on this line, so callers show the badge alone for those instead.
export function ApplicationStepper({ status }: { status: ApplicationStatus }) {
  const currentIndex = APPLICATION_STATUS_STEPS.indexOf(status);
  if (currentIndex === -1) return null;

  return (
    <ol className="flex items-center gap-1" aria-label="Application progress">
      {APPLICATION_STATUS_STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <li key={step} className="flex items-center gap-1">
            <span
              className="h-2 w-6 rounded-full"
              style={{ backgroundColor: reached ? "var(--color-primary)" : "var(--color-border)" }}
              title={APPLICATION_STATUS_META[step].label}
            />
            {i < APPLICATION_STATUS_STEPS.length - 1 && <span className="sr-only"> then </span>}
          </li>
        );
      })}
    </ol>
  );
}
