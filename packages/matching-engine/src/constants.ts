import type { DisabilityCategory, EducationLevel, ExperienceLevel, MatchWeights } from "./types";

// Weights are a product/policy decision, not a technical one — tune here.
// Must sum to 1; scoring.ts asserts this in dev. The combined
// disability-related budget (disability + accommodationFit + assistiveTechFit)
// stays what it was before assistiveTechFit existed — each archetype's prior
// accommodationFit value is simply split into two numbers that sum back to
// it, so every vector keeps summing to 1.0 by construction.
export const DEFAULT_WEIGHTS: MatchWeights = {
  disability: 0.15,
  accommodationFit: 0.07,
  assistiveTechFit: 0.03,
  skills: 0.3,
  education: 0.15,
  experience: 0.15,
  location: 0.15,
};

// Named weight profiles, keyed by which aspect of fit matters most for a
// given disability category — not one bespoke vector per category (8 nearly
// arbitrary vectors would be harder to justify and audit than a few named
// archetypes). Each vector independently sums to 1.0.
export type WeightArchetype = "DEFAULT" | "PHYSICAL_ACCESS" | "TOOLING_ACCOMMODATION" | "FLEXIBILITY";

export const WEIGHT_ARCHETYPES: Record<WeightArchetype, MatchWeights> = {
  DEFAULT: DEFAULT_WEIGHTS,
  // Physical/remote access matters more than skill-overlap nuance;
  // assistive tech (mobility aids) still matters, second-most of the four.
  PHYSICAL_ACCESS: {
    disability: 0.15,
    accommodationFit: 0.09,
    assistiveTechFit: 0.06,
    skills: 0.25,
    education: 0.15,
    experience: 0.1,
    location: 0.2,
  },
  // Assistive-tech / communication accommodation-fit matters most — exactly
  // where JAWS/NVDA-type experience is most relevant.
  TOOLING_ACCOMMODATION: {
    disability: 0.15,
    accommodationFit: 0.12,
    assistiveTechFit: 0.08,
    skills: 0.25,
    education: 0.15,
    experience: 0.1,
    location: 0.15,
  },
  // Flexible hours/remote matter more; exact field-of-study match matters less.
  FLEXIBILITY: {
    disability: 0.15,
    accommodationFit: 0.13,
    assistiveTechFit: 0.05,
    skills: 0.25,
    education: 0.12,
    experience: 0.1,
    location: 0.2,
  },
};

export const CATEGORY_WEIGHT_ARCHETYPE: Record<DisabilityCategory, WeightArchetype> = {
  MOBILITY: "PHYSICAL_ACCESS",
  CHRONIC_ILLNESS: "PHYSICAL_ACCESS",
  VISUAL: "TOOLING_ACCOMMODATION",
  HEARING: "TOOLING_ACCOMMODATION",
  SPEECH: "TOOLING_ACCOMMODATION",
  COGNITIVE: "FLEXIBILITY",
  MENTAL_HEALTH: "FLEXIBILITY",
  OTHER: "DEFAULT",
};

// Resolves the weight vector to score a candidate with, based on their own
// disability categories rather than one fixed global vector. A candidate
// with multiple categories gets the elementwise average of each category's
// archetype — since every archetype vector sums to 1.0, an average of them
// does too, no renormalization needed.
export function resolveWeightsForCandidate(categories: DisabilityCategory[]): MatchWeights {
  const relevant = categories.filter((c) => c !== "OTHER");
  if (relevant.length === 0) return WEIGHT_ARCHETYPES.DEFAULT;

  const vectors = relevant.map((c) => WEIGHT_ARCHETYPES[CATEGORY_WEIGHT_ARCHETYPE[c]]);
  const keys = Object.keys(WEIGHT_ARCHETYPES.DEFAULT) as (keyof MatchWeights)[];
  const averaged = {} as MatchWeights;
  for (const key of keys) {
    averaged[key] = vectors.reduce((sum, v) => sum + v[key], 0) / vectors.length;
  }
  return averaged;
}

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
