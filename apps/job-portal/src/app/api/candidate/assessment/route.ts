import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// Current status for the assessment page to know what to render: not
// started yet, resumable in-progress (with its unanswered questions), or
// completed (with the score).
export async function GET() {
  try {
    const user = await requireVerifiedCandidate();
    const assessment = await prisma.candidateAssessment.findUnique({
      where: { candidateProfileId: user.candidateProfile!.id },
      include: { answers: { orderBy: { order: "asc" } } },
    });

    if (!assessment) {
      return NextResponse.json({ status: "NOT_STARTED" });
    }

    if (assessment.status === "COMPLETED") {
      return NextResponse.json({
        status: "COMPLETED",
        score: assessment.score,
        languageScore: assessment.languageScore,
        aptitudeScore: assessment.aptitudeScore,
        skillScore: assessment.skillScore,
      });
    }

    return NextResponse.json({
      status: "IN_PROGRESS",
      questions: assessment.answers.map((a) => ({
        id: a.id,
        order: a.order,
        section: a.section,
        prompt: a.prompt,
        passage: a.passage,
        options: a.options,
        selectedIndex: a.selectedIndex,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
