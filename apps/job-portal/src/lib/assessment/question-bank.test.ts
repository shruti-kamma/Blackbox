import { describe, expect, it } from "vitest";
import {
  applicableLanguageSections,
  distributeQuestionCount,
  pickAptitudeQuestions,
  pickLanguageQuestions,
  type BankQuestion,
} from "./question-bank";

describe("applicableLanguageSections", () => {
  it("includes all four sections when no HEARING or SPEECH category is present", () => {
    expect(applicableLanguageSections(["VISUAL", "MOBILITY"])).toEqual([
      "LISTENING",
      "SPEAKING",
      "READING",
      "WRITING",
    ]);
  });

  it("drops Listening for a candidate with a HEARING category", () => {
    expect(applicableLanguageSections(["HEARING"])).toEqual(["SPEAKING", "READING", "WRITING"]);
  });

  it("drops Speaking for a candidate with a SPEECH category", () => {
    expect(applicableLanguageSections(["SPEECH"])).toEqual(["LISTENING", "READING", "WRITING"]);
  });

  it("drops both Listening and Speaking for a candidate with both categories", () => {
    expect(applicableLanguageSections(["HEARING", "SPEECH"])).toEqual(["READING", "WRITING"]);
  });

  it("never drops Reading or Writing for any category", () => {
    for (const category of ["VISUAL", "HEARING", "MOBILITY", "COGNITIVE", "SPEECH", "CHRONIC_ILLNESS", "MENTAL_HEALTH"]) {
      const sections = applicableLanguageSections([category]);
      expect(sections).toContain("READING");
      expect(sections).toContain("WRITING");
    }
  });
});

describe("distributeQuestionCount", () => {
  it("splits evenly when it divides cleanly", () => {
    expect(distributeQuestionCount(15, 3)).toEqual([5, 5, 5]);
  });

  it("gives the remainder to the first sections when it doesn't divide cleanly", () => {
    expect(distributeQuestionCount(15, 4)).toEqual([4, 4, 4, 3]);
    expect(distributeQuestionCount(15, 2)).toEqual([8, 7]);
  });

  it("always sums back to the total", () => {
    for (const sectionCount of [1, 2, 3, 4]) {
      const counts = distributeQuestionCount(15, sectionCount);
      expect(counts.reduce((a, b) => a + b, 0)).toBe(15);
    }
  });
});

function makeBankQuestion(overrides: Partial<BankQuestion> = {}): BankQuestion {
  return {
    id: Math.random().toString(36),
    section: "APTITUDE",
    prompt: "Question",
    passage: null,
    options: ["a", "b", "c", "d"],
    correctIndex: 0,
    ...overrides,
  };
}

describe("pickLanguageQuestions", () => {
  it("returns exactly 15 questions total across applicable sections", () => {
    const bank = (["LISTENING", "SPEAKING", "READING", "WRITING"] as const).flatMap((section) =>
      Array.from({ length: 10 }, () => makeBankQuestion({ section })),
    );
    const picked = pickLanguageQuestions(bank, []);
    expect(picked.length).toBe(15);
  });

  it("excludes Listening questions entirely for a HEARING candidate", () => {
    const bank = (["LISTENING", "SPEAKING", "READING", "WRITING"] as const).flatMap((section) =>
      Array.from({ length: 10 }, () => makeBankQuestion({ section })),
    );
    const picked = pickLanguageQuestions(bank, ["HEARING"]);
    expect(picked.length).toBe(15);
    expect(picked.some((q) => q.section === "LISTENING")).toBe(false);
  });
});

describe("pickAptitudeQuestions", () => {
  it("returns the requested count from the APTITUDE pool only", () => {
    const bank = [
      ...Array.from({ length: 20 }, () => makeBankQuestion({ section: "APTITUDE" })),
      ...Array.from({ length: 5 }, () => makeBankQuestion({ section: "READING" })),
    ];
    const picked = pickAptitudeQuestions(bank, 15);
    expect(picked.length).toBe(15);
    expect(picked.every((q) => q.section === "APTITUDE")).toBe(true);
  });

  it("caps at the pool size when count exceeds what's available", () => {
    const bank = Array.from({ length: 5 }, () => makeBankQuestion({ section: "APTITUDE" }));
    expect(pickAptitudeQuestions(bank, 15).length).toBe(5);
  });
});
