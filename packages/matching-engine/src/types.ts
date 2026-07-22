// Deliberately not importing from @prisma/client: this package is the pure,
// DB-agnostic scoring core. The Prisma string-enum values line up with these
// literal unions, so callers on the DB side can pass Prisma rows straight in
// (see apps/job-portal/src/lib/matching/adapters.ts).

export type DisabilityCategory =
  | "VISUAL"
  | "HEARING"
  | "MOBILITY"
  | "COGNITIVE"
  | "SPEECH"
  | "CHRONIC_ILLNESS"
  | "MENTAL_HEALTH"
  | "OTHER";

export type EducationLevel =
  | "HIGH_SCHOOL"
  | "DIPLOMA"
  | "ASSOCIATE"
  | "BACHELORS"
  | "MASTERS"
  | "DOCTORATE"
  | "OTHER";

export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "LEAD";

export interface CandidateEducation {
  level: EducationLevel;
  fieldOfStudy?: string | null;
}

export interface CandidateForMatching {
  id: string;
  disabilityCategories: DisabilityCategory[];
  experienceLevel?: ExperienceLevel | null;
  preferredLocations: string[];
  openToRemote: boolean;
  education: CandidateEducation[];
  skills: string[]; // skill names
}

export interface JobForMatching {
  id: string;
  targetDisabilityCategories: DisabilityCategory[]; // empty = open to all
  requiredEducationLevel?: EducationLevel | null;
  requiredEducationField?: string | null;
  requiredExperienceLevel?: ExperienceLevel | null;
  requiredSkills: string[]; // skill names
  location?: string | null;
  remote: boolean;
}

export interface CriterionResult {
  score: number; // 0..1
  weight: number; // 0..1, this criterion's share of the total
  contribution: number; // score * weight, already scaled 0..1
  reason: string;
}

export interface MatchBreakdown {
  disability: CriterionResult;
  skills: CriterionResult;
  education: CriterionResult;
  experience: CriterionResult;
  location: CriterionResult;
}

export interface MatchResult {
  score: number; // 0..100
  breakdown: MatchBreakdown;
  isMatch: boolean;
}

export interface MatchWeights {
  disability: number;
  skills: number;
  education: number;
  experience: number;
  location: number;
}
