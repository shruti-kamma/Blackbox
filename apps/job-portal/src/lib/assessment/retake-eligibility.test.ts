import type { AssessmentSection } from "@blackbox/db";
import { describe, expect, it } from "vitest";
import { languageSectionsDiffer } from "./retake-eligibility";

describe("languageSectionsDiffer", () => {
  it("returns false when the sets match exactly", () => {
    expect(languageSectionsDiffer(["READING", "WRITING"], ["READING", "WRITING"])).toBe(false);
  });

  it("returns false when the sets match regardless of order", () => {
    expect(languageSectionsDiffer(["WRITING", "READING"], ["READING", "WRITING"])).toBe(false);
  });

  it("returns true when a section was tested but is no longer applicable", () => {
    expect(
      languageSectionsDiffer(["LISTENING", "SPEAKING", "READING", "WRITING"], ["SPEAKING", "READING", "WRITING"]),
    ).toBe(true);
  });

  it("returns true when a section now applies but wasn't tested", () => {
    expect(languageSectionsDiffer(["READING", "WRITING"], ["LISTENING", "READING", "WRITING"])).toBe(true);
  });

  it("returns false for an unrelated category change that doesn't affect language sections", () => {
    // e.g. adding MOBILITY never changes applicableLanguageSections' output
    const usedAndStillApplicable: AssessmentSection[] = ["LISTENING", "SPEAKING", "READING", "WRITING"];
    expect(languageSectionsDiffer(usedAndStillApplicable, usedAndStillApplicable)).toBe(false);
  });
});
