"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { ApplicationStatusBadge } from "@/components/application-status";
import { APPLICATION_STATUS_META, applicationStatusColor, type ApplicationStatus } from "@/lib/application-status";

interface Overview {
  needsAttention: {
    deadListings: { id: string; title: string; organizationId: string; organizationName: string; postedAt: string }[];
    zeroMatchCandidates: { id: string; fullName: string; signedUpAt: string }[];
    stalePendingAccommodations: {
      applicationId: string;
      candidateName: string;
      jobTitle: string;
      organizationId: string;
      organizationName: string;
      flaggedAt: string;
    }[];
    guaranteedInterviewSkips: {
      applicationId: string | null;
      candidateName: string;
      jobTitle: string;
      organizationId: string;
      organizationName: string;
      flaggedAt: string;
    }[];
    staleInProgressAssessments: {
      id: string;
      candidateId: string;
      candidateName: string;
      startedAt: string;
    }[];
  };
  trends: { weekStart: string; candidateSignups: number; employerSignups: number; applications: number; hires: number }[];
  stats: {
    totalCandidates: number;
    totalEmployers: number;
    totalJobs: number;
    openJobs: number;
    totalApplications: number;
    totalHires: number;
    accommodationGapsFlagged: number;
    guaranteedInterviewSkipsFlagged: number;
    pendingKycCandidates: number;
  };
  assessments: {
    totalStarted: number;
    completed: number;
    pending: number;
    completionRate: number | null;
    averageScore: number | null;
  };
  applicationsByStatus: { status: ApplicationStatus; count: number }[];
  recentHires: { id: string; candidateName: string; jobTitle: string; organizationName: string; offeredAt: string }[];
  recentApplications: {
    id: string;
    candidateName: string;
    jobTitle: string;
    organizationName: string;
    status: ApplicationStatus;
    matchScore: number | null;
    createdAt: string;
  }[];
}

const STAT_LABELS: Record<keyof Overview["stats"], string> = {
  totalCandidates: "Candidates",
  totalEmployers: "Employers",
  totalJobs: "Total jobs",
  openJobs: "Open jobs",
  totalApplications: "Applications",
  totalHires: "Hires",
  accommodationGapsFlagged: "Accommodation gaps flagged",
  guaranteedInterviewSkipsFlagged: "Guaranteed interviews skipped",
  pendingKycCandidates: "Candidates pending KYC",
};

const TREND_SERIES: { key: keyof Overview["trends"][number]; label: string; color: string }[] = [
  { key: "candidateSignups", label: "Candidate signups", color: "var(--color-primary)" },
  { key: "employerSignups", label: "Employer signups", color: "var(--color-success)" },
  { key: "applications", label: "Applications", color: "var(--color-foreground)" },
  { key: "hires", label: "Hires", color: "var(--color-success)" },
];

