import type { AssessmentDifficulty, AssessmentSection } from "@blackbox/db";
import { prisma } from "@/lib/db";
import { ASSESSMENT_COUNTS, pickAptitudeQuestions, pickLanguageQuestions, type BankQuestion } from "./question-bank";
import { generateSkillQuestions } from "./skill-question-generator";

export interface AssembledQuestion {
  section: AssessmentSection | "SKILL_BASED";
  prompt: string;
  passage: string | null;
  options: string[];
  correctIndex: number;
  skillName: string | null;
}

// Assembles one full 40-question round (15 language, disability-adjusted +
// 15 aptitude/10 skill-based, or 25-question fallback) at a given
// difficulty tier — the exact same shape at every level, per the client's
// explicit constraint that levels are a layer on top of the existing exam,
// not a redesign of it. Extracted out of the original start route (which
// only ever assembled once, at the implicit EASY-only tier) so both the
// first round (start/route.ts) and every subsequent round (submit/route.ts,
// on advancing a level) share one assembly path rather than two
// copies drifting apart.
export async function assembleRoundQuestions(
  candidateProfileId: string,
  difficulty: AssessmentDifficulty,
): Promise<AssembledQuestion[]> {
  const candidate = await prisma.candidateProfile.findUniqueOrThrow({
    where: { id: candidateProfileId },
    select: { disabilityCategories: true, skills: { select: { skill: { select: { name: true } } } } },
  });
  const skillNames = candidate.skills.map((s) => s.skill.name);

  const bankRows = await prisma.assessmentQuestion.findMany({ where: { difficulty } });
  const bank: BankQuestion[] = bankRows.map((r) => ({
    id: r.id,
    section: r.section,
    prompt: r.prompt,
    passage: r.passage,
    options: r.options,
    correctIndex: r.correctIndex,
  }));

  const languageQuestions = pickLanguageQuestions(bank, candidate.disabilityCategories);

  let aptitudeQuestions: BankQuestion[];
  let skillQuestions: { skillName: string; prompt: string; options: string[]; correctIndex: number }[] = [];

  if (skillNames.length === 0) {
    aptitudeQuestions = pickAptitudeQuestions(bank, ASSESSMENT_COUNTS.APTITUDE_FALLBACK);
  } else {
    aptitudeQuestions = pickAptitudeQuestions(bank, ASSESSMENT_COUNTS.APTITUDE);
    try {
      skillQuestions = await generateSkillQuestions(skillNames, ASSESSMENT_COUNTS.SKILL, difficulty);
    } catch {
      // AI generation failed — fall back to more aptitude questions rather
      // than blocking the candidate from starting/advancing at all.
      const usedIds = new Set(aptitudeQuestions.map((q) => q.id));
      const remainingPool = bank.filter((q) => q.section === "APTITUDE" && !usedIds.has(q.id));
      aptitudeQuestions = [
        ...aptitudeQuestions,
        ...pickAptitudeQuestions(remainingPool, ASSESSMENT_COUNTS.SKILL),
      ];
    }
  }

  return [
    ...languageQuestions.map((q) => ({
      section: q.section,
      prompt: q.prompt,
      passage: q.passage,
      options: q.options,
      correctIndex: q.correctIndex,
      skillName: null as string | null,
    })),
    ...aptitudeQuestions.map((q) => ({
      section: q.section,
      prompt: q.prompt,
      passage: q.passage,
      options: q.options,
      correctIndex: q.correctIndex,
      skillName: null as string | null,
    })),
    ...skillQuestions.map((q) => ({
      section: "SKILL_BASED" as const,
      prompt: q.prompt,
      passage: null as string | null,
      options: q.options,
      correctIndex: q.correctIndex,
      skillName: q.skillName as string | null,
    })),
  ];
}
