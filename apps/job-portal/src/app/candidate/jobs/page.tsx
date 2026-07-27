"use client";

import { useEffect, useState } from "react";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { matchScoreColor } from "@/lib/match-score-color";

interface MatchRow {
  id: string;
  jobId: string;
  score: number;
  applicationStatus: string | null;
  job: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string | null;
    remote: boolean;
    organization: { name: string };
  };
}

export default function CandidateJobsPage() {
  const [matches, setMatches] = useState<MatchRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  function load() {
    apiRequest<{ matches: MatchRow[] }>("/api/candidate/matches")
      .then(({ matches }) => setMatches(matches))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load matches"));
  }

  useEffect(load, []);

  async function apply(jobId: string) {
    setApplyingId(jobId);
    setError(null);
    try {
      await apiRequest(`/api/jobs/${jobId}/apply`, { method: "POST", body: JSON.stringify({}) });
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Jobs matched to you</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        This list is personalized — only jobs that cleared the match threshold against your profile show up
        here.
      </p>

      {error && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      )}

      {matches === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : matches.length === 0 ? (
        <p className="text-muted-foreground">
          No matches yet. Make sure your profile is filled in — new jobs are matched against it as they&apos;re
          posted.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {matches.map((m) => {
            const color = matchScoreColor(m.score);
            return (
            <li
              key={m.id}
              className="rounded-md border-2 p-4"
              style={{ borderColor: color.border, backgroundColor: color.background }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-foreground">{m.job.title}</h2>
                <span className="text-sm font-semibold" style={{ color: color.text }}>
                  {m.score}% match
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {m.job.organization.name} · {m.job.category} ·{" "}
                {m.job.remote ? "Remote" : m.job.location ?? "Location not specified"}
              </p>
              <p className="mt-2 text-sm text-foreground">{m.job.description}</p>
              <div className="mt-3">
                {m.applicationStatus ? (
                  <span className="text-sm text-success">Applied — {m.applicationStatus}</span>
                ) : (
                  <Button size="sm" disabled={applyingId === m.jobId} onClick={() => apply(m.jobId)}>
                    {applyingId === m.jobId ? "Applying…" : "Apply"}
                  </Button>
                )}
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
