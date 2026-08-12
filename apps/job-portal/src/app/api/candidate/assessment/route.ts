import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { reconcileLanguageSections } from "@/lib/assessment/reconcile";

// Current status for the assessment page to know what to render: not
// started yet, resumable in-progress (with its unanswered questions), or
// completed (with the score).
export async function GET() {
  try {
    const user = await requireVerifiedCandidate();
    const candidateProfileId = user.candidateProfile!.id;
    const assessment = await prisma.candidateAssessment.findUnique({
      where: { candidateProfileId },
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

    // The candidate's disability categories may have changed since they
    // started — drop now-inapplicable unanswered language questions and
    // top the section back up before returning it.
    const profile = await prisma.candidateProfile.findUniqueOrThrow({
      where: { id: candidateProfileId },
      select: { disabilityCategories: true },
    });
    await reconcileLanguageSections(assessment.id, profile.disabilityCategories);

    const answers = await prisma.candidateAssessmentAnswer.findMany({
      where: { candidateAssessmentId: assessment.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      status: "IN_PROGRESS",
      questions: answers.map((a) => ({
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
