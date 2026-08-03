"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { CandidateCard, type CandidateSummary } from "@/components/candidate-card";

interface MatchRow {
  id: string;
  score: number;
  hasApplied: boolean;
  candidate: CandidateSummary;
  job: { id: string; title: string; category: string };
}

export default function EmployerHomePage() {
  const [matches, setMatches] = useState<MatchRow[] | null>(null);

  useEffect(() => {
    apiRequest<{ matches: MatchRow[] }>("/api/employer/matches").then(({ matches }) => setMatches(matches));
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-start justify-between gap-4">
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
