export interface ProfileCompletionInput {
  headline: string | null;
  disabilityCategories: string[];
  experienceLevel: string | null;
  preferredLocations: string[];
  openToRemote: boolean;
  education: unknown[];
  workExperience: unknown[];
  skills: unknown[];
  accommodationNeeds: string[];
  confirmedNoAccommodationNeeds: boolean;
}

export interface ProfileCompletionItem {
  label: string;
  done: boolean;
  // What to tell the candidate to do about it if incomplete — distinct from
  // `label` (which describes the completed state) so the "next best thing"
  // guidance reads like an instruction, not a checklist restatement.
  guidance: string;
}

// Ordered by actual impact on match quality, most first — not the order
// they're asked in the profile form. Skills carries the single heaviest
// weight in the matching engine (packages/matching-engine/src/constants.ts,
// 0.25-0.3 depending on archetype); accommodation needs and disability
// category both feed the accessibility-specific scoring criteria and the
// weight-archetype resolution itself; location/education/experience are
// scored but lighter; work experience and headline aren't read by matching
// at all today (resume/display only), so they rank last regardless of how
// prominent they look in the form.
const ITEM_PRIORITY = [
  "skills",
  "accommodationNeeds",
  "disabilityCategories",
  "location",
  "education",
  "experienceLevel",
  "workExperience",
  "headline",
] as const;

export function computeProfileCompletion(profile: ProfileCompletionInput): {
  percent: number;
  items: ProfileCompletionItem[];
  // Highest-impact incomplete item's guidance, or null once everything's
  // done — the specific "what to add next" instead of just a percentage.
  nextBestAction: string | null;
} {
  const itemsByKey: Record<(typeof ITEM_PRIORITY)[number], ProfileCompletionItem> = {
    headline: { label: "Add a headline", done: Boolean(profile.headline), guidance: "Add a headline" },
    disabilityCategories: {
      label: "Select a disability category",
      done: profile.disabilityCategories.length > 0,
      guidance: "Select your disability category",
    },
    experienceLevel: {
      label: "Set your experience level",
      done: Boolean(profile.experienceLevel),
      guidance: "Set your experience level",
    },
    education: {
      label: "Add an education entry",
      done: profile.education.length > 0,
      guidance: "Add an education entry",
    },
    workExperience: {
      label: "Add a work experience entry",
      done: profile.workExperience.length > 0,
      guidance: "Add a work experience entry",
    },
    skills: {
      label: "Add at least 3 skills",
      done: profile.skills.length >= 3,
      guidance: "Add at least 3 skills — this is the single biggest factor in your match quality",
    },
    location: {
      label: "Set a location preference",
      done: profile.preferredLocations.length > 0 || profile.openToRemote,
      guidance: "Set a location preference (or mark yourself open to remote work)",
    },
    accommodationNeeds: {
      label: "Specify accommodation needs (or confirm you don't need any)",
      done: profile.accommodationNeeds.length > 0 || profile.confirmedNoAccommodationNeeds,
      guidance: "Add your accommodation needs (or confirm you don't need any) to improve your matches",
    },
  };

  const items = ITEM_PRIORITY.map((key) => itemsByKey[key]);
  const percent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  const nextBestAction = ITEM_PRIORITY.map((key) => itemsByKey[key]).find((i) => !i.done)?.guidance ?? null;

  return { percent, items, nextBestAction };
}
