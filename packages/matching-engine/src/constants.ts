import type { DisabilityCategory, EducationLevel, ExperienceLevel, MatchWeights } from "./types";

// Weights are a product/policy decision, not a technical one — tune here.
// Must sum to 1; scoring.ts asserts this in dev. The combined
// disability-related budget (disability + accommodationFit + assistiveTechFit)
// stays what it was before assistiveTechFit existed — each archetype's prior
// accommodationFit value is simply split into two numbers that sum back to
// it, so every vector keeps summing to 1.0 by construction.
//
// `assessment` (the one-time platform-wide MCQ score) was added after the
// other seven were tuned — rather than picking a number for it in isolation,
// every archetype's original seven values are scaled by 0.9 and assessment
// takes the freed-up 0.10, so each vector still sums to 1.0 and every
// criterion's *relative* weight versus the others is unchanged.
export const DEFAULT_WEIGHTS: MatchWeights = {
  disability: 0.135,
  accommodationFit: 0.063,
  assistiveTechFit: 0.027,
  skills: 0.27,
  education: 0.135,
  experience: 0.135,
  location: 0.135,
  assessment: 0.1,
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
    disability: 0.135,
    accommodationFit: 0.081,
    assistiveTechFit: 0.054,
    skills: 0.225,
    education: 0.135,
    experience: 0.09,
    location: 0.18,
    assessment: 0.1,
  },
  // Assistive-tech / communication accommodation-fit matters most — exactly
  // where JAWS/NVDA-type experience is most relevant.
  TOOLING_ACCOMMODATION: {
    disability: 0.135,
    accommodationFit: 0.108,
    assistiveTechFit: 0.072,
    skills: 0.225,
    education: 0.135,
    experience: 0.09,
    location: 0.135,
    assessment: 0.1,
  },
  // Flexible hours/remote matter more; exact field-of-study match matters less.
  FLEXIBILITY: {
    disability: 0.135,
    accommodationFit: 0.117,
    assistiveTechFit: 0.045,
    skills: 0.225,
    education: 0.108,
    experience: 0.09,
    location: 0.18,
    assessment: 0.1,
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

// Max combined weight (out of 1.0) shifted onto accommodationFit +
// assistiveTechFit at 100% severity — split between the two proportionally
// to their existing ratio in the resolved vector, taken proportionally from
// every other criterion so the vector still sums to 1.0.
const MAX_SEVERITY_WEIGHT_SHIFT = 0.08;

// Severity (CandidateDisabilityDetail.severityPercentage, 0-100) is
// per-category, while accommodationNeeds is a flat list — there's no clean
// way to apply severity to an individual accommodation's score. Instead it
// scales how much accommodation/assistive-tech fit counts toward the
// overall match at all: the more significant a candidate's disability, the
// more whether the job actually accommodates it should drive their score,
// relative to criteria like education or location. Bounded and linear, not
// a black box — severity 0 leaves weights untouched, severity 100 shifts
// at most MAX_SEVERITY_WEIGHT_SHIFT combined onto the two criteria.
export function applySeverityAdjustment(
  weights: MatchWeights,
  severityPercentage: number | null | undefined,
): MatchWeights {
  if (!severityPercentage || severityPercentage <= 0) return weights;
  const factor = Math.min(severityPercentage, 100) / 100;
  const shift = MAX_SEVERITY_WEIGHT_SHIFT * factor;

  const accommodationShare =
    weights.accommodationFit / (weights.accommodationFit + weights.assistiveTechFit || 1);
  const accommodationBoost = shift * accommodationShare;
  const assistiveTechBoost = shift - accommodationBoost;

  const otherKeys = (Object.keys(weights) as (keyof MatchWeights)[]).filter(
    (key) => key !== "accommodationFit" && key !== "assistiveTechFit",
  );
  const otherSum = otherKeys.reduce((sum, key) => sum + weights[key], 0);

  const adjusted: MatchWeights = { ...weights };
  adjusted.accommodationFit += accommodationBoost;
  adjusted.assistiveTechFit += assistiveTechBoost;
  for (const key of otherKeys) {
    adjusted[key] -= shift * (weights[key] / otherSum);
  }
  return adjusted;
}

// A job only becomes visible to a candidate (and vice versa, in the
// hiring-manager "matched candidates" view) once its score clears this bar.
export const MATCH_THRESHOLD = 60;

// Distance (km) at which scoreLocation's proximity credit decays to zero —
// linear falloff, full credit at 0km. 300km roughly covers "same metro
// area or a realistic commute/relocation radius" vs. "different city
// entirely" for the Indian city set in geo.ts; tune here, not in scoring.ts.
export const MAX_LOCATION_DISTANCE_KM = 300;

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
