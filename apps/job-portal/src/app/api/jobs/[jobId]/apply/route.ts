import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

const applySchema = z.object({ coverNote: z.string().trim().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("CANDIDATE");
    const { jobId } = await params;
    const { coverNote } = applySchema.parse(await request.json().catch(() => ({})));

    // Candidates can only apply to jobs that already cleared the match
    // threshold — the feed only ever shows matched jobs, and this enforces
    // it server-side too.
    const match = await prisma.match.findUnique({
      where: { jobId_candidateId: { jobId, candidateId: user.candidateProfile!.id } },
    });
    if (!match) {
      return NextResponse.json({ error: "You can only apply to jobs matched to your profile" }, { status: 403 });
    }

    const application = await prisma.application.upsert({
      where: { jobId_candidateId: { jobId, candidateId: user.candidateProfile!.id } },
      create: {
        jobId,
        candidateId: user.candidateProfile!.id,
        coverNote: coverNote || null,
        matchScore: match.score,
      },
      update: {},
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
