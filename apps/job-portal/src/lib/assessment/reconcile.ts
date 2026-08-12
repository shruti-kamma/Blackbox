import type { AssessmentSection } from "@blackbox/db";
import { prisma } from "@/lib/db";
import {
  ASSESSMENT_COUNTS,
  applicableLanguageSections,
  distributeQuestionCount,
  shuffle,
  type BankQuestion,
} from "./question-bank";

const LANGUAGE_SECTIONS: AssessmentSection[] = ["LISTENING", "SPEAKING", "READING", "WRITING"];

// A candidate's disability categories can change after they've already
// started the assessment (edited from their profile, or set later via the
// portal-select modal on a return visit). Questions are snapshotted at
// start time so a candidate can't reroll for easier ones — but that means
// an in-progress exam can be left showing questions from a section that no
// longer applies (e.g. Listening, after adding HEARING).
//
// Call this before returning an IN_PROGRESS assessment: it drops any
// still-*unanswered* questions from sections that are no longer applicable
// and tops the language section back up to its full count from whichever
// sections currently apply — same distribution logic used at first start.
// Already-answered rows are never touched.
export async function reconcileLanguageSections(
  assessmentId: string,
  disabilityCategories: string[],
): Promise<void> {
  const currentAnswers = await prisma.candidateAssessmentAnswer.findMany({
    where: { candidateAssessmentId: assessmentId },
  });

  const applicable = applicableLanguageSections(disabilityCategories);
  const applicableSet = new Set(applicable);

  const toDrop = currentAnswers.filter(
    (a) => LANGUAGE_SECTIONS.includes(a.section) && !applicableSet.has(a.section) && a.selectedIndex === null,
  );

  const remaining = currentAnswers.filter((a) => !toDrop.some((d) => d.id === a.id));
  const targets = distributeQuestionCount(ASSESSMENT_COUNTS.LANGUAGE, applicable.length);
  const shortfalls = applicable
    .map((section, i) => ({ section, need: targets[i] - remaining.filter((a) => a.section === section).length }))
    .filter((s) => s.need > 0);

  if (toDrop.length === 0 && shortfalls.length === 0) return;

  const bankRows = await prisma.assessmentQuestion.findMany({ where: { section: { in: applicable } } });
  const bank: BankQuestion[] = bankRows.map((r) => ({
    id: r.id,
    section: r.section,
    prompt: r.prompt,
    passage: r.passage,
    options: r.options,
    correctIndex: r.correctIndex,
  }));

  const usedPrompts = new Set(remaining.map((a) => a.prompt));
  let nextOrder = currentAnswers.reduce((max, a) => Math.max(max, a.order), -1) + 1;

  const newRows: {
    order: number;
    section: AssessmentSection;
    prompt: string;
    passage: string | null;
    options: string[];
    correctIndex: number;
  }[] = [];
  for (const { section, need } of shortfalls) {
    const pool = bank.filter((q) => q.section === section && !usedPrompts.has(q.prompt));
    for (const q of shuffle(pool).slice(0, need)) {
      usedPrompts.add(q.prompt);
      newRows.push({
        order: nextOrder++,
        section: q.section,
        prompt: q.prompt,
        passage: q.passage,
        options: q.options,
        correctIndex: q.correctIndex,
      });
    }
  }

  await prisma.$transaction([
    ...(toDrop.length > 0
      ? [prisma.candidateAssessmentAnswer.deleteMany({ where: { id: { in: toDrop.map((a) => a.id) } } })]
      : []),
    ...(newRows.length > 0
      ? [
          prisma.candidateAssessmentAnswer.createMany({
            data: newRows.map((r) => ({ ...r, candidateAssessmentId: assessmentId })),
          }),
        ]
      : []),
  ]);
}
