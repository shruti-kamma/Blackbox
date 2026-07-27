"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { matchScoreColor } from "@/lib/match-score-color";

interface CandidateSummary {
  id: string;
  fullName: string;
  headline: string | null;
  disabilityCategories: string[];
  accessibilityNeeds: string[];
  education: { level: string; fieldOfStudy: string | null; institution: string }[];
  skills: { skill: { name: string } }[];
}

interface ApplicationRow {
  id: string;
  status: string;
  matchScore: number | null;
  coverNote: string | null;
  createdAt: string;
  candidate: CandidateSummary;
}

interface MatchRow {
  id: string;
  score: number;
  hasApplied: boolean;
  candidate: CandidateSummary;
}

function CandidateCard({ candidate, score }: { candidate: CandidateSummary; score: number | null }) {
  const color = score !== null ? matchScoreColor(score) : null;
  return (
    <div
      className={`rounded-md p-4 ${color ? "border-2" : "border border-border"}`}
      style={color ? { borderColor: color.border, backgroundColor: color.background } : undefined}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-foreground">{candidate.fullName}</p>
        {score !== null && (
          <span className="text-sm font-semibold" style={{ color: color!.text }}>
            {score}% match
          </span>
        )}
      </div>
      {candidate.headline && <p className="text-sm text-muted-foreground">{candidate.headline}</p>}
      {candidate.skills.length > 0 && (
        <p className="mt-2 text-sm text-foreground">
          Skills: {candidate.skills.map((s) => s.skill.name).join(", ")}
        </p>
      )}
      {candidate.education.length > 0 && (
        <p className="text-sm text-foreground">
          Education: {candidate.education.map((e) => `${e.level} — ${e.institution}`).join(", ")}
        </p>
      )}
      {candidate.disabilityCategories.length > 0 && (
        <p className="text-sm text-foreground">Disability: {candidate.disabilityCategories.join(", ")}</p>
      )}
      {candidate.accessibilityNeeds.length > 0 && (
        <p className="text-sm text-foreground">
          Accommodations needed: {candidate.accessibilityNeeds.join(", ")}
        </p>
      )}
    </div>
  );
}

export default function EmployerJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [tab, setTab] = useState<"applications" | "matches">("applications");
  const [applications, setApplications] = useState<ApplicationRow[] | null>(null);
  const [matches, setMatches] = useState<MatchRow[] | null>(null);

  useEffect(() => {
    apiRequest<{ applications: ApplicationRow[] }>(`/api/jobs/${jobId}/applications`).then(({ applications }) =>
      setApplications(applications),
    );
    apiRequest<{ matches: MatchRow[] }>(`/api/jobs/${jobId}/matched-candidates`).then(({ matches }) =>
      setMatches(matches),
    );
  }, [jobId]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Job dashboard</h1>

      <div role="tablist" className="mb-6 flex gap-2 border-b border-border">
        <button
          role="tab"
          aria-selected={tab === "applications"}
          onClick={() => setTab("applications")}
          className={`h-touch-target px-4 text-sm font-medium ${tab === "applications" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
        >
          Applications {applications ? `(${applications.length})` : ""}
        </button>
        <button
          role="tab"
          aria-selected={tab === "matches"}
          onClick={() => setTab("matches")}
          className={`h-touch-target px-4 text-sm font-medium ${tab === "matches" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
        >
          Matched candidates {matches ? `(${matches.length})` : ""}
        </button>
      </div>

      {tab === "applications" && (
        <div className="flex flex-col gap-3">
          {applications === null ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : applications.length === 0 ? (
            <p className="text-muted-foreground">No applications yet.</p>
          ) : (
            applications.map((app) => (
              <div key={app.id}>
                <CandidateCard candidate={app.candidate} score={app.matchScore} />
                {app.coverNote && <p className="mt-1 text-sm text-foreground">“{app.coverNote}”</p>}
                <p className="text-xs text-muted-foreground">Status: {app.status}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "matches" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Candidates matched to this role, whether or not they&apos;ve applied yet.
          </p>
          {matches === null ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : matches.length === 0 ? (
            <p className="text-muted-foreground">No matches yet.</p>
          ) : (
            matches.map((m) => (
              <div key={m.id}>
                <CandidateCard candidate={m.candidate} score={m.score} />
                {m.hasApplied && <p className="text-xs text-success">Already applied</p>}
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
