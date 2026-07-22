import { NextResponse } from "next/server";
import { ForbiddenError, requireUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

const jobDetailInclude = {
  organization: { select: { id: true, name: true, type: true } },
  requiredSkills: { include: { skill: true } },
} as const;

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireUser();
    const { jobId } = await params;
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: jobDetailInclude });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (user.role === "EMPLOYER") {
      if (job.organizationId !== user.employerOrgId) throw new ForbiddenError();
    } else if (user.role === "CANDIDATE") {
      const match = await prisma.match.findUnique({
        where: { jobId_candidateId: { jobId: job.id, candidateId: user.candidateProfile!.id } },
      });
      if (!match) throw new ForbiddenError("This job hasn't been matched to your profile");
    }

    return NextResponse.json({ job });
  } catch (error) {
    return handleApiError(error);
  }
}
