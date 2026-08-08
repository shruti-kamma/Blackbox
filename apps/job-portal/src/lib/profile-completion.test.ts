import { describe, expect, it } from "vitest";
import { computeProfileCompletion, type ProfileCompletionInput } from "./profile-completion";

const complete: ProfileCompletionInput = {
  headline: "Frontend engineer",
  disabilityCategories: ["VISUAL"],
  experienceLevel: "MID",
  preferredLocations: ["Bengaluru"],
  openToRemote: true,
  education: [{}],
  workExperience: [{}],
  skills: ["JavaScript", "React", "SQL"],
  accommodationNeeds: ["SCREEN_READER_SUPPORT"],
  confirmedNoAccommodationNeeds: false,
};

describe("computeProfileCompletion", () => {
  it("scores 100% when every item, including accommodation needs, is set", () => {
    const { percent } = computeProfileCompletion(complete);
    expect(percent).toBe(100);
  });

  it("counts an explicit 'no accommodations needed' confirmation as complete", () => {
    const { percent } = computeProfileCompletion({
      ...complete,
      accommodationNeeds: [],
      confirmedNoAccommodationNeeds: true,
    });
    expect(percent).toBe(100);
  });

  it("marks the accommodation item incomplete when neither needs nor a confirmation is on file", () => {
    const { percent, items } = computeProfileCompletion({
      ...complete,
      accommodationNeeds: [],
      confirmedNoAccommodationNeeds: false,
    });
    expect(percent).toBeLessThan(100);
    const accommodationItem = items.find((i) => i.label.startsWith("Specify accommodation needs"));
    expect(accommodationItem?.done).toBe(false);
  });

  it("returns null nextBestAction when the profile is fully complete", () => {
    const { nextBestAction } = computeProfileCompletion(complete);
    expect(nextBestAction).toBeNull();
  });

  it("prioritizes skills over a merely cosmetic field like headline", () => {
    const { nextBestAction } = computeProfileCompletion({
      ...complete,
      skills: [],
      headline: null,
    });
    expect(nextBestAction).toContain("skills");
  });

  it("prioritizes accommodation needs over headline and work experience", () => {
    const { nextBestAction } = computeProfileCompletion({
      ...complete,
      accommodationNeeds: [],
      confirmedNoAccommodationNeeds: false,
      headline: null,
      workExperience: [],
    });
    expect(nextBestAction).toContain("accommodation needs");
  });

  it("falls back to headline when it's the only thing missing", () => {
    const { nextBestAction } = computeProfileCompletion({
      ...complete,
      headline: null,
    });
    expect(nextBestAction).toBe("Add a headline");
  });
});
