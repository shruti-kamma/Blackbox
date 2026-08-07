import { describe, expect, it } from "vitest";
import { MATCH_THRESHOLD, WEIGHT_ARCHETYPES, resolveWeightsForCandidate } from "./constants";
import { scoreCandidateAgainstJob } from "./scoring";
import type { SkillsSimilarity } from "./skills-similarity";
import type { CandidateForMatching, JobForMatching } from "./types";

function makeCandidate(overrides: Partial<CandidateForMatching> = {}): CandidateForMatching {
  return {
    id: "candidate-1",
    disabilityCategories: ["VISUAL"],
    accommodationNeeds: [],
    assistiveTechnologies: [],
    experienceLevel: "MID",
    preferredLocations: ["Bengaluru"],
    openToRemote: true,
    education: [{ level: "BACHELORS", fieldOfStudy: "Computer Science" }],
    skills: ["JavaScript", "React", "SQL"],
    ...overrides,
  };
}

function makeJob(overrides: Partial<JobForMatching> = {}): JobForMatching {
  return {
    id: "job-1",
    targetDisabilityCategories: ["VISUAL"],
    accommodationTypes: [],
    preferredAssistiveTechnologies: [],
    requiredEducationLevel: "BACHELORS",
    requiredEducationField: "Computer Science",
    requiredExperienceLevel: "MID",
    requiredSkills: ["JavaScript", "React"],
    location: "Bengaluru",
    remote: false,
    ...overrides,
  };
}

