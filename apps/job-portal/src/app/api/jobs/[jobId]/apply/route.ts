import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { createApplicationFromMatch } from "@/lib/applications";

const applySchema = z.object({ coverNote: z.string().trim().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("CANDIDATE");
    const { jobId } = await params;
    const { coverNote } = applySchema.parse(await request.json().catch(() => ({})));

    // Jobs requiring an AI interview don't go through this route at all —
    // the candidate is routed to /candidate/jobs/[jobId]/interview instead,
    // and the Application only gets created once that's completed (see
    // interview/submit/route.ts). Guard against someone hitting this
    // endpoint directly anyway.
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { requiresAiInterview: true } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.requiresAiInterview) {
      return NextResponse.json(
        { error: "This role requires completing an AI interview first", requiresAiInterview: true },
        { status: 409 },
      );
    }

    const application = await createApplicationFromMatch({
      jobId,
      candidateId: user.candidateProfile!.id,
      coverNote,
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
