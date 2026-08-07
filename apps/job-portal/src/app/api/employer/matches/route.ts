import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// The employer's landing dashboard: every candidate matched to any of their
// open postings, across the whole organization — not scoped to one job like
// /api/jobs/[jobId]/matched-candidates.
export async function GET() {
  try {
    const user = await requireRole("EMPLOYER");

    const matches = await prisma.match.findMany({
      where: { job: { organizationId: user.employerOrgId! } },
      orderBy: { score: "desc" },
      include: {
        job: { select: { id: true, title: true, category: true } },
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

    const applied = new Set(
      (
        await prisma.application.findMany({
          where: { job: { organizationId: user.employerOrgId! } },
          select: { jobId: true, candidateId: true },
        })
      ).map((a) => `${a.jobId}:${a.candidateId}`),
    );

    return NextResponse.json({
      matches: matches.map((m) => ({ ...m, hasApplied: applied.has(`${m.jobId}:${m.candidateId}`) })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