describe("scoreCandidateAgainstJob", () => {
  it("scores a fully-aligned candidate/job at 100 and marks it a match", () => {
    const result = scoreCandidateAgainstJob(makeCandidate(), makeJob());
    expect(result.score).toBe(100);
    expect(result.isMatch).toBe(true);
  });

  it("treats an empty target disability list as open to all", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ disabilityCategories: ["MOBILITY"] }),
      makeJob({ targetDisabilityCategories: [] }),
    );
    expect(result.breakdown.disability.score).toBe(1);
  });

  it("zeroes the disability criterion when there's no category overlap", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ disabilityCategories: ["HEARING"] }),
      makeJob({ targetDisabilityCategories: ["VISUAL", "MOBILITY"] }),
    );
    expect(result.breakdown.disability.score).toBe(0);
    expect(result.score).toBeLessThan(100);
  });

  it("scores partial skills coverage proportionally", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ skills: ["JavaScript"] }),
      makeJob({ requiredSkills: ["JavaScript", "React", "SQL", "GraphQL"] }),
    );
    // 1 of 4 required skills covered
    expect(result.breakdown.skills.score).toBeCloseTo(0.25);
  });

  it("gives full education credit when no education is required", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ education: [] }),
      makeJob({ requiredEducationLevel: null, requiredEducationField: null }),
    );
    expect(result.breakdown.education.score).toBe(1);
  });

  it("penalizes a candidate below the required education level", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ education: [{ level: "HIGH_SCHOOL" }] }),
      makeJob({ requiredEducationLevel: "MASTERS", requiredEducationField: null }),
    );
    expect(result.breakdown.education.score).toBeLessThan(0.5);
  });

  it("gives partial credit when education level is met but field of study differs", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ education: [{ level: "MASTERS", fieldOfStudy: "Biology" }] }),
      makeJob({ requiredEducationLevel: "BACHELORS", requiredEducationField: "Computer Science" }),
    );
    expect(result.breakdown.education.score).toBe(0.7);
  });

  it("rewards experience above the requirement without penalizing to zero", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ experienceLevel: "LEAD" }),
      makeJob({ requiredExperienceLevel: "ENTRY" }),
    );
    expect(result.breakdown.experience.score).toBe(0.9);
  });

  it("penalizes experience below the requirement proportionally to the gap", () => {
    const oneTierBelow = scoreCandidateAgainstJob(
      makeCandidate({ experienceLevel: "ENTRY" }),
      makeJob({ requiredExperienceLevel: "MID" }),
    );
    const twoTiersBelow = scoreCandidateAgainstJob(
      makeCandidate({ experienceLevel: "ENTRY" }),
      makeJob({ requiredExperienceLevel: "LEAD" }),
    );
    expect(oneTierBelow.breakdown.experience.score).toBeGreaterThan(
      twoTiersBelow.breakdown.experience.score,
    );
  });

  it("matches on remote when both job and candidate accept it", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ openToRemote: true, preferredLocations: [] }),
      makeJob({ remote: true, location: null }),
    );
    expect(result.breakdown.location.score).toBe(1);
  });

  it("matches on an exact preferred location", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ openToRemote: false, preferredLocations: ["Mumbai"] }),
      makeJob({ remote: false, location: "Mumbai" }),
    );
    expect(result.breakdown.location.score).toBe(1);
  });

  it("gives neutral partial credit when the candidate has no location preference at all", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ openToRemote: false, preferredLocations: [] }),
      makeJob({ remote: false, location: "Chennai" }),
    );
    expect(result.breakdown.location.score).toBe(0.6);
  });

  it("zeroes location when preferences are set but don't overlap", () => {
    const result = scoreCandidateAgainstJob(
      makeCandidate({ openToRemote: false, preferredLocations: ["Delhi"] }),
      makeJob({ remote: false, location: "Chennai" }),
    );
    expect(result.breakdown.location.score).toBe(0);
  });

  it("respects a custom threshold", () => {
    const poorFit = {
      candidate: makeCandidate({
        skills: [],
        disabilityCategories: ["HEARING"],
        accommodationNeeds: ["SIGN_LANGUAGE_INTERPRETER"],
      }),
      job: makeJob({
        requiredSkills: ["JavaScript", "React"],
        targetDisabilityCategories: ["VISUAL"],
        accommodationTypes: [],
      }),
    };
    const belowDefault = scoreCandidateAgainstJob(poorFit.candidate, poorFit.job);
    expect(belowDefault.score).toBeLessThan(MATCH_THRESHOLD);
    expect(belowDefault.isMatch).toBe(false);

    const withLowThreshold = scoreCandidateAgainstJob(poorFit.candidate, poorFit.job, { threshold: 10 });
    expect(withLowThreshold.isMatch).toBe(true);
  });

  it("accepts a pluggable skills similarity implementation", () => {
    const alwaysFullCredit: SkillsSimilarity = { score: () => 1 };
    const result = scoreCandidateAgainstJob(
      makeCandidate({ skills: [] }),
      makeJob({ requiredSkills: ["Rust"] }),
      { skillsSimilarity: alwaysFullCredit },
    );
    expect(result.breakdown.skills.score).toBe(1);
  });

  it("rejects weights that don't sum to 1", () => {
    expect(() =>
      scoreCandidateAgainstJob(makeCandidate(), makeJob(), {
        weights: {
          disability: 0.5,
          accommodationFit: 0.5,
          assistiveTechFit: 0.5,
          skills: 0.5,
          education: 0.5,
          experience: 0,
          location: 0,
        },
      }),
    ).toThrow();
  });

  describe("scoreAccommodationFit (via breakdown)", () => {
    it("gives full credit when the candidate hasn't specified any accommodation needs", () => {
      const result = scoreCandidateAgainstJob(
        makeCandidate({ accommodationNeeds: [] }),
        makeJob({ accommodationTypes: [] }),
      );
      expect(result.breakdown.accommodationFit.score).toBe(1);
    });

    it("scores partial coverage of the candidate's accommodation needs", () => {
      const result = scoreCandidateAgainstJob(
        makeCandidate({ accommodationNeeds: ["SCREEN_READER_SUPPORT", "FLEXIBLE_HOURS"] }),
        makeJob({ accommodationTypes: ["FLEXIBLE_HOURS"] }),
      );
      expect(result.breakdown.accommodationFit.score).toBeCloseTo(0.5);
    });

    it("zeroes the criterion when the job offers none of the needed accommodations", () => {
      const result = scoreCandidateAgainstJob(
        makeCandidate({ accommodationNeeds: ["WHEELCHAIR_ACCESSIBLE_WORKSPACE"] }),
        makeJob({ accommodationTypes: ["FLEXIBLE_HOURS"] }),
      );
      expect(result.breakdown.accommodationFit.score).toBe(0);
    });

    it("gives full credit when the job offers everything the candidate needs, plus extras", () => {
      const result = scoreCandidateAgainstJob(
        makeCandidate({ accommodationNeeds: ["FLEXIBLE_HOURS"] }),
        makeJob({ accommodationTypes: ["FLEXIBLE_HOURS", "REMOTE_FRIENDLY"] }),
      );
      expect(result.breakdown.accommodationFit.score).toBe(1);
    });
  });

  describe("scoreAssistiveTechFit (via breakdown)", () => {
    it("gives full credit when the job specifies no preferred assistive technology", () => {
      const result = scoreCandidateAgainstJob(
        makeCandidate({ assistiveTechnologies: [] }),
        makeJob({ preferredAssistiveTechnologies: [] }),
      );
      expect(result.breakdown.assistiveTechFit.score).toBe(1);
    });

    it("scores partial coverage of the job's preferred assistive technology", () => {
      const result = scoreCandidateAgainstJob(
        makeCandidate({ assistiveTechnologies: ["JAWS"] }),
        makeJob({ preferredAssistiveTechnologies: ["JAWS", "NVDA"] }),
      );
      expect(result.breakdown.assistiveTechFit.score).toBeCloseTo(0.5);
    });

    it("zeroes the criterion when the candidate has none of the preferred technology", () => {
      const result = scoreCandidateAgainstJob(
        makeCandidate({ assistiveTechnologies: ["Crutches"] }),
        makeJob({ preferredAssistiveTechnologies: ["JAWS"] }),
      );
      expect(result.breakdown.assistiveTechFit.score).toBe(0);
    });

    it("matches case-insensitively", () => {
      const result = scoreCandidateAgainstJob(
        makeCandidate({ assistiveTechnologies: ["jaws"] }),
        makeJob({ preferredAssistiveTechnologies: ["JAWS"] }),
      );
      expect(result.breakdown.assistiveTechFit.score).toBe(1);
    });
  });
});

