import { describe, expect, it } from "vitest";
import { countCandidatesByDisabilityCategory } from "./candidate-counts";

describe("countCandidatesByDisabilityCategory", () => {
  it("returns every category, including ones with zero candidates", () => {
    const result = countCandidatesByDisabilityCategory([]);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.candidateCount === 0)).toBe(true);
  });

  it("counts a candidate once per category they've declared", () => {
    const result = countCandidatesByDisabilityCategory([
      { disabilityCategories: ["VISUAL", "HEARING"] },
      { disabilityCategories: ["VISUAL"] },
      { disabilityCategories: [] },
    ]);
    const visual = result.find((r) => r.category === "VISUAL")!;
    const hearing = result.find((r) => r.category === "HEARING")!;
    const mobility = result.find((r) => r.category === "MOBILITY")!;
    expect(visual.candidateCount).toBe(2);
    expect(hearing.candidateCount).toBe(1);
    expect(mobility.candidateCount).toBe(0);
  });
});
