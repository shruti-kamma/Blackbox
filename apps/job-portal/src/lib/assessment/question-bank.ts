import type { AssessmentSection } from "@blackbox/db";

export interface BankQuestion {
  id: string;
  section: AssessmentSection;
  prompt: string;
  passage: string | null;
  options: string[];
  correctIndex: number;
}

export const ASSESSMENT_COUNTS = {
  LANGUAGE: 15,
  APTITUDE: 15,
  SKILL: 10,
  // When a candidate has no skills listed, there's nothing to personalize
  // against — draw this many aptitude questions instead of calling the AI
  // with no input, rather than blocking the candidate from starting at all.
  APTITUDE_FALLBACK: 25,
} as const;

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Which of Listening/Speaking/Reading/Writing apply to this candidate.
// HEARING drops Listening, SPEECH drops Speaking. Reading and Writing are
// pure MCQ selection — not physical writing or visual-only content — so no
// category needs to skip them.
export function applicableLanguageSections(disabilityCategories: string[]): AssessmentSection[] {
  const sections: AssessmentSection[] = ["LISTENING", "SPEAKING", "READING", "WRITING"];
  return sections.filter((s) => {
    if (s === "LISTENING" && disabilityCategories.includes("HEARING")) return false;
    if (s === "SPEAKING" && disabilityCategories.includes("SPEECH")) return false;
    return true;
  });
}

// Splits `total` as evenly as possible across `sectionCount` groups, e.g.
// 15 across 4 -> [4,4,4,3]; across 3 -> [5,5,5]; across 2 -> [8,7].
export function distributeQuestionCount(total: number, sectionCount: number): number[] {
  const base = Math.floor(total / sectionCount);
  const remainder = total % sectionCount;
  return Array.from({ length: sectionCount }, (_, i) => base + (i < remainder ? 1 : 0));
}

export function pickLanguageQuestions(bank: BankQuestion[], disabilityCategories: string[]): BankQuestion[] {
  const sections = applicableLanguageSections(disabilityCategories);
  const counts = distributeQuestionCount(ASSESSMENT_COUNTS.LANGUAGE, sections.length);
  const picked: BankQuestion[] = [];
  sections.forEach((section, i) => {
    const pool = bank.filter((q) => q.section === section);
    picked.push(...shuffle(pool).slice(0, counts[i]));
  });
  return picked;
}

export function pickAptitudeQuestions(bank: BankQuestion[], count: number): BankQuestion[] {
  const pool = bank.filter((q) => q.section === "APTITUDE");
  return shuffle(pool).slice(0, count);
}
