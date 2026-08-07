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
    organization: { name: string };
  };
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [requestDrafts, setRequestDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

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
    </main>
  );
}
