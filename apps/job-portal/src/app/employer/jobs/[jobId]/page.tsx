"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { ApplicationStatusBadge } from "@/components/application-status";
import { CandidateCard, type CandidateSummary } from "@/components/candidate-card";
import { PipelineStats } from "@/components/pipeline-stats";
import { ACCOMMODATION_TYPE_OPTIONS } from "@/lib/matching-options";
import {
  APPLICATION_STATUS_META,
  EMPLOYER_ASSIGNABLE_STATUSES,
  type ApplicationStatus,
} from "@/lib/application-status";

const ACCOMMODATION_LABELS = Object.fromEntries(
  ACCOMMODATION_TYPE_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  matchScore: number | null;
  coverNote: string | null;
  createdAt: string;
  candidate: CandidateSummary;
  accommodationRequestText: string | null;
  accommodationsApprovedAt: string | null;
  needsAccommodationApproval: boolean;
  missingAccommodations: string[];
  rejectionReason: string | null;
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

  async function approveAccommodations(applicationId: string) {
    setUpdatingId(applicationId);
    setStatusError(null);
    try {
      await apiRequest(`/api/jobs/${jobId}/applications/${applicationId}/approve-accommodations`, {
        method: "POST",
      });
      setApplications(
        (prev) =>
          prev &&
          prev.map((a) =>
            a.id === applicationId
              ? { ...a, needsAccommodationApproval: false, accommodationsApprovedAt: new Date().toISOString() }
              : a,
          ),
      );
    } catch (err) {
      setStatusError(err instanceof ApiClientError ? err.message : "Failed to confirm accommodations");
    } finally {
      setUpdatingId(null);
    }
  }

  async function declineAccommodations(applicationId: string) {
    setUpdatingId(applicationId);
    setStatusError(null);
    try {
      const { application } = await apiRequest<{ application: { rejectionReason: string | null } }>(
        `/api/jobs/${jobId}/applications/${applicationId}/decline-accommodations`,
        { method: "POST" },
      );
      setApplications(
        (prev) =>
          prev &&
          prev.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  status: "REJECTED",
                  needsAccommodationApproval: false,
                  rejectionReason: application.rejectionReason,
                }
              : a,
          ),
      );
    } catch (err) {
      setStatusError(err instanceof ApiClientError ? err.message : "Failed to decline");
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
              <div className="mb-6">
                <PipelineStats applications={applications} />
              </div>
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
                    {app.accommodationRequestText && (
                      <p className="mt-1 text-sm text-foreground">
                        Accommodation request: &ldquo;{app.accommodationRequestText}&rdquo;
                      </p>
                    )}
                    {app.needsAccommodationApproval && (
                      <div className="mt-2 flex flex-col items-start gap-2 rounded-md border border-danger bg-danger/10 p-3">
                        <p className="text-sm text-foreground">
                          This candidate needs{" "}
                          <strong>
                            {app.missingAccommodations.map((v) => ACCOMMODATION_LABELS[v] ?? v).join(", ")}
                          </strong>
                          , which your organization hasn&apos;t confirmed providing before. Can you provide
                          this before moving them forward?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={updatingId === app.id}
                            onClick={() => approveAccommodations(app.id)}
                          >
                            {updatingId === app.id ? "Confirming…" : "Yes, we can provide this"}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={updatingId === app.id}
                            onClick={() => declineAccommodations(app.id)}
                          >
                            No, we can&apos;t
                          </Button>
                        </div>
                      </div>
                    )}
                    {app.status === "REJECTED" && app.rejectionReason && (
                      <p className="mt-1 text-xs text-muted-foreground">Declined: {app.rejectionReason}</p>
                    )}
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
