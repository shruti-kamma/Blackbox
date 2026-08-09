export interface ScoredAnswer {
  section: "LISTENING" | "SPEAKING" | "READING" | "WRITING" | "APTITUDE" | "SKILL_BASED";
  correctIndex: number;
  selectedIndex: number | null;
}

export interface AssessmentScoreResult {
  score: number; // 0-100 overall
  languageScore: number | null;
  aptitudeScore: number | null;
  // null when this attempt had no SKILL_BASED questions — the no-skills
  // fallback substitutes more aptitude questions instead, see question-bank.ts.
  skillScore: number | null;
}

const LANGUAGE_SECTIONS = new Set(["LISTENING", "SPEAKING", "READING", "WRITING"]);

function percentCorrect(answers: ScoredAnswer[]): number | null {
  if (answers.length === 0) return null;
  const correct = answers.filter((a) => a.selectedIndex === a.correctIndex).length;
  return Math.round((correct / answers.length) * 100);
}

export function scoreAssessment(answers: ScoredAnswer[]): AssessmentScoreResult {
  const language = answers.filter((a) => LANGUAGE_SECTIONS.has(a.section));
  const aptitude = answers.filter((a) => a.section === "APTITUDE");
  const skill = answers.filter((a) => a.section === "SKILL_BASED");

  return {
    score: percentCorrect(answers) ?? 0,
    languageScore: percentCorrect(language),
    aptitudeScore: percentCorrect(aptitude),
    skillScore: percentCorrect(skill),
  };
}
