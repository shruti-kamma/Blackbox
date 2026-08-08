"use client";

import { useEffect, useState } from "react";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { ApplicationStatusBadge, ApplicationStepper } from "@/components/application-status";
import type { ApplicationStatus } from "@/lib/application-status";

interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  matchScore: number | null;
  coverNote: string | null;
  createdAt: string;
  updatedAt: string;
  accommodationRequestText: string | null;
  accommodationRequestSentAt: string | null;
  accommodationsApprovedAt: string | null;
  rejectionReason: string | null;
  job: {
    id: string;
    title: string;
    location: string | null;
    remote: boolean;
    organization: { id: string; name: string };
  };
}

interface ReviewDraft {
  honoredAccommodations: "" | "YES" | "NO" | "NOT_REQUESTED";
  accessibleProcess: "" | "YES" | "NO";
  comment: string;
}

const EMPTY_REVIEW_DRAFT: ReviewDraft = { honoredAccommodations: "", accessibleProcess: "", comment: "" };

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [requestDrafts, setRequestDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [expandedReviewOrgId, setExpandedReviewOrgId] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft>(EMPTY_REVIEW_DRAFT);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewedOrgIds, setReviewedOrgIds] = useState<Set<string>>(new Set());

  function load() {
    apiRequest<{ applications: ApplicationRow[] }>("/api/candidate/applications")
      .then(({ applications }) => setApplications(applications))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load applications"));
  }

  useEffect(load, []);

  async function withdraw(applicationId: string) {
    setWithdrawingId(applicationId);
    setError(null);
    try {
      await apiRequest(`/api/candidate/applications/${applicationId}/withdraw`, { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to withdraw application");
    } finally {
      setWithdrawingId(null);
    }
  }

  async function sendAccommodationRequest(applicationId: string) {
    const text = (requestDrafts[applicationId] ?? "").trim();
    if (!text) return;
    setSendingId(applicationId);
    setError(null);
    try {
      await apiRequest(`/api/candidate/applications/${applicationId}/accommodation-request`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to send request");
    } finally {
      setSendingId(null);
    }
  }

  async function openReview(orgId: string) {
    if (expandedReviewOrgId === orgId) {
      setExpandedReviewOrgId(null);
      return;
    }
    setExpandedReviewOrgId(orgId);
    setReviewDraft(EMPTY_REVIEW_DRAFT);
    setReviewLoading(true);
    try {
      const { myReview } = await apiRequest<{
        myReview: { honoredAccommodations: boolean | null; accessibleProcess: boolean; comment: string | null } | null;
      }>(`/api/employers/${orgId}/reviews`);
      if (myReview) {
        setReviewDraft({
          honoredAccommodations:
            myReview.honoredAccommodations === null
              ? "NOT_REQUESTED"
              : myReview.honoredAccommodations
                ? "YES"
                : "NO",
          accessibleProcess: myReview.accessibleProcess ? "YES" : "NO",
          comment: myReview.comment ?? "",
        });
        setReviewedOrgIds((s) => new Set(s).add(orgId));
      }
    } catch {
      // Non-critical — the form still works starting from a blank draft.
    } finally {
      setReviewLoading(false);
    }
  }

  async function submitReview(orgId: string) {
    if (!reviewDraft.honoredAccommodations || !reviewDraft.accessibleProcess) return;
    setReviewSaving(true);
    setError(null);
    try {
      await apiRequest(`/api/employers/${orgId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          honoredAccommodations:
            reviewDraft.honoredAccommodations === "NOT_REQUESTED" ? null : reviewDraft.honoredAccommodations === "YES",
          accessibleProcess: reviewDraft.accessibleProcess === "YES",
          comment: reviewDraft.comment.trim() || undefined,
        }),
      });
      setReviewedOrgIds((s) => new Set(s).add(orgId));
      setExpandedReviewOrgId(null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to submit review");
    } finally {
      setReviewSaving(false);
    }
  }

  // Reviews are per-employer, not per-application — dedupe so an employer
  // with multiple applications only gets one review prompt. Only offered
  // once an application has moved past a bare Submitted, since "did they
  // honor accommodations" and "was the process accessible" need some real
  // interaction to have happened to mean anything.
  const reviewableOrgs =
    applications === null
      ? []
      : [
          ...new Map(
            applications
              .filter((a) => a.status !== "SUBMITTED")
              .map((a) => [a.job.organization.id, a.job.organization]),
          ).values(),
        ];

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">My applications</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Every job you&apos;ve applied to, and where it stands with the employer.
      </p>

      {error && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      )}

      {applications === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="text-muted-foreground">
          You haven&apos;t applied to any jobs yet. Check your matched jobs to get started.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {applications.map((app) => {
            const isTerminalOffPath = app.status === "REJECTED" || app.status === "WITHDRAWN";
            return (
              <li key={app.id} className="rounded-md border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-medium text-foreground">{app.job.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {app.job.organization.name} ·{" "}
                      {app.job.remote ? "Remote" : app.job.location ?? "Location not specified"}
                    </p>
                  </div>
                  {app.matchScore !== null && (
                    <span className="whitespace-nowrap text-sm font-semibold text-foreground">
                      {app.matchScore}% match
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <ApplicationStatusBadge status={app.status} />
                  {!isTerminalOffPath && <ApplicationStepper status={app.status} />}
                </div>

                {app.coverNote && <p className="mt-2 text-sm text-foreground">&ldquo;{app.coverNote}&rdquo;</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  Applied {new Date(app.createdAt).toLocaleDateString()} · Updated{" "}
                  {new Date(app.updatedAt).toLocaleDateString()}
                </p>

                {app.accommodationsApprovedAt && (
                  <p className="mt-2 text-sm text-success">
                    ✓ Employer confirmed they can meet your accommodation needs.
                  </p>
                )}
                {app.status === "REJECTED" && app.rejectionReason && (
                  <p className="mt-2 text-sm text-muted-foreground">{app.rejectionReason}</p>
                )}

                {(app.status === "INTERVIEWING" || app.status === "OFFERED") &&
                  (app.accommodationRequestText ? (
                    <p className="mt-3 rounded-md bg-muted p-3 text-sm text-foreground">
                      You told the employer: &ldquo;{app.accommodationRequestText}&rdquo;
                      {app.accommodationRequestSentAt && (
                        <span className="block text-xs text-muted-foreground">
                          Sent {new Date(app.accommodationRequestSentAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2">
                      <label htmlFor={`accommodation-request-${app.id}`} className="text-xs font-medium text-foreground">
                        Anything specific the employer should know you need? (not covered by your profile
                        checklist)
                      </label>
                      <textarea
                        id={`accommodation-request-${app.id}`}
                        value={requestDrafts[app.id] ?? ""}
                        onChange={(e) => setRequestDrafts((d) => ({ ...d, [app.id]: e.target.value }))}
                        rows={2}
                        className="rounded-md border border-border bg-background p-2 text-sm text-foreground"
                        placeholder="e.g. I use JAWS 2024 specifically, or need a height-adjustable desk"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={sendingId === app.id || !(requestDrafts[app.id] ?? "").trim()}
                        onClick={() => sendAccommodationRequest(app.id)}
                        className="self-start"
                      >
                        {sendingId === app.id ? "Sending…" : "Send requirements"}
                      </Button>
                    </div>
                  ))}

                {app.status !== "OFFERED" && !isTerminalOffPath && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    disabled={withdrawingId === app.id}
                    onClick={() => withdraw(app.id)}
                  >
                    {withdrawingId === app.id ? "Withdrawing…" : "Withdraw application"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {reviewableOrgs.length > 0 && (
        <div className="mt-10 border-t border-border pt-8">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Rate these employers</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Focused on disability inclusion, not a generic star rating — this helps other candidates know what
            to expect.
          </p>
          <ul className="flex flex-col gap-3">
            {reviewableOrgs.map((org) => (
              <li key={org.id} className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-foreground">{org.name}</span>
                  <Button size="sm" variant="secondary" onClick={() => openReview(org.id)}>
                    {expandedReviewOrgId === org.id
                      ? "Cancel"
                      : reviewedOrgIds.has(org.id)
                        ? "Edit your review"
                        : "Leave a review"}
                  </Button>
                </div>

                {expandedReviewOrgId === org.id &&
                  (reviewLoading ? (
                    <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
                  ) : (
                    <div className="mt-3 flex flex-col gap-3">
                      <fieldset className="flex flex-col gap-1.5">
                        <legend className="text-sm font-medium text-foreground">
                          Did they honor your accommodation requests?
                        </legend>
                        <select
                          value={reviewDraft.honoredAccommodations}
                          onChange={(e) =>
                            setReviewDraft((d) => ({
                              ...d,
                              honoredAccommodations: e.target.value as ReviewDraft["honoredAccommodations"],
                            }))
                          }
                          className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
                        >
                          <option value="">Select an answer</option>
                          <option value="YES">Yes</option>
                          <option value="NO">No</option>
                          <option value="NOT_REQUESTED">I didn&apos;t request any</option>
                        </select>
                      </fieldset>

                      <fieldset className="flex flex-col gap-1.5">
                        <legend className="text-sm font-medium text-foreground">
                          Was the interview/application process accessible to you?
                        </legend>
                        <select
                          value={reviewDraft.accessibleProcess}
                          onChange={(e) =>
                            setReviewDraft((d) => ({
                              ...d,
                              accessibleProcess: e.target.value as ReviewDraft["accessibleProcess"],
                            }))
                          }
                          className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
                        >
                          <option value="">Select an answer</option>
                          <option value="YES">Yes</option>
                          <option value="NO">No</option>
                        </select>
                      </fieldset>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor={`review-comment-${org.id}`} className="text-sm font-medium text-foreground">
                          Anything else? (optional)
                        </label>
                        <textarea
                          id={`review-comment-${org.id}`}
                          rows={2}
                          value={reviewDraft.comment}
                          onChange={(e) => setReviewDraft((d) => ({ ...d, comment: e.target.value }))}
                          className="rounded-md border border-border bg-background p-2 text-sm text-foreground"
                        />
                      </div>

                      <Button
                        size="sm"
                        disabled={
                          reviewSaving || !reviewDraft.honoredAccommodations || !reviewDraft.accessibleProcess
                        }
                        onClick={() => submitReview(org.id)}
                        className="self-start"
                      >
                        {reviewSaving ? "Saving…" : "Submit review"}
                      </Button>
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
