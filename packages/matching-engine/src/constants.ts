import type { EducationLevel, ExperienceLevel, MatchWeights } from "./types";

// Weights are a product/policy decision, not a technical one — tune here.
// Must sum to 1; scoring.ts asserts this in dev.
export const DEFAULT_WEIGHTS: MatchWeights = {
  disability: 0.25,
  skills: 0.3,
  education: 0.15,
  experience: 0.15,
  location: 0.15,
};

// A job only becomes visible to a candidate (and vice versa, in the
// hiring-manager "matched candidates" view) once its score clears this bar.
export const MATCH_THRESHOLD = 60;

export const EDUCATION_RANK: Record<EducationLevel, number> = {
  HIGH_SCHOOL: 1,
  DIPLOMA: 2,
  ASSOCIATE: 3,
  BACHELORS: 4,
  MASTERS: 5,
  DOCTORATE: 6,
  OTHER: 0, // unranked — treated as "unspecified level", see scoring.ts
};

export const EXPERIENCE_RANK: Record<ExperienceLevel, number> = {
  ENTRY: 1,
  MID: 2,
  SENIOR: 3,
  LEAD: 4,
};
