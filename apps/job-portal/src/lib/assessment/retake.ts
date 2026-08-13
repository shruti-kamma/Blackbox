import type { AssessmentDifficulty, AssessmentSection } from "@blackbox/db";
import { prisma } from "@/lib/db";
import { pickLanguageQuestions, type BankQuestion } from "./question-bank";

const LANGUAGE_SECTIONS: AssessmentSection[] = ["LISTENING", "SPEAKING", "READING", "WRITING"];

// Builds (but does not run) the delete+recreate operations for a retake's
// language section. Unlike reconcileLanguageSections — which preserves
// already-answered rows for a routine mid-exam profile edit — this wipes
// every language row unconditionally, answered or not: a retake's prior
// language answers are invalid precisely because they were answered under
// the wrong section scope, so nothing there is worth keeping. Aptitude and
// skill rows are untouched by this function entirely.
//
// Scoped to a specific round/difficulty — since the difficulty-levels
// feature, a COMPLETED assessment's `currentRound`/`currentLevel` still
// correctly point at whichever round/level the candidate finished on (both
// only ever change on advancing, never after completion), so the retake
// regenerates language questions at the same difficulty they were actually
// tested at, not always EASY.
//
// Returns the two write operations rather than running them in their own
// $transaction, so the caller (the retake route) can flatten them into one
// transaction alongside the CandidateAssessment status update.
export async function buildLanguageRegeneration(
  assessmentId: string,
  round: number,
  difficulty: AssessmentDifficulty,
  disabilityCategories: string[],
) {
  const oldRows = await prisma.candidateAssessmentAnswer.findMany({
    where: { candidateAssessmentId: assessmentId, round, section: { in: LANGUAGE_SECTIONS } },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });

  const bankRows = await prisma.assessmentQuestion.findMany({
    where: { section: { in: LANGUAGE_SECTIONS }, difficulty },
  });
  const bank: BankQuestion[] = bankRows.map((r) => ({
    id: r.id,
    section: r.section,
    prompt: r.prompt,
    passage: r.passage,
    options: r.options,
    correctIndex: r.correctIndex,
  }));

  const fresh = pickLanguageQuestions(bank, disabilityCategories);

  return [
    prisma.candidateAssessmentAnswer.deleteMany({ where: { id: { in: oldRows.map((r) => r.id) } } }),
    prisma.candidateAssessmentAnswer.createMany({
      data: fresh.map((q, i) => ({
        candidateAssessmentId: assessmentId,
        order: oldRows[i].order,
        round,
        difficulty,
        section: q.section,
        prompt: q.prompt,
        passage: q.passage,
        options: q.options,
        correctIndex: q.correctIndex,
      })),
    }),
  ];
}
