// A "substantial" profile edit is one that could change matching outcomes —
// anything the scoring function actually reads. Editing a headline or resume
// URL alone shouldn't trigger a re-scan of every open job.
interface MatchingRelevantFields {
  disabilityCategories: string[];
  experienceLevel: string | null;
  preferredLocations: string[];
  openToRemote: boolean;
  education: { level: string; fieldOfStudy: string | null }[];
  skills: string[];
}

function normalize(fields: MatchingRelevantFields): string {
  return JSON.stringify({
    disabilityCategories: [...fields.disabilityCategories].sort(),
    experienceLevel: fields.experienceLevel,
    preferredLocations: [...fields.preferredLocations].sort(),
    openToRemote: fields.openToRemote,
    education: [...fields.education]
      .map((e) => `${e.level}:${e.fieldOfStudy ?? ""}`)
      .sort(),
    skills: [...fields.skills].sort(),
  });
}

export function isMatchingSubstantialChange(
  before: MatchingRelevantFields,
  after: MatchingRelevantFields,
): boolean {
  return normalize(before) !== normalize(after);
}
