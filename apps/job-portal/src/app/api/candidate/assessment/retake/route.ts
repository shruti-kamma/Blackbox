import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { computeRetakeEligibility } from "@/lib/assessment/retake-eligibility";
import { buildLanguageRegeneration } from "@/lib/assessment/retake";

// One-time-only: regenerates just the language section of an already-
// COMPLETED assessment when a disability-category correction actually
// changes which Listening/Speaking/Reading/Writing sections apply.
// Aptitude and skill answers are left exactly as they were — this is not a
// full reroll, only the part that was actually wrong for the candidate.
export async function POST() {
  try {
    const user = await requireVerifiedCandidate();
    const candidateProfileId = user.candidateProfile!.id;

    const assessment = await prisma.candidateAssessment.findUnique({ where: { candidateProfileId } });
    if (!assessment || assessment.status !== "COMPLETED") {
      return NextResponse.json({ error: "No completed assessment to retake" }, { status: 400 });
    }

    const eligibility = await computeRetakeEligibility(candidateProfileId);
    if (!eligibility.eligible) {
      const error = eligibility.retakeUsed
        ? "You've already used your one-time retake"
        : "Your accessibility needs haven't changed enough to require a retake";
      return NextResponse.json({ error }, { status: 400 });
    }

    const profile = await prisma.candidateProfile.findUniqueOrThrow({
      where: { id: candidateProfileId },
      select: { disabilityCategories: true },
    });

    const languageRegeneration = await buildLanguageRegeneration(
      assessment.id,
      assessment.currentRound,
      assessment.currentLevel,
      profile.disabilityCategories,
    );

    await prisma.$transaction([
      ...languageRegeneration,
      prisma.candidateAssessment.update({
        where: { id: assessment.id },
        data: {
          status: "IN_PROGRESS",
          score: null,
          languageScore: null,
          completedAt: null,
          previousScore: assessment.score,
          previousCompletedAt: assessment.completedAt,
          retakeUsed: true,
        },
      }),
    ]);

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