function TrendRow({ series, weeks }: { series: (typeof TREND_SERIES)[number]; weeks: Overview["trends"] }) {
  const values = weeks.map((w) => w[series.key] as number);
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-center gap-3">
      <p className="w-36 shrink-0 text-xs text-muted-foreground">{series.label}</p>
      <div className="flex flex-1 items-end gap-1.5" style={{ height: 40 }}>
        {values.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-0.5" title={`${v}`}>
            <div
              className="w-full rounded-sm"
              style={{ height: `${Math.max(2, (v / max) * 32)}px`, backgroundColor: series.color, opacity: 0.85 }}
            />
          </div>
        ))}
      </div>
      <p className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {values[values.length - 1]}
      </p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    apiRequest<Overview>("/api/admin/overview").then(setData);
  }, []);

  const attentionCount = data
    ? data.needsAttention.deadListings.length +
      data.needsAttention.zeroMatchCandidates.length +
      data.needsAttention.stalePendingAccommodations.length +
      data.needsAttention.guaranteedInterviewSkips.length +
      data.needsAttention.staleInProgressAssessments.length
    : 0;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">Admin overview</h1>
      <p className="mb-8 text-sm text-muted-foreground">Platform-wide activity across every employer and candidate.</p>

      {data === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="flex flex-col gap-10">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Needs attention {attentionCount > 0 && `(${attentionCount})`}
            </h2>
            {attentionCount === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing needs your attention right now.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.needsAttention.deadListings.map((j) => (
                  <div
                    key={j.id}
                    className="rounded-md border border-danger bg-danger/10 p-3 text-sm text-foreground"
                  >
                    <Link href={`/admin/employers/${j.organizationId}`} className="font-medium underline">
                      {j.organizationName}
                    </Link>
                    {"'s "}
                    <span className="font-medium">{j.title}</span> has been open since{" "}
                    {new Date(j.postedAt).toLocaleDateString()} with zero applications.
                  </div>
                ))}
                {data.needsAttention.zeroMatchCandidates.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-danger bg-danger/10 p-3 text-sm text-foreground"
                  >
                    <Link href={`/admin/candidates/${c.id}`} className="font-medium underline">
                      {c.fullName}
                    </Link>{" "}
                    signed up {new Date(c.signedUpAt).toLocaleDateString()} and has zero matches — a coverage
                    gap worth investigating.
                  </div>
                ))}
                {data.needsAttention.stalePendingAccommodations.map((a) => (
                  <div
                    key={a.applicationId}
                    className="rounded-md border border-danger bg-danger/10 p-3 text-sm text-foreground"
                  >
                    <Link href={`/admin/employers/${a.organizationId}`} className="font-medium underline">
                      {a.organizationName}
                    </Link>{" "}
                    hasn&apos;t responded to {a.candidateName}&apos;s accommodation request for {a.jobTitle} since{" "}
                    {new Date(a.flaggedAt).toLocaleDateString()}.
                  </div>
                ))}
                {data.needsAttention.guaranteedInterviewSkips.map((s, i) => (
                  <div
                    key={s.applicationId ?? i}
                    className="rounded-md border border-danger bg-danger/10 p-3 text-sm text-foreground"
                  >
                    <Link href={`/admin/employers/${s.organizationId}`} className="font-medium underline">
                      {s.organizationName}
                    </Link>{" "}
                    rejected {s.candidateName} for {s.jobTitle} without an interview, despite committing to one
                    — {new Date(s.flaggedAt).toLocaleDateString()}.
                  </div>
                ))}
                {data.needsAttention.staleInProgressAssessments.map((a) => (
                  <div key={a.id} className="rounded-md border border-danger bg-danger/10 p-3 text-sm text-foreground">
                    <Link href={`/admin/candidates/${a.candidateId}`} className="font-medium underline">
                      {a.candidateName}
                    </Link>{" "}
                    started their assessment on {new Date(a.startedAt).toLocaleDateString()} and never finished it
                    — worth checking whether the assessment itself is the barrier.
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Growth, last 8 weeks</h2>
            <div className="flex flex-col gap-3 rounded-md border border-border p-4">
              {TREND_SERIES.map((series) => (
                <TrendRow key={series.key} series={series} weeks={data.trends} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(STAT_LABELS) as (keyof Overview["stats"])[]).map((key) => (
              <div key={key} className="rounded-md border border-border p-3">
                <p className="text-2xl font-semibold tabular-nums text-foreground">{data.stats[key]}</p>
                <p className="text-xs text-muted-foreground">{STAT_LABELS[key]}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Applications by status</h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {data.applicationsByStatus.map(({ status, count }) => {
                const color = applicationStatusColor(status);
                return (
                  <div key={status} className="rounded-md border p-3" style={{ borderColor: color.border }}>
                    <p className="text-2xl font-semibold tabular-nums" style={{ color: color.text }}>
                      {count}
                    </p>
                    <p className="text-xs text-muted-foreground">{APPLICATION_STATUS_META[status].label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Assessments</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              The one-time, 40-question MCQ exam every candidate must complete before applying to jobs.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-md border border-border p-3">
                <p className="text-2xl font-semibold tabular-nums text-foreground">{data.assessments.totalStarted}</p>
                <p className="text-xs text-muted-foreground">Started</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {data.assessments.completionRate !== null ? `${data.assessments.completionRate}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Completed ({data.assessments.completed}/{data.assessments.totalStarted})
                </p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {data.assessments.averageScore !== null ? `${data.assessments.averageScore}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Average score</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-2xl font-semibold tabular-nums text-foreground">{data.assessments.pending}</p>
                <p className="text-xs text-muted-foreground">Candidates pending</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Recent hires</h2>
            {data.recentHires.length === 0 ? (
              <p className="text-sm text-muted-foreground">No offers extended yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.recentHires.map((h) => (
                  <li key={h.id} className="rounded-md border border-border p-3 text-sm text-foreground">
                    <span className="font-medium">{h.candidateName}</span> — {h.jobTitle} at {h.organizationName}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(h.offeredAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Recent applications</h2>
            {data.recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.recentApplications.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-4 rounded-md border border-border p-3 text-sm text-foreground"
                  >
                    <div>
                      <span className="font-medium">{a.candidateName}</span> — {a.jobTitle} at {a.organizationName}
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
        </div>
      )}
    </main>
  );
}
