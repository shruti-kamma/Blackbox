"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { CandidateCard, type CandidateSummary } from "@/components/candidate-card";
import { ApplicationStatusBadge } from "@/components/application-status";
import type { ApplicationStatus } from "@/lib/application-status";

const LEVEL_LABELS: Record<string, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

interface CandidateDetail {
  candidate: Omit<CandidateSummary, "candidateAssessment"> & {
    dateOfBirth: string | null;
    disabilityVerified: boolean;
    candidateAssessment: {
      status: string;
      score: number | null;
      highestLevelReached: string | null;
      easyScore: number | null;
      mediumScore: number | null;
      hardScore: number | null;
      retakeUsed: boolean;
      previousScore: number | null;
      previousCompletedAt: string | null;
    } | null;
  };
  profileCompletionPercent: number;
  nextBestAction: string | null;
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
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">Candidate</h1>

      <div className="mb-10">
        <CandidateCard candidate={data.candidate} score={null} />
        {data.candidate.dateOfBirth && (
          <p className="mt-2 text-xs text-muted-foreground">
            Date of birth: {new Date(data.candidate.dateOfBirth).toLocaleDateString()}{" "}
            <span className="italic">— admin-only, not shown to employers</span>
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Profile {data.profileCompletionPercent}% complete
          {data.nextBestAction && (
            <>
              {" — next: "}
              <span className="font-medium text-foreground">{data.nextBestAction}</span>
            </>
          )}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Disability certificate:{" "}
          {data.candidate.disabilityVerified ? (
            <span className="font-medium text-success">Verified ✓</span>
          ) : (
            "Not verified"
          )}
        </p>
        {data.candidate.candidateAssessment?.highestLevelReached && (
          <p className="mt-2 text-xs text-muted-foreground">
            Assessment level reached:{" "}
            <span className="font-medium text-foreground">
              {LEVEL_LABELS[data.candidate.candidateAssessment.highestLevelReached] ??
                data.candidate.candidateAssessment.highestLevelReached}
            </span>
            {[
              ["Easy", data.candidate.candidateAssessment.easyScore],
              ["Medium", data.candidate.candidateAssessment.mediumScore],
              ["Hard", data.candidate.candidateAssessment.hardScore],
            ]
              .filter(([, score]) => score !== null)
              .map(([label, score]) => (
                <span key={label as string} className="ml-2">
                  {label}: {score}%
                </span>
              ))}
          </p>
        )}
        {data.candidate.candidateAssessment?.retakeUsed && (
          <p className="mt-2 text-xs text-muted-foreground">
            Assessment retaken —{" "}
            {data.candidate.candidateAssessment.previousScore !== null
              ? `previously ${data.candidate.candidateAssessment.previousScore}%`
              : "no prior score on record"}
            {data.candidate.candidateAssessment.score !== null &&
              `, now ${data.candidate.candidateAssessment.score}%`}
            {data.candidate.candidateAssessment.previousCompletedAt && (
              <> (first completed {new Date(data.candidate.candidateAssessment.previousCompletedAt).toLocaleDateString()})</>
            )}
          </p>
        )}
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
