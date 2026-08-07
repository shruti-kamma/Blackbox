import { APPLICATION_STATUS_META, applicationStatusColor, type ApplicationStatus } from "@/lib/application-status";

const PIPELINE_ORDER: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "INTERVIEWING",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
];

export function PipelineStats({ applications }: { applications: { status: ApplicationStatus }[] }) {
  const counts = PIPELINE_ORDER.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      <div className="rounded-md border border-border p-3">
        <p className="text-2xl font-semibold tabular-nums text-foreground">{applications.length}</p>
        <p className="text-xs text-muted-foreground">Total</p>
      </div>
      {counts.map(({ status, count }) => {
        const color = applicationStatusColor(status);
        return (
          <div key={status} className="rounded-md border p-3" style={{ borderColor: color.border }}>
            <p className="text-2xl font-semibold tabular-nums" style={{ color: color.text }}>
              {count}
            </p>
            <p className="text-xs text-muted-foreground">{APPLICATION_STATUS_META[status].label}</p>
          </div>
        );
      })}
    </div>
  );
}
