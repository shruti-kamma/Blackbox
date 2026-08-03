"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { ApplicationStatusBadge } from "@/components/application-status";
import { CandidateCard, type CandidateSummary } from "@/components/candidate-card";
import {
  APPLICATION_STATUS_META,
  EMPLOYER_ASSIGNABLE_STATUSES,
  applicationStatusColor,
  type ApplicationStatus,
} from "@/lib/application-status";

const PIPELINE_ORDER: ApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "INTERVIEWING",
  "OFFERED",
  "REJECTED",
  "WITHDRAWN",
];

function PipelineStats({ applications }: { applications: ApplicationRow[] }) {
  const counts = PIPELINE_ORDER.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  return (
    <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
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

interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  matchScore: number | null;
  coverNote: string | null;
  createdAt: string;
  candidate: CandidateSummary;
}

interface MatchRow {
  id: string;
  score: number;
  hasApplied: boolean;
  candidate: CandidateSummary;
}

export default function EmployerJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [tab, setTab] = useState<"applications" | "matches">("applications");
  const [applications, setApplications] = useState<ApplicationRow[] | null>(null);
  const [matches, setMatches] = useState<MatchRow[] | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ applications: ApplicationRow[] }>(`/api/jobs/${jobId}/applications`).then(({ applications }) =>
      setApplications(applications),
    );
    apiRequest<{ matches: MatchRow[] }>(`/api/jobs/${jobId}/matched-candidates`).then(({ matches }) =>
      setMatches(matches),
    );
  }, [jobId]);

  async function updateStatus(applicationId: string, status: ApplicationStatus) {
    setUpdatingId(applicationId);
    setStatusError(null);
    try {
      await apiRequest(`/api/jobs/${jobId}/applications/${applicationId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setApplications((prev) => prev && prev.map((a) => (a.id === applicationId ? { ...a, status } : a)));
    } catch (err) {
      setStatusError(err instanceof ApiClientError ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Job dashboard</h1>

      <div role="tablist" className="mb-6 flex gap-2 border-b border-border">
        <button
          role="tab"
          aria-selected={tab === "applications"}
          onClick={() => setTab("applications")}
          className={`h-touch-target px-4 text-sm font-medium ${tab === "applications" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
        >
          Applications {applications ? `(${applications.length})` : ""}
        </button>
        <button
          role="tab"
          aria-selected={tab === "matches"}
          onClick={() => setTab("matches")}
          className={`h-touch-target px-4 text-sm font-medium ${tab === "matches" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
        >
          Matched candidates {matches ? `(${matches.length})` : ""}
        </button>
      </div>

      {tab === "applications" && (
        <div className="flex flex-col gap-3">
          {statusError && (
            <p role="alert" className="text-sm text-danger">
              {statusError}
            </p>
          )}
          {applications === null ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <>
              <PipelineStats applications={applications} />
              {applications.length === 0 ? (
                <p className="text-muted-foreground">No applications yet.</p>
              ) : (
                applications.map((app) => (
                  <div key={app.id}>
                    <CandidateCard
                      candidate={app.candidate}
                      score={app.matchScore}
                      actions={
                        <div className="flex flex-col items-end gap-2">
                          <ApplicationStatusBadge status={app.status} />
                          {app.status === "WITHDRAWN" ? (
                            <span className="text-right text-xs text-muted-foreground">
                              Withdrawn by candidate
                            </span>
                          ) : (
                            <label className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                              Move to
                              <select
                                className="h-touch-target rounded-md border border-border bg-background px-2 text-sm text-foreground"
                                value={app.status}
                                disabled={updatingId === app.id}
                                onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                              >
                                {app.status === "SUBMITTED" && <option value="SUBMITTED">Applied</option>}
                                {EMPLOYER_ASSIGNABLE_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {APPLICATION_STATUS_META[s].label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                        </div>
                      }
                    />
                    {app.coverNote && <p className="mt-1 text-sm text-foreground">“{app.coverNote}”</p>}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}

      {tab === "matches" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Candidates matched to this role, whether or not they&apos;ve applied yet.
          </p>
          {matches === null ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : matches.length === 0 ? (
            <p className="text-muted-foreground">No matches yet.</p>
          ) : (
            matches.map((m) => (
              <div key={m.id}>
                <CandidateCard candidate={m.candidate} score={m.score} />
                {m.hasApplied && <p className="text-xs text-success">Already applied</p>}
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
