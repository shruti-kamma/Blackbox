"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { matchScoreColor } from "@/lib/match-score-color";
import { CandidateProfileCard } from "@/components/candidate-profile-card";
import { PipelineStats } from "@/components/pipeline-stats";
import { ACCOMMODATION_TYPE_OPTIONS } from "@/lib/matching-options";
import type { ApplicationStatus } from "@/lib/application-status";

const ACCOMMODATION_LABELS = Object.fromEntries(
  ACCOMMODATION_TYPE_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

interface AtsScoreResult {
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  educationMet: boolean;
  experienceMet: boolean;
}

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
    accommodationTypes: string[];
    organization: { name: string };
  };
}

interface Profile {
  fullName: string;
  headline: string | null;
  disabilityCategories: string[];
  accommodationNeeds: string[];
  experienceLevel: string | null;
  preferredLocations: string[];
  openToRemote: boolean;
  updatedAt: string;
  education: { level: string; fieldOfStudy: string | null; institution: string }[];
  workExperience: unknown[];
  skills: unknown[];
}

export default function CandidateJobsPage() {
  const [matches, setMatches] = useState<MatchRow[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<{ status: ApplicationStatus }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [atsScores, setAtsScores] = useState<Record<string, AtsScoreResult | "loading">>({});

  function load() {
    apiRequest<{ matches: MatchRow[] }>("/api/candidate/matches")
      .then(({ matches }) => setMatches(matches))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load matches"));
  }

  useEffect(() => {
    load();
    apiRequest<{ profile: Profile }>("/api/candidate/profile").then(({ profile }) => setProfile(profile));
    apiRequest<{ applications: { status: ApplicationStatus }[] }>("/api/candidate/applications").then(
      ({ applications }) => setApplications(applications),
    );
  }, []);

  // The landing feed only ever shows roles still open for a first move —
  // once a candidate applies, that job's story continues on
  // /candidate/applications, not here.
  const unappliedMatches = matches?.filter((m) => m.applicationStatus === null) ?? null;
  const appliedCount = (matches?.length ?? 0) - (unappliedMatches?.length ?? 0);

  const topEmployers = matches
    ? [...matches.reduce((acc, m) => acc.set(m.job.organization.name, (acc.get(m.job.organization.name) ?? 0) + 1), new Map<string, number>())]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  // "Employer actions" = applications that moved past the initial submit —
  // i.e. an employer actually did something, not just an unopened inbox item.
  const employerActionCount = applications?.filter((a) => a.status !== "SUBMITTED").length ?? 0;

  async function checkAtsScore(jobId: string) {
    if (atsScores[jobId]) {
      setAtsScores((s) => {
        const next = { ...s };
        delete next[jobId];
        return next;
      });
      return;
    }
    setAtsScores((s) => ({ ...s, [jobId]: "loading" }));
    try {
      const result = await apiRequest<AtsScoreResult>(`/api/candidate/jobs/${jobId}/ats-score`);
      setAtsScores((s) => ({ ...s, [jobId]: result }));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to check ATS score");
      setAtsScores((s) => {
        const next = { ...s };
        delete next[jobId];
        return next;
      });
    }
  }

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
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <aside>
          {profile && (
            <CandidateProfileCard
              profile={profile}
              matchCount={matches?.length ?? 0}
              employerActionCount={employerActionCount}
            />
          )}
        </aside>

        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Jobs matched to you</h1>
            <p className="text-sm text-muted-foreground">
              Personalized to your profile — every role below already cleared the match threshold.
            </p>
          </div>

          {error && (
            <p role="alert" className="mb-6 text-sm text-danger">
              {error}
            </p>
          )}

          {(applications && applications.length > 0) || topEmployers.length > 0 ? (
            <div className="mb-8 flex flex-col gap-6">
              {applications && applications.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Your applications</p>
                    <Link href="/candidate/applications" className="text-sm font-medium text-primary">
                      View all →
                    </Link>
                  </div>
                  <PipelineStats applications={applications} />
                </div>
              )}

              {topEmployers.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Employers matched to your profile</p>
                  <ul className="flex flex-wrap gap-2">
                    {topEmployers.map(([name, count]) => (
                      <li
                        key={name}
                        className="rounded-full border border-border px-3 py-1 text-sm text-foreground"
                      >
                        {name} · {count} {count === 1 ? "role" : "roles"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          <div className="mb-4 flex items-center justify-between gap-4 border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground">Jobs waiting on you</h2>
            <Link href="/candidate/resume" className="whitespace-nowrap text-sm font-medium text-primary">
              View resume →
            </Link>
          </div>

          {appliedCount > 0 && (
            <p className="mb-4 text-sm text-muted-foreground">
              You&apos;ve applied to {appliedCount} other matched {appliedCount === 1 ? "job" : "jobs"} — see
              how they&apos;re going on{" "}
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
                const needs = profile?.accommodationNeeds ?? [];
                const missing = needs.filter((need) => !m.job.accommodationTypes.includes(need));
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
                    {needs.length > 0 && missing.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {m.job.accommodationTypes.length === 0
                          ? "Employer hasn't specified accommodation details yet."
                          : `This role's listed accommodations don't cover: ${missing
                              .map((v) => ACCOMMODATION_LABELS[v] ?? v)
                              .join(", ")} — you may want to confirm before applying.`}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" disabled={applyingId === m.jobId} onClick={() => apply(m.jobId)}>
                        {applyingId === m.jobId ? "Applying…" : "Apply"}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => checkAtsScore(m.jobId)}>
                        {atsScores[m.jobId] ? "Hide ATS score" : "Check ATS score"}
                      </Button>
                    </div>
                    {atsScores[m.jobId] === "loading" && (
                      <p className="mt-2 text-xs text-muted-foreground">Checking…</p>
                    )}
                    {atsScores[m.jobId] && atsScores[m.jobId] !== "loading" && (
                      <div className="mt-2 rounded-md border border-border bg-background p-3 text-sm">
                        <p className="font-medium text-foreground">
                          {(atsScores[m.jobId] as AtsScoreResult).overallScore}% ATS keyword match
                        </p>
                        {(atsScores[m.jobId] as AtsScoreResult).matchedSkills.length > 0 && (
                          <p className="mt-1 text-xs text-success">
                            Found: {(atsScores[m.jobId] as AtsScoreResult).matchedSkills.join(", ")}
                          </p>
                        )}
                        {(atsScores[m.jobId] as AtsScoreResult).missingSkills.length > 0 && (
                          <p className="mt-1 text-xs text-danger">
                            Missing: {(atsScores[m.jobId] as AtsScoreResult).missingSkills.join(", ")}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Education requirement:{" "}
                          {(atsScores[m.jobId] as AtsScoreResult).educationMet ? "✓ Met" : "✗ Not met"} · Experience
                          level: {(atsScores[m.jobId] as AtsScoreResult).experienceMet ? "✓ Met" : "✗ Not met"}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
