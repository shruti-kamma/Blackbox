import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("CANDIDATE");
    const { jobId } = await params;
    const candidateId = user.candidateProfile!.id;

    const [job, interview] = await Promise.all([
      prisma.job.findUnique({
        where: { id: jobId },
        select: { title: true, requiresAiInterview: true, organization: { select: { name: true } } },
      }),
      prisma.interview.findUnique({
        where: { jobId_candidateProfileId: { jobId, candidateProfileId: candidateId } },
        include: { questions: { orderBy: { order: "asc" } } },
      }),
    ]);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({ job, interview });
  } catch (error) {
    return handleApiError(error);
  }
}
