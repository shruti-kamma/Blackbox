import { NextResponse } from "next/server";
import { ForbiddenError, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// Lets a hiring manager see/filter candidates who match their posting even
// before an application exists — reads the same stored Match table as the
// candidate's own feed, just from the other side.
export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("EMPLOYER");
    const { jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { organizationId: true } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.organizationId !== user.employerOrgId) throw new ForbiddenError();

    const url = new URL(request.url);
    const minScore = Number(url.searchParams.get("minScore") ?? 0) || 0;

    const matches = await prisma.match.findMany({
      where: { jobId, score: { gte: minScore } },
      orderBy: { score: "desc" },
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

    const candidateIds = matches.map((m) => m.candidateId);
    const applied = new Set(
      (
        await prisma.application.findMany({
          where: { jobId, candidateId: { in: candidateIds } },
          select: { candidateId: true },
        })
      ).map((a) => a.candidateId),
    );

    return NextResponse.json({
      matches: matches.map((m) => ({ ...m, hasApplied: applied.has(m.candidateId) })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
