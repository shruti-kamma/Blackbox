"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { CandidateCard, type CandidateSummary } from "@/components/candidate-card";
import { PipelineStats } from "@/components/pipeline-stats";
import type { ApplicationStatus } from "@/lib/application-status";

interface MatchRow {
  id: string;
  score: number;
  hasApplied: boolean;
  candidate: CandidateSummary;
  job: { id: string; title: string; category: string };
}

export default function EmployerHomePage() {
  const [matches, setMatches] = useState<MatchRow[] | null>(null);
  const [applications, setApplications] = useState<{ status: ApplicationStatus; jobId: string; job: { title: string } }[] | null>(
    null,
  );

  useEffect(() => {
    apiRequest<{ matches: MatchRow[] }>("/api/employer/matches").then(({ matches }) => setMatches(matches));
    apiRequest<{ applications: { status: ApplicationStatus; jobId: string; job: { title: string } }[] }>(
      "/api/employer/applications",
    ).then(({ applications }) => setApplications(applications));
  }, []);

  // Which of the org's roles the matching engine has found the most fits
  // for — a quick read on where hiring interest is concentrated.
  const topRoles = matches
    ? [...matches.reduce((acc, m) => acc.set(m.job.title, (acc.get(m.job.title) ?? 0) + 1), new Map<string, number>())]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  // Grouped by job rather than one flat list across the whole org — each
  // job's full match list already lives on its own page (the Matches tab),
  // so this only needs to preview the top few per job, sorted by whichever
  // job has the most matches first.
  const MATCHES_PREVIEW_PER_JOB = 3;
  const jobGroups = matches
    ? [...matches.reduce((acc, m) => {
        const existing = acc.get(m.job.id);
        if (existing) existing.push(m);
        else acc.set(m.job.id, [m]);
        return acc;
      }, new Map<string, MatchRow[]>())].sort((a, b) => b[1].length - a[1].length)
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Matched candidates</h1>
          <p className="text-sm text-muted-foreground">
            Grouped by job posting — click a candidate&apos;s name to see their full profile and resume.
          </p>
        </div>
        <Link href="/employer/jobs" className="whitespace-nowrap text-sm font-medium text-primary">
          Your postings →
        </Link>
      </div>

      {(applications && applications.length > 0) || topRoles.length > 0 ? (
        <div className="mb-8 flex flex-col gap-6">
          {applications && applications.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Application activity</p>
              <PipelineStats applications={applications} />
            </div>
          )}

          {topRoles.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Roles with the most matches</p>
              <ul className="flex flex-wrap gap-2">
                {topRoles.map(([title, count]) => (
                  <li
                    key={title}
                    className="rounded-full border border-border px-3 py-1 text-sm text-foreground"
                  >
                    {title} · {count} {count === 1 ? "match" : "matches"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      <div className="mb-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">Matched candidates, by job</h2>
      </div>

      {matches === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : matches.length === 0 ? (
        <p className="text-muted-foreground">
          No matches yet.{" "}
          <Link href="/employer/jobs/new" className="font-medium text-primary">
            Post a role
          </Link>{" "}
          to start matching against candidate profiles.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {jobGroups.map(([jobId, jobMatches]) => (
            <div key={jobId}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="font-medium text-foreground">{jobMatches[0].job.title}</h3>
                <Link href={`/employer/jobs/${jobId}`} className="whitespace-nowrap text-sm font-medium text-primary">
                  {jobMatches.length} {jobMatches.length === 1 ? "match" : "matches"} →
                </Link>
              </div>
              <ul className="flex flex-col gap-3">
                {jobMatches.slice(0, MATCHES_PREVIEW_PER_JOB).map((m) => (
                  <li key={m.id}>
                    <CandidateCard
                      candidate={m.candidate}
                      score={m.score}
                      profileHref={`/employer/candidates/${m.candidate.id}`}
                    />
                    {m.hasApplied && <p className="mt-1 text-xs text-success">Already applied</p>}
                  </li>
                ))}
              </ul>
              {jobMatches.length > MATCHES_PREVIEW_PER_JOB && (
                <Link
                  href={`/employer/jobs/${jobId}`}
                  className="mt-2 inline-block text-sm font-medium text-primary"
                >
                  + {jobMatches.length - MATCHES_PREVIEW_PER_JOB} more for this role →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
