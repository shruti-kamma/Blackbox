import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { ASSESSMENT_COUNTS, pickAptitudeQuestions, pickLanguageQuestions, type BankQuestion } from "@/lib/assessment/question-bank";
import { generateSkillQuestions } from "@/lib/assessment/skill-question-generator";

export async function POST() {
  try {
    const user = await requireVerifiedCandidate();
    const candidateProfileId = user.candidateProfile!.id;

    // Resumable, not regenerated — a candidate who refreshes mid-exam (or
    // already finished) gets their existing attempt back, not a fresh
    // reroll of questions.
    const existing = await prisma.candidateAssessment.findUnique({
      where: { candidateProfileId },
      include: { answers: { orderBy: { order: "asc" } } },
    });
    if (existing) {
      return NextResponse.json({
        status: existing.status,
        questions: existing.answers.map((a) => ({
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

    const candidate = await prisma.candidateProfile.findUniqueOrThrow({
      where: { id: candidateProfileId },
      select: { disabilityCategories: true, skills: { select: { skill: { select: { name: true } } } } },
    });
    const skillNames = candidate.skills.map((s) => s.skill.name);

    const bankRows = await prisma.assessmentQuestion.findMany();
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
      // Nothing to personalize against — draw more aptitude questions
      // instead of calling the AI with no input.
      aptitudeQuestions = pickAptitudeQuestions(bank, ASSESSMENT_COUNTS.APTITUDE_FALLBACK);
    } else {
      aptitudeQuestions = pickAptitudeQuestions(bank, ASSESSMENT_COUNTS.APTITUDE);
      try {
        skillQuestions = await generateSkillQuestions(skillNames, ASSESSMENT_COUNTS.SKILL);
      } catch {
        // AI generation failed (outage, malformed response, ...) — fall
        // back to more aptitude questions rather than blocking the
        // candidate from starting their exam at all.
        const usedIds = new Set(aptitudeQuestions.map((q) => q.id));
        const remainingPool = bank.filter((q) => q.section === "APTITUDE" && !usedIds.has(q.id));
        aptitudeQuestions = [
          ...aptitudeQuestions,
          ...pickAptitudeQuestions(remainingPool, ASSESSMENT_COUNTS.SKILL),
        ];
      }
    }

    const allQuestions = [
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

    const assessment = await prisma.candidateAssessment.create({
      data: {
        candidateProfileId,
        answers: {
          create: allQuestions.map((q, i) => ({
            order: i,
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
