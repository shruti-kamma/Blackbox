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

export type AccommodationType =
  | "SCREEN_READER_SUPPORT"
  | "SIGN_LANGUAGE_INTERPRETER"
  | "CAPTIONING"
  | "WHEELCHAIR_ACCESSIBLE_WORKSPACE"
  | "ASSISTIVE_TECHNOLOGY_STIPEND"
  | "FLEXIBLE_HOURS"
  | "REMOTE_FRIENDLY"
  | "ERGONOMIC_WORKSTATION"
  | "ACCESSIBLE_TRANSPORTATION"
  | "EXTENDED_BREAKS"
  | "JOB_COACH_SUPPORT"
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
  accommodationNeeds: AccommodationType[];
  assistiveTechnologies: string[]; // specific device/software names, e.g. "JAWS"
  experienceLevel?: ExperienceLevel | null;
  preferredLocations: string[];
  openToRemote: boolean;
  education: CandidateEducation[];
  skills: string[]; // skill names
  // Highest severityPercentage (0-100) across the candidate's disability
  // categories, if any are on file. Used to weight how much accommodation
  // availability should matter in the overall score — not read by any
  // single scoring function, see applySeverityAdjustment in constants.ts.
  maxDisabilitySeverity?: number | null;
  // 0-100 score on the one-time platform-wide MCQ assessment, or null if the
  // candidate hasn't completed it yet — matches get computed continuously
  // regardless of assessment status, so this is commonly null early on. See
  // scoreAssessment in scoring.ts for how null is handled (partial credit,
  // not a penalty).
  assessmentScore?: number | null;
}

export interface JobForMatching {
  id: string;
  targetDisabilityCategories: DisabilityCategory[]; // empty = open to all
  accommodationTypes: AccommodationType[];
  preferredAssistiveTechnologies: string[]; // specific device/software names
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
  accommodationFit: CriterionResult;
  assistiveTechFit: CriterionResult;
  skills: CriterionResult;
  education: CriterionResult;
  experience: CriterionResult;
  location: CriterionResult;
  assessment: CriterionResult;
}

export interface MatchResult {
  score: number; // 0..100
  breakdown: MatchBreakdown;
  isMatch: boolean;
}

export interface MatchWeights {
  disability: number;
  accommodationFit: number;
  assistiveTechFit: number;
  skills: number;
  education: number;
  experience: number;
  location: number;
  assessment: number;
}
