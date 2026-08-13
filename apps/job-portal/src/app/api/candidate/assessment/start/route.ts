import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { assembleRoundQuestions } from "@/lib/assessment/assemble-round";
import { reconcileLanguageSections } from "@/lib/assessment/reconcile";

export async function POST() {
  try {
    const user = await requireVerifiedCandidate();
    const candidateProfileId = user.candidateProfile!.id;

    // Resumable, not regenerated — a candidate who refreshes mid-exam (or
    // already finished) gets their existing attempt back, not a fresh
    // reroll of questions.
    const existing = await prisma.candidateAssessment.findUnique({ where: { candidateProfileId } });
    if (existing) {
      if (existing.status === "IN_PROGRESS") {
        const profile = await prisma.candidateProfile.findUniqueOrThrow({
          where: { id: candidateProfileId },
          select: { disabilityCategories: true },
        });
        await reconcileLanguageSections(existing.id, existing.currentRound, existing.currentLevel, profile.disabilityCategories);
      }
      // Scoped to the current round only — earlier rounds' rows stay in
      // the table for history, but aren't part of what's being answered
      // right now.
      const answers = await prisma.candidateAssessmentAnswer.findMany({
        where: { candidateAssessmentId: existing.id, round: existing.currentRound },
        orderBy: { order: "asc" },
      });
      return NextResponse.json({
        status: existing.status,
        currentLevel: existing.currentLevel,
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
    }

    const questions = await assembleRoundQuestions(candidateProfileId, "EASY");

    const assessment = await prisma.candidateAssessment.create({
      data: {
        candidateProfileId,
        currentLevel: "EASY",
        currentRound: 1,
        answers: {
          create: questions.map((q, i) => ({
            order: i,
            round: 1,
            difficulty: "EASY",
            section: q.section,
            prompt: q.prompt,
            passage: q.passage,
            options: q.options,
            correctIndex: q.correctIndex,
            skillName: q.skillName,
          })),
        },
      },
      include: { answers: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({
      status: assessment.status,
      currentLevel: assessment.currentLevel,
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
