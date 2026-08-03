"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { matchScoreColor } from "@/lib/match-score-color";
import type { ApplicationStatus } from "@/lib/application-status";

interface MatchRow {
  id: string;
  jobId: string;
  score: number;
  applicationStatus: ApplicationStatus | null;
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

  // The landing feed only ever shows roles still open for a first move —
  // once a candidate applies, that job's story continues on
  // /candidate/applications, not here.
  const unappliedMatches = matches?.filter((m) => m.applicationStatus === null) ?? null;
  const appliedCount = (matches?.length ?? 0) - (unappliedMatches?.length ?? 0);

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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Jobs matched to you</h1>
          <p className="text-sm text-muted-foreground">
            Personalized to your profile — every role here already cleared the match threshold and is still
            waiting on you to apply.
          </p>
        </div>
        <Link href="/candidate/applications" className="whitespace-nowrap text-sm font-medium text-primary">
          My applications →
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      )}

      {appliedCount > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          You&apos;ve applied to {appliedCount} other matched {appliedCount === 1 ? "job" : "jobs"} — see how
          they&apos;re going on{" "}
          <Link href="/candidate/applications" className="font-medium text-primary">
            My applications
          </Link>
          .
        </p>
      )}

      {unappliedMatches === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : unappliedMatches.length === 0 ? (
        <p className="text-muted-foreground">
          {appliedCount > 0
            ? "You're all caught up — you've applied to every job matched to you so far. New postings are matched against your profile as they go live."
            : "No matches yet. Make sure your profile is filled in — new jobs are matched against it as they're posted."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {unappliedMatches.map((m) => {
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
                  <Button size="sm" disabled={applyingId === m.jobId} onClick={() => apply(m.jobId)}>
                    {applyingId === m.jobId ? "Applying…" : "Apply"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
