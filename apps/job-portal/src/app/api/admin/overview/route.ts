import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import type { ApplicationStatus } from "@/lib/application-status";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS_OF_TRENDS = 8;

// Monday-anchored week bucket, in UTC so it's stable regardless of server tz.
function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d;
}

function bucketByWeek(dates: Date[], weekStarts: string[]): number[] {
  const counts = new Map(weekStarts.map((w) => [w, 0]));
  for (const date of dates) {
    const key = startOfWeek(date).toISOString();
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return weekStarts.map((w) => counts.get(w) ?? 0);
}

// Platform-wide read-only snapshot for the ADMIN role — needs-attention
// alerts, growth trends, headline counts, the applications-by-status
// breakdown, and the two activity feeds the ask named directly: who's being
// hired, and what applications are coming in.
export async function GET() {
  try {
    await requireRole("ADMIN");

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * DAY_MS);
    const threeDaysAgo = new Date(now.getTime() - 3 * DAY_MS);
    const eightWeeksAgo = startOfWeek(new Date(now.getTime() - (WEEKS_OF_TRENDS - 1) * 7 * DAY_MS));

    const [
      totalCandidates,
      totalEmployers,
      totalJobs,
      openJobs,
      totalApplications,
      totalHires,
      accommodationGapsFlagged,
      guaranteedInterviewSkipsFlagged,
      applicationsByStatusRaw,
      recentHires,
      recentApplications,
      deadListingsRaw,
      zeroMatchCandidatesRaw,
      staleGapNotifications,
      guaranteedInterviewSkipNotifications,
      signupsRaw,
      applicationsRaw,
      hiresRaw,
      totalInterviewsStarted,
      completedInterviews,
      inProgressInterviews,
      completedInterviewScoreAgg,
      videoInterviews,
      jobsRequiringAiInterview,
      staleInProgressInterviewsRaw,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CANDIDATE" } }),
      prisma.organization.count(),
      prisma.job.count(),
      prisma.job.count({ where: { isOpen: true } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "OFFERED" } }),
      prisma.notification.count({ where: { type: "ACCOMMODATION_GAP" } }),
      prisma.notification.count({ where: { type: "GUARANTEED_INTERVIEW_SKIPPED" } }),
      prisma.application.groupBy({ by: ["status"], _count: true }),
      prisma.application.findMany({
        where: { status: "OFFERED" },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          updatedAt: true,
          candidate: { select: { fullName: true } },
          job: { select: { title: true, organization: { select: { name: true } } } },
        },
      }),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          status: true,
          matchScore: true,
          createdAt: true,
          candidate: { select: { fullName: true } },
          job: { select: { title: true, organization: { select: { name: true } } } },
        },
      }),
      prisma.job.findMany({
        where: { isOpen: true, createdAt: { lt: fourteenDaysAgo }, applications: { none: {} } },
        select: { id: true, title: true, createdAt: true, organization: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.candidateProfile.findMany({
        where: { createdAt: { lt: threeDaysAgo }, matches: { none: {} } },
        select: { id: true, fullName: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.notification.findMany({
        where: { type: "ACCOMMODATION_GAP", createdAt: { lt: threeDaysAgo } },
        select: { id: true, createdAt: true, payload: true },
      }),
      // No "still relevant" check needed here unlike accommodation gaps — a
      // skip is a permanent historical fact, not something that later gets
      // resolved. Capped like recentApplications rather than unbounded,
      // since nothing ever removes old entries from this list.
      prisma.notification.findMany({
        where: { type: "GUARANTEED_INTERVIEW_SKIPPED" },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, createdAt: true, payload: true },
      }),
      prisma.user.findMany({
        where: { role: { in: ["CANDIDATE", "EMPLOYER"] }, createdAt: { gte: eightWeeksAgo } },
        select: { role: true, createdAt: true },
      }),
      prisma.application.findMany({
        where: { createdAt: { gte: eightWeeksAgo } },
        select: { createdAt: true },
      }),
      prisma.application.findMany({
        where: { status: "OFFERED", updatedAt: { gte: eightWeeksAgo } },
        select: { updatedAt: true },
      }),
      prisma.interview.count(),
      prisma.interview.count({ where: { status: "COMPLETED" } }),
      prisma.interview.count({ where: { status: "IN_PROGRESS" } }),
      prisma.interview.aggregate({
        where: { status: "COMPLETED", overallScore: { not: null } },
        _avg: { overallScore: true },
      }),
      prisma.interview.count({ where: { mode: "VIDEO" } }),
      prisma.job.count({ where: { requiresAiInterview: true } }),
      // Started but never finished, and old enough that it's not just a
      // candidate mid-interview right now — the platform's own accessibility
      // signal: if this list is never empty, something about the interview
      // flow itself may be turning candidates away partway through.
      prisma.interview.findMany({
        where: { status: "IN_PROGRESS", createdAt: { lt: threeDaysAgo } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          mode: true,
          createdAt: true,
          candidateProfile: { select: { id: true, fullName: true } },
          job: { select: { title: true, organization: { select: { id: true, name: true } } } },
        },
      }),
    ]);

    const applicationsByStatus = applicationsByStatusRaw.map((row) => ({
      status: row.status as ApplicationStatus,
      count: row._count,
    }));

    // Stale accommodation-gap notifications only count as "needs attention"
    // if the application behind them is still genuinely unresolved — an
    // employer may have already approved or auto-rejected it since the
    // notification fired.
    const gapApplicationIds = staleGapNotifications
      .map((n) => (n.payload as { applicationId?: string }).applicationId)
      .filter((id): id is string => Boolean(id));
    const gapApplications =
      gapApplicationIds.length > 0
        ? await prisma.application.findMany({
            where: { id: { in: gapApplicationIds }, accommodationsApprovedAt: null, status: "SUBMITTED" },
            select: {
              id: true,
              candidate: { select: { fullName: true } },
              job: { select: { title: true, organization: { select: { id: true, name: true } } } },
            },
          })
        : [];
    const gapApplicationById = new Map(gapApplications.map((a) => [a.id, a]));
    const stalePendingAccommodations = staleGapNotifications
      .map((n) => {
        const applicationId = (n.payload as { applicationId?: string }).applicationId;
        const application = applicationId ? gapApplicationById.get(applicationId) : undefined;
        if (!application) return null;
        return {
          applicationId: application.id,
          candidateName: application.candidate.fullName,
          jobTitle: application.job.title,
          organizationId: application.job.organization.id,
          organizationName: application.job.organization.name,
          flaggedAt: n.createdAt,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    // The notification payload only has jobId + candidateName (see the
    // route that creates it), so job title/organization is resolved fresh
    // here rather than trusting a stale copy.
    const skipJobIds = [
      ...new Set(
        guaranteedInterviewSkipNotifications
          .map((n) => (n.payload as { jobId?: string }).jobId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const skipJobs =
      skipJobIds.length > 0
        ? await prisma.job.findMany({
            where: { id: { in: skipJobIds } },
            select: { id: true, title: true, organization: { select: { id: true, name: true } } },
          })
        : [];
    const skipJobById = new Map(skipJobs.map((j) => [j.id, j]));
    const guaranteedInterviewSkips = guaranteedInterviewSkipNotifications
      .map((n) => {
        const payload = n.payload as { jobId?: string; applicationId?: string; candidateName?: string };
        const job = payload.jobId ? skipJobById.get(payload.jobId) : undefined;
        if (!job || !payload.candidateName) return null;
        return {
          applicationId: payload.applicationId ?? null,
          candidateName: payload.candidateName,
          jobTitle: job.title,
          organizationId: job.organization.id,
          organizationName: job.organization.name,
          flaggedAt: n.createdAt,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const staleInProgressInterviews = staleInProgressInterviewsRaw.map((i) => ({
      id: i.id,
      mode: i.mode,
      candidateId: i.candidateProfile.id,
      candidateName: i.candidateProfile.fullName,
      jobTitle: i.job.title,
      organizationId: i.job.organization.id,
      organizationName: i.job.organization.name,
      startedAt: i.createdAt,
    }));

    const weekStarts = Array.from({ length: WEEKS_OF_TRENDS }, (_, i) =>
      new Date(eightWeeksAgo.getTime() + i * 7 * DAY_MS).toISOString(),
    );
    const candidateSignupCounts = bucketByWeek(
      signupsRaw.filter((u) => u.role === "CANDIDATE").map((u) => u.createdAt),
      weekStarts,
    );
    const employerSignupCounts = bucketByWeek(
      signupsRaw.filter((u) => u.role === "EMPLOYER").map((u) => u.createdAt),
      weekStarts,
    );
    const applicationCounts = bucketByWeek(
      applicationsRaw.map((a) => a.createdAt),
      weekStarts,
    );
    const hireCounts = bucketByWeek(
      hiresRaw.map((h) => h.updatedAt),
      weekStarts,
    );
    const trends = weekStarts.map((weekStart, i) => ({
      weekStart,
      candidateSignups: candidateSignupCounts[i],
      employerSignups: employerSignupCounts[i],
      applications: applicationCounts[i],
      hires: hireCounts[i],
    }));

    return NextResponse.json({
      needsAttention: {
        deadListings: deadListingsRaw.map((j) => ({
          id: j.id,
          title: j.title,
          organizationId: j.organization.id,
          organizationName: j.organization.name,
          postedAt: j.createdAt,
        })),
        zeroMatchCandidates: zeroMatchCandidatesRaw.map((c) => ({
          id: c.id,
          fullName: c.fullName,
          signedUpAt: c.createdAt,
        })),
        stalePendingAccommodations,
        guaranteedInterviewSkips,
        staleInProgressInterviews,
      },
      trends,
      stats: {
        totalCandidates,
        totalEmployers,
        totalJobs,
        openJobs,
        totalApplications,
        totalHires,
        accommodationGapsFlagged,
        guaranteedInterviewSkipsFlagged,
      },
      aiInterviews: {
        jobsRequiringAiInterview,
        totalStarted: totalInterviewsStarted,
        completed: completedInterviews,
        inProgress: inProgressInterviews,
        completionRate:
          totalInterviewsStarted > 0 ? Math.round((completedInterviews / totalInterviewsStarted) * 100) : null,
        averageScore:
          completedInterviewScoreAgg._avg.overallScore !== null
            ? Math.round(completedInterviewScoreAgg._avg.overallScore)
            : null,
        video: videoInterviews,
        text: totalInterviewsStarted - videoInterviews,
      },
      applicationsByStatus,
      recentHires: recentHires.map((a) => ({
        id: a.id,
        candidateName: a.candidate.fullName,
        jobTitle: a.job.title,
        organizationName: a.job.organization.name,
        offeredAt: a.updatedAt,
      })),
      recentApplications: recentApplications.map((a) => ({
        id: a.id,
        candidateName: a.candidate.fullName,
        jobTitle: a.job.title,
        organizationName: a.job.organization.name,
        status: a.status,
        matchScore: a.matchScore,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
