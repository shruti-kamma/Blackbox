import { NextResponse } from "next/server";
import { z } from "zod";
import type { AssessmentDifficulty } from "@blackbox/db";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { scoreAssessment } from "@/lib/assessment/scoring";
import { assembleRoundQuestions } from "@/lib/assessment/assemble-round";
import { enqueueMatchingJob } from "@/lib/queue/matching-queue";
import { computeRetakeEligibility } from "@/lib/assessment/retake-eligibility";

const submitSchema = z.object({
  answers: z.array(z.object({ answerId: z.string(), selectedIndex: z.number().int().min(0).max(3) })),
});

const ADVANCE_THRESHOLD = 70;

const NEXT_LEVEL: Record<AssessmentDifficulty, AssessmentDifficulty | null> = {
  EASY: "MEDIUM",
  MEDIUM: "HARD",
  HARD: null,
};

const TIER_SCORE_FIELD: Record<AssessmentDifficulty, "easyScore" | "mediumScore" | "hardScore"> = {
  EASY: "easyScore",
  MEDIUM: "mediumScore",
  HARD: "hardScore",
};

// Submits the CURRENT round only — not the whole assessment. Scoring 70%+
// on a level (and it isn't Hard) assembles a fresh round at the next tier
// and keeps the assessment open; otherwise this round becomes the final
// one and the assessment completes. The 40-question shape itself never
// changes between levels — only which difficulty tier the questions come
// from — per the client's explicit constraint that levels sit on top of
// the existing exam, not a redesign of it.
export async function POST(request: Request) {
  try {
    const user = await requireVerifiedCandidate();
    const candidateProfileId = user.candidateProfile!.id;
    const { answers } = submitSchema.parse(await request.json());

    const assessment = await prisma.candidateAssessment.findUnique({ where: { candidateProfileId } });
    if (!assessment) {
      return NextResponse.json({ error: "No assessment in progress — start one first" }, { status: 400 });
    }
    if (assessment.status === "COMPLETED") {
      return NextResponse.json({ error: "Assessment already completed" }, { status: 409 });
    }

    const roundAnswers = await prisma.candidateAssessmentAnswer.findMany({
      where: { candidateAssessmentId: assessment.id, round: assessment.currentRound },
    });

    const validIds = new Set(roundAnswers.map((a) => a.id));
    if (answers.some((a) => !validIds.has(a.answerId))) {
      return NextResponse.json({ error: "Unknown answer id" }, { status: 400 });
    }
    if (answers.length < roundAnswers.length) {
      return NextResponse.json({ error: "Every question must be answered before submitting" }, { status: 400 });
    }

    const selectedByAnswerId = new Map(answers.map((a) => [a.answerId, a.selectedIndex]));

    await prisma.$transaction(
      roundAnswers.map((a) =>
        prisma.candidateAssessmentAnswer.update({
          where: { id: a.id },
          data: { selectedIndex: selectedByAnswerId.get(a.id) ?? null },
        }),
      ),
    );

    const scored = scoreAssessment(
      roundAnswers.map((a) => ({
        section: a.section,
        correctIndex: a.correctIndex,
        selectedIndex: selectedByAnswerId.get(a.id) ?? null,
      })),
    );

    const tierField = TIER_SCORE_FIELD[assessment.currentLevel];
    const nextLevel = NEXT_LEVEL[assessment.currentLevel];
    const advancing = scored.score >= ADVANCE_THRESHOLD && nextLevel !== null;

    if (advancing) {
      const nextRound = assessment.currentRound + 1;
      const nextQuestions = await assembleRoundQuestions(candidateProfileId, nextLevel!);

      const updated = await prisma.candidateAssessment.update({
        where: { id: assessment.id },
        data: {
          [tierField]: scored.score,
          currentLevel: nextLevel!,
          currentRound: nextRound,
          score: null,
          languageScore: null,
          aptitudeScore: null,
          skillScore: null,
          answers: {
            create: nextQuestions.map((q, i) => ({
              order: i,
              round: nextRound,
              difficulty: nextLevel!,
              section: q.section,
              prompt: q.prompt,
              passage: q.passage,
              options: q.options,
              correctIndex: q.correctIndex,
              skillName: q.skillName,
            })),
          },
        },
        include: { answers: { where: { round: nextRound }, orderBy: { order: "asc" } } },
      });

      return NextResponse.json({
        status: "IN_PROGRESS",
        advanced: true,
        completedLevel: assessment.currentLevel,
        completedLevelScore: scored.score,
        currentLevel: updated.currentLevel,
        questions: updated.answers.map((a) => ({
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

    await prisma.candidateAssessment.update({
      where: { id: assessment.id },
      data: {
        [tierField]: scored.score,
        highestLevelReached: assessment.currentLevel,
        status: "COMPLETED",
        completedAt: new Date(),
        score: scored.score,
        languageScore: scored.languageScore,
        aptitudeScore: scored.aptitudeScore,
        skillScore: scored.skillScore,
      },
    });

    // Completing the assessment always changes what the matching engine
    // reads (CandidateForMatching.assessmentScore), unlike a profile edit
    // which needs the isMatchingSubstantialChange diff — always rescore.
    await enqueueMatchingJob({ type: "candidate-profile-updated", candidateProfileId });

    const { eligible, retakeUsed } = await computeRetakeEligibility(candidateProfileId);
    const tierScores = { easyScore: assessment.easyScore, mediumScore: assessment.mediumScore, hardScore: assessment.hardScore };
    tierScores[tierField] = scored.score;
    return NextResponse.json({
      status: "COMPLETED",
      ...scored,
      ...tierScores,
      highestLevelReached: assessment.currentLevel,
      retakeEligible: eligible,
      retakeUsed,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
