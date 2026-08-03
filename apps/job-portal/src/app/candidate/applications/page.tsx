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
