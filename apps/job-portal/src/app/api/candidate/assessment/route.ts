import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { reconcileLanguageSections } from "@/lib/assessment/reconcile";
import { computeRetakeEligibility } from "@/lib/assessment/retake-eligibility";

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
      const { eligible, retakeUsed } = await computeRetakeEligibility(candidateProfileId);
      return NextResponse.json({
        status: "COMPLETED",
        score: assessment.score,
        languageScore: assessment.languageScore,
        aptitudeScore: assessment.aptitudeScore,
        skillScore: assessment.skillScore,
        highestLevelReached: assessment.highestLevelReached,
        easyScore: assessment.easyScore,
        mediumScore: assessment.mediumScore,
        hardScore: assessment.hardScore,
        retakeEligible: eligible,
        retakeUsed,
      });
    }

    // The candidate's disability categories may have changed since they
    // started — drop now-inapplicable unanswered language questions and
    // top the section back up before returning it. Scoped to the current
    // round/difficulty only.
    const profile = await prisma.candidateProfile.findUniqueOrThrow({
      where: { id: candidateProfileId },
      select: { disabilityCategories: true },
    });
    await reconcileLanguageSections(assessment.id, assessment.currentRound, assessment.currentLevel, profile.disabilityCategories);

    const answers = await prisma.candidateAssessmentAnswer.findMany({
      where: { candidateAssessmentId: assessment.id, round: assessment.currentRound },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      status: "IN_PROGRESS",
      currentLevel: assessment.currentLevel,
      easyScore: assessment.easyScore,
      mediumScore: assessment.mediumScore,
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
