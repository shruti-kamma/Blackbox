"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { CandidateCard, type CandidateSummary } from "@/components/candidate-card";
import { ApplicationStatusBadge } from "@/components/application-status";
import type { ApplicationStatus } from "@/lib/application-status";

interface CandidateDetail {
  candidate: CandidateSummary;
  matches: { id: string; score: number; jobId: string; jobTitle: string; organizationName: string }[];
  applications: {
    id: string;
    status: ApplicationStatus;
    matchScore: number | null;
    createdAt: string;
    jobId: string;
    jobTitle: string;
    organizationName: string;
  }[];
}

export default function AdminCandidateDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [data, setData] = useState<CandidateDetail | null>(null);

  useEffect(() => {
    apiRequest<CandidateDetail>(`/api/admin/candidates/${candidateId}`).then(setData);
  }, [candidateId]);

  if (data === null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Candidate</h1>

      <div className="mb-10">
        <CandidateCard candidate={data.candidate} score={null} />
      </div>

      <div className="mb-10">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Matches ({data.matches.length})</h2>
        {data.matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.matches.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border p-3 text-sm text-foreground"
              >
                <span>
                  {m.jobTitle} at {m.organizationName}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{m.score}% match</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Applications ({data.applications.length})</h2>
        {data.applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.applications.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border p-3 text-sm text-foreground"
              >
                <div>
                  <span className="font-medium">{a.jobTitle}</span> at {a.organizationName}
                  {a.matchScore !== null && (
                    <span className="ml-2 text-xs text-muted-foreground">{a.matchScore}% match</span>
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <ApplicationStatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
