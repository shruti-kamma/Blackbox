import { describe, expect, it } from "vitest";
import { isMatchingSubstantialChange } from "./change-detection";

const base = {
  disabilityCategories: ["VISUAL", "HEARING"],
  experienceLevel: "MID",
  preferredLocations: ["Bengaluru", "Mumbai"],
  openToRemote: true,
  education: [{ level: "BACHELORS", fieldOfStudy: "Computer Science" }],
  skills: ["JavaScript", "React"],
};

describe("isMatchingSubstantialChange", () => {
  it("returns false when nothing changed", () => {
    expect(isMatchingSubstantialChange(base, { ...base })).toBe(false);
  });

  it("ignores array ordering", () => {
    expect(
      isMatchingSubstantialChange(base, {
        ...base,
        disabilityCategories: ["HEARING", "VISUAL"],
        preferredLocations: ["Mumbai", "Bengaluru"],
        skills: ["React", "JavaScript"],
      }),
    ).toBe(false);
  });

  it("flags a changed disability category list", () => {
    expect(isMatchingSubstantialChange(base, { ...base, disabilityCategories: ["MOBILITY"] })).toBe(true);
  });

  it("flags a changed experience level", () => {
    expect(isMatchingSubstantialChange(base, { ...base, experienceLevel: "SENIOR" })).toBe(true);
  });

  it("flags a changed skill set", () => {
    expect(isMatchingSubstantialChange(base, { ...base, skills: ["JavaScript", "SQL"] })).toBe(true);
  });

  it("flags a changed education entry", () => {
    expect(
      isMatchingSubstantialChange(base, {
        ...base,
        education: [{ level: "MASTERS", fieldOfStudy: "Computer Science" }],
      }),
    ).toBe(true);
  });

  it("flags a changed remote preference", () => {
    expect(isMatchingSubstantialChange(base, { ...base, openToRemote: false })).toBe(true);
  });

  it("flags a changed preferred location list", () => {
    expect(isMatchingSubstantialChange(base, { ...base, preferredLocations: ["Delhi"] })).toBe(true);
  });
});
