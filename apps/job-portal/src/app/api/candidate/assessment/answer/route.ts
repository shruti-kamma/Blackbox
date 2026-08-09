import { NextResponse } from "next/server";
import { z } from "zod";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

const answerSchema = z.object({
  answerId: z.string(),
  // null clears a previously saved response (see "Clear Response" on the
  // assessment page).
  selectedIndex: z.number().int().min(0).max(3).nullable(),
});

// Autosaves a single answer as the candidate picks it, rather than only on
// final submit — a 40-question, self-paced exam can take a while, and
// losing every answer to a dropped connection or closed tab partway through
// would itself be an accessibility failure. GET already returns
// selectedIndex per question, so a resumed session picks up where it left
// off automatically.
export async function POST(request: Request) {
  try {
    const user = await requireVerifiedCandidate();
    const { answerId, selectedIndex } = answerSchema.parse(await request.json());

    const answer = await prisma.candidateAssessmentAnswer.findUnique({
      where: { id: answerId },
      select: { candidateAssessment: { select: { candidateProfileId: true, status: true } } },
    });
    if (
      !answer ||
      answer.candidateAssessment.candidateProfileId !== user.candidateProfile!.id ||
      answer.candidateAssessment.status !== "IN_PROGRESS"
    ) {
      return NextResponse.json({ error: "No matching in-progress answer" }, { status: 404 });
    }

    await prisma.candidateAssessmentAnswer.update({ where: { id: answerId }, data: { selectedIndex } });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return handleApiError(error);
  }
}