describe("resolveWeightsForCandidate", () => {
  it("returns the default vector when the candidate has no categories", () => {
    expect(resolveWeightsForCandidate([])).toEqual(WEIGHT_ARCHETYPES.DEFAULT);
  });

  it("returns the default vector when the only category is OTHER", () => {
    expect(resolveWeightsForCandidate(["OTHER"])).toEqual(WEIGHT_ARCHETYPES.DEFAULT);
  });

  it("returns a single category's archetype directly", () => {
    expect(resolveWeightsForCandidate(["MOBILITY"])).toEqual(WEIGHT_ARCHETYPES.PHYSICAL_ACCESS);
    expect(resolveWeightsForCandidate(["VISUAL"])).toEqual(WEIGHT_ARCHETYPES.TOOLING_ACCOMMODATION);
    expect(resolveWeightsForCandidate(["COGNITIVE"])).toEqual(WEIGHT_ARCHETYPES.FLEXIBILITY);
  });

  it("averages archetypes elementwise for a candidate with multiple categories", () => {
    const resolved = resolveWeightsForCandidate(["MOBILITY", "VISUAL"]);
    const physical = WEIGHT_ARCHETYPES.PHYSICAL_ACCESS;
    const tooling = WEIGHT_ARCHETYPES.TOOLING_ACCOMMODATION;
    expect(resolved.accommodationFit).toBeCloseTo((physical.accommodationFit + tooling.accommodationFit) / 2);
    expect(resolved.location).toBeCloseTo((physical.location + tooling.location) / 2);
  });

  it("every weight archetype sums to exactly 1", () => {
    for (const [name, weights] of Object.entries(WEIGHT_ARCHETYPES)) {
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum, `${name} archetype should sum to 1`).toBeCloseTo(1);
    }
  });

  it("an averaged multi-category vector always sums to exactly 1", () => {
    const resolved = resolveWeightsForCandidate(["MOBILITY", "VISUAL", "COGNITIVE"]);
    const sum = Object.values(resolved).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1);
  });
});
