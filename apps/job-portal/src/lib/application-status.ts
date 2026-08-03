export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INTERVIEWING"
  | "OFFERED"
  | "REJECTED"
  | "WITHDRAWN";

// The happy-path pipeline a candidate walks through, left to right. REJECTED
// and WITHDRAWN are terminal off-ramps rather than steps on this line, so
// they're handled separately wherever this is rendered.
export const APPLICATION_STATUS_STEPS: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "INTERVIEWING",
  "OFFERED",
];

export const APPLICATION_STATUS_META: Record<ApplicationStatus, { label: string; description: string }> = {
  SUBMITTED: { label: "Applied", description: "Your application has been sent to the employer." },
  UNDER_REVIEW: { label: "Viewed by employer", description: "The employer has opened your application." },
  INTERVIEWING: { label: "Interviewing", description: "You've been shortlisted for an interview." },
  OFFERED: { label: "Offer extended", description: "The employer has made you an offer." },
  REJECTED: { label: "Not selected", description: "The employer has moved forward with other candidates." },
  WITHDRAWN: { label: "Withdrawn", description: "This application was withdrawn." },
};

// Statuses an employer can move an application into from the dashboard.
// SUBMITTED is the starting state and WITHDRAWN is a candidate-only action,
// so neither is offered here.
export const EMPLOYER_ASSIGNABLE_STATUSES: ApplicationStatus[] = [
  "UNDER_REVIEW",
  "INTERVIEWING",
  "OFFERED",
  "REJECTED",
];

export function applicationStatusColor(status: ApplicationStatus) {
  switch (status) {
    case "OFFERED":
      return { border: "var(--color-success)", text: "var(--color-success)", background: "color-mix(in srgb, var(--color-success) 10%, transparent)" };
    case "REJECTED":
      return { border: "var(--color-danger)", text: "var(--color-danger)", background: "color-mix(in srgb, var(--color-danger) 10%, transparent)" };
    case "INTERVIEWING":
    case "UNDER_REVIEW":
      return { border: "var(--color-primary)", text: "var(--color-primary)", background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" };
    case "SUBMITTED":
    case "WITHDRAWN":
    default:
      return { border: "var(--color-border)", text: "var(--color-muted-foreground)", background: "var(--color-muted)" };
  }
}
