import { NextResponse } from "next/server";
import { ForbiddenError, requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("EMPLOYER");
    const { jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { organizationId: true } });
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
          },
        },
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    return handleApiError(error);
  }
}
