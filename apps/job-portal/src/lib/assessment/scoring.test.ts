import { describe, expect, it } from "vitest";
import { scoreAssessment, type ScoredAnswer } from "./scoring";

function answer(overrides: Partial<ScoredAnswer> = {}): ScoredAnswer {
  return { section: "APTITUDE", correctIndex: 0, selectedIndex: 0, ...overrides };
}

describe("scoreAssessment", () => {
  it("scores 100 when every answer is correct", () => {
    const result = scoreAssessment([answer(), answer(), answer()]);
    expect(result.score).toBe(100);
  });

  it("scores 0 when every answer is wrong", () => {
    const result = scoreAssessment([answer({ selectedIndex: 1 }), answer({ selectedIndex: 2 })]);
    expect(result.score).toBe(0);
  });

  it("scores unanswered questions (null selectedIndex) as incorrect", () => {
    const result = scoreAssessment([answer(), answer({ selectedIndex: null })]);
    expect(result.score).toBe(50);
  });

  it("computes language, aptitude, and skill sub-scores independently", () => {
    const result = scoreAssessment([
      answer({ section: "READING", selectedIndex: 0 }),
      answer({ section: "WRITING", selectedIndex: 1 }), // wrong
      answer({ section: "APTITUDE", selectedIndex: 0 }),
      answer({ section: "SKILL_BASED", selectedIndex: 0 }),
    ]);
    expect(result.languageScore).toBe(50); // 1 of 2 language questions correct
    expect(result.aptitudeScore).toBe(100);
    expect(result.skillScore).toBe(100);
  });

  it("returns null for skillScore when there are no SKILL_BASED questions in this attempt", () => {
    const result = scoreAssessment([answer({ section: "APTITUDE" })]);
    expect(result.skillScore).toBeNull();
  });

  it("treats LISTENING, SPEAKING, READING, and WRITING as one combined language group", () => {
    const result = scoreAssessment([
      answer({ section: "LISTENING", selectedIndex: 0 }),
      answer({ section: "SPEAKING", selectedIndex: 0 }),
      answer({ section: "READING", selectedIndex: 1 }), // wrong
      answer({ section: "WRITING", selectedIndex: 1 }), // wrong
    ]);
    expect(result.languageScore).toBe(50);
  });
});
