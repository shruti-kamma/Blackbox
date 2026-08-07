export interface ProfileCompletionInput {
  headline: string | null;
  disabilityCategories: string[];
  experienceLevel: string | null;
  preferredLocations: string[];
  openToRemote: boolean;
  education: unknown[];
  workExperience: unknown[];
  skills: unknown[];
}

export interface ProfileCompletionItem {
  label: string;
  done: boolean;
}

export function computeProfileCompletion(profile: ProfileCompletionInput): {
  percent: number;
  items: ProfileCompletionItem[];
} {
  const items: ProfileCompletionItem[] = [
    { label: "Add a headline", done: Boolean(profile.headline) },
    { label: "Select a disability category", done: profile.disabilityCategories.length > 0 },
    { label: "Set your experience level", done: Boolean(profile.experienceLevel) },
    { label: "Add an education entry", done: profile.education.length > 0 },
    { label: "Add a work experience entry", done: profile.workExperience.length > 0 },
    { label: "Add at least 3 skills", done: profile.skills.length >= 3 },
    { label: "Set a location preference", done: profile.preferredLocations.length > 0 || profile.openToRemote },
  ];
  const percent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  return { percent, items };
}
