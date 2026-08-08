"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { CandidateCard, type CandidateSummary } from "@/components/candidate-card";
import { ApplicationStatusBadge } from "@/components/application-status";
import { ResumeTemplate, type ResumeProfile } from "@/components/resume-template";
import type { ApplicationStatus } from "@/lib/application-status";

interface CandidateDetail {
  candidate: CandidateSummary & ResumeProfile;
  email: string;
  matches: { score: number; jobId: string; jobTitle: string }[];
  applications: { status: ApplicationStatus; jobId: string; jobTitle: string }[];
}

export default function EmployerCandidateProfilePage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [data, setData] = useState<CandidateDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<CandidateDetail>(`/api/employer/candidates/${candidateId}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load this candidate"));
  }, [candidateId]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
        <Link href="/employer" className="text-sm font-medium text-primary">
          ← Back to matched candidates
        </Link>
      </main>
    );
  }

  if (data === null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <Link href="/employer" className="mb-6 inline-block text-sm font-medium text-primary">
        ← Back to matched candidates
      </Link>

      <div className="mb-8">
        <CandidateCard candidate={data.candidate} score={null} />
      </div>

      {(data.matches.length > 0 || data.applications.length > 0) && (
        <div className="mb-10">
          <h2 className="mb-2 text-lg font-semibold text-foreground">With your organization</h2>
          <ul className="flex flex-col gap-2">
            {data.applications.map((a) => (
              <li
                key={a.jobId}
                className="flex items-center justify-between gap-4 rounded-md border border-border p-3 text-sm text-foreground"
              >
                <Link href={`/employer/jobs/${a.jobId}`} className="font-medium text-primary underline">
                  {a.jobTitle}
                </Link>
                <ApplicationStatusBadge status={a.status} />
              </li>
            ))}
            {data.matches
              .filter((m) => !data.applications.some((a) => a.jobId === m.jobId))
              .map((m) => (
                <li
                  key={m.jobId}
                  className="flex items-center justify-between gap-4 rounded-md border border-border p-3 text-sm text-foreground"
                >
                  <Link href={`/employer/jobs/${m.jobId}`} className="font-medium text-primary underline">
                    {m.jobTitle}
                  </Link>
                  <span className="text-xs text-muted-foreground">{m.score}% match — hasn&apos;t applied</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="no-print mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Resume</h2>
        <Button size="sm" variant="secondary" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>
      <div className="resume-print rounded-md border border-border">
        <ResumeTemplate profile={data.candidate} email={data.email} />
      </div>
    </main>
  );
}
