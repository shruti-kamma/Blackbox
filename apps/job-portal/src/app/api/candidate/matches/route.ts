import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// The candidate's personalized job feed — reads only from the stored Match
// table, never the raw Job list. A job only appears here once the async
// matching worker has scored it above the threshold.
export async function GET() {
  try {
    const user = await requireRole("CANDIDATE");
    const matches = await prisma.match.findMany({
      where: { candidateId: user.candidateProfile!.id },
      orderBy: { score: "desc" },
      include: { job: { include: { organization: { select: { id: true, name: true } } } } },
    });

    const applications = await prisma.application.findMany({
      where: { candidateId: user.candidateProfile!.id },
      select: { jobId: true, status: true },
    });
    const applicationByJobId = new Map(applications.map((a) => [a.jobId, a.status]));

    // One extra query for every matched job's employer-review aggregate,
    // computed here rather than per-job on the client — avoids an N+1 of
    // review-fetches for what's otherwise a single feed render.
    const organizationIds = [...new Set(matches.map((m) => m.job.organization.id))];
    const reviews =
      organizationIds.length > 0
        ? await prisma.employerReview.findMany({
            where: { organizationId: { in: organizationIds } },
            select: { organizationId: true, honoredAccommodations: true, accessibleProcess: true },
          })
        : [];
    const reviewAggregateByOrgId = new Map<
      string,
      { reviewCount: number; accommodationsHonoredRate: number | null; accessibleProcessRate: number }
    >();
    for (const orgId of organizationIds) {
      const orgReviews = reviews.filter((r) => r.organizationId === orgId);
      if (orgReviews.length === 0) continue;
      const accommodationAnswers = orgReviews.filter((r) => r.honoredAccommodations !== null);
      reviewAggregateByOrgId.set(orgId, {
        reviewCount: orgReviews.length,
        accommodationsHonoredRate:
          accommodationAnswers.length > 0
            ? Math.round(
                (accommodationAnswers.filter((r) => r.honoredAccommodations === true).length /
                  accommodationAnswers.length) *
                  100,
              )
            : null,
        accessibleProcessRate: Math.round(
          (orgReviews.filter((r) => r.accessibleProcess).length / orgReviews.length) * 100,
        ),
      });
    }

    return NextResponse.json({
      matches: matches.map((m) => ({
        ...m,
        applicationStatus: applicationByJobId.get(m.jobId) ?? null,
        reviewAggregate: reviewAggregateByOrgId.get(m.job.organization.id) ?? null,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
