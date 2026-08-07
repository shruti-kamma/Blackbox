import { NextResponse } from "next/server";
import { ForbiddenError, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { computeAccommodationGap, computeFirstTimeMissingAccommodations } from "@/lib/matching/accommodation-gap";

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("EMPLOYER");
    const { jobId } = await params;
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { organizationId: true, accommodationTypes: true },
    });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.organizationId !== user.employerOrgId) throw new ForbiddenError();

    // Applications carry the match score as it was at the moment of
    // applying (Application.matchScore) so this view doesn't drift if the
    // candidate later edits their profile.
    const applications = await prisma.application.findMany({
      where: { jobId },
      orderBy: [{ matchScore: "desc" }, { createdAt: "asc" }],
      include: {
        candidate: {
          include: {
            education: true,
            workExperience: true,
            skills: { include: { skill: true } },
            assistiveTechnologies: { include: { assistiveTechnology: true } },
            disabilityDetails: true,
          },
        },
      },
    });

    // Same "has this org ever provided it" history the Offered gate checks —
    // computed once per request and reused across every application here so
    // the UI can surface the approval step before anyone hits the 409.
    const pastOffers = await prisma.application.findMany({
      where: { job: { organizationId: job.organizationId }, status: "OFFERED" },
      select: { candidate: { select: { accommodationNeeds: true } } },
    });
    const everProvided = pastOffers.flatMap((a) => a.candidate.accommodationNeeds);

    return NextResponse.json({
      applications: applications.map((app) => {
        const missing = computeAccommodationGap(app.candidate.accommodationNeeds, job.accommodationTypes);
        const firstTimeMissing = computeFirstTimeMissingAccommodations(missing, everProvided);
        return {
          ...app,
          needsAccommodationApproval: firstTimeMissing.length > 0 && !app.accommodationsApprovedAt,
          missingAccommodations: firstTimeMissing,
        };
      }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
