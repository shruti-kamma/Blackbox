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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Matched candidates</h1>
          <p className="text-sm text-muted-foreground">
            Every candidate matched to any of your open roles, across your whole organization — whether or
            not they&apos;ve applied yet.
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
        <h2 className="text-lg font-semibold text-foreground">All matched candidates</h2>
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
        <ul className="flex flex-col gap-4">
          {matches.map((m) => (
            <li key={m.id}>
              <CandidateCard
                candidate={m.candidate}
                score={m.score}
                actions={
                  <Link
                    href={`/employer/jobs/${m.job.id}`}
                    className="whitespace-nowrap text-xs font-medium text-primary"
                  >
                    {m.job.title} →
                  </Link>
                }
              />
              {m.hasApplied && <p className="mt-1 text-xs text-success">Already applied</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
