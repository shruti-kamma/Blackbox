import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAssessedCandidate } from "@/lib/auth/current-user";
import { handleApiError } from "@/lib/api-error";
import { createApplicationFromMatch } from "@/lib/applications";

const applySchema = z.object({ coverNote: z.string().trim().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireAssessedCandidate();
    const { jobId } = await params;
    const { coverNote } = applySchema.parse(await request.json().catch(() => ({})));

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
