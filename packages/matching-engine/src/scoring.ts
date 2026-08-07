import { EDUCATION_RANK, EXPERIENCE_RANK, MATCH_THRESHOLD, resolveWeightsForCandidate } from "./constants";
import { exactMatchSkillsSimilarity, type SkillsSimilarity } from "./skills-similarity";
import type {
  CandidateForMatching,
  CriterionResult,
  JobForMatching,
  MatchResult,
  MatchWeights,
} from "./types";

export interface ScoreOptions {
  weights?: MatchWeights;
  threshold?: number;
  skillsSimilarity?: SkillsSimilarity;
}

function criterion(score: number, weight: number, reason: string): CriterionResult {
  const clamped = Math.max(0, Math.min(1, score));
  return { score: clamped, weight, contribution: clamped * weight, reason };
}

// Open to all (empty target list) or an explicit overlap with the
// candidate's disability categories. Binary today; a candidate whose
// disabilityOther free text happens to describe a targeted-but-uncategorized
// condition won't be credited here — see TODOs in the final summary.
function scoreDisability(
  candidate: CandidateForMatching,
  job: JobForMatching,
  weight: number,
): CriterionResult {
  if (job.targetDisabilityCategories.length === 0) {
    return criterion(1, weight, "Job is open to all disability categories");
  }
  const overlap = candidate.disabilityCategories.filter((c) =>
    job.targetDisabilityCategories.includes(c),
  );
  if (overlap.length > 0) {
    return criterion(1, weight, `Matches targeted categories: ${overlap.join(", ")}`);
  }
  return criterion(
    0,
    weight,
    `Candidate's categories (${candidate.disabilityCategories.join(", ") || "none listed"}) don't overlap with job's targeted categories (${job.targetDisabilityCategories.join(", ")})`,
  );
}

// Coverage of the *candidate's* needs by the *job's* offerings — the
// inverse direction of scoreSkills (which covers the job's requirements by
// the candidate). AccommodationType is a closed enum, so exact-set overlap
// is precise here; no pluggable-similarity extension point needed the way
// skills has one for free-text names.
function scoreAccommodationFit(
  candidate: CandidateForMatching,
  job: JobForMatching,
  weight: number,
): CriterionResult {
  if (candidate.accommodationNeeds.length === 0) {
    return criterion(1, weight, "Candidate hasn't specified accommodation needs");
  }
  const offered = new Set(job.accommodationTypes);
  const covered = candidate.accommodationNeeds.filter((need) => offered.has(need));
  const score = covered.length / candidate.accommodationNeeds.length;
  const pct = Math.round(score * 100);
  return criterion(score, weight, `Job offers ${pct}% of the candidate's specified accommodations`);
}

// Same direction as scoreSkills (coverage of the *job's* preferred list by
// the *candidate*), not accommodationFit's inverted direction — a job
// optionally lists assistive technology it'd value experience with, and this
// asks how much of that the candidate already has. Exact, case-insensitive
// name match for now, same starting point exactMatchSkillsSimilarity had
// before skills needed a pluggable interface — revisit if "JAWS" vs "JAWS
// screen reader" naming variance turns out to matter in practice.
function scoreAssistiveTechFit(
  candidate: CandidateForMatching,
  job: JobForMatching,
  weight: number,
): CriterionResult {
  if (job.preferredAssistiveTechnologies.length === 0) {
    return criterion(1, weight, "Job specifies no preferred assistive technology");
  }
  const candidateSet = new Set(candidate.assistiveTechnologies.map((t) => t.trim().toLowerCase()));
  const matched = job.preferredAssistiveTechnologies.filter((t) =>
    candidateSet.has(t.trim().toLowerCase()),
  );
  const score = matched.length / job.preferredAssistiveTechnologies.length;
  const pct = Math.round(score * 100);
  return criterion(
    score,
    weight,
    `Candidate has experience with ${pct}% of the job's preferred assistive technology`,
  );
}

function scoreSkills(
  candidate: CandidateForMatching,
  job: JobForMatching,
  weight: number,
  similarity: SkillsSimilarity,
): CriterionResult {
  if (job.requiredSkills.length === 0) {
    return criterion(1, weight, "Job specifies no required skills");
  }
  const score = similarity.score(candidate.skills, job.requiredSkills);
  const pct = Math.round(score * 100);
  return criterion(score, weight, `Candidate covers ${pct}% of the job's required skills`);
}

function scoreEducation(
  candidate: CandidateForMatching,
  job: JobForMatching,
  weight: number,
): CriterionResult {
  if (!job.requiredEducationLevel) {
    return criterion(1, weight, "Job specifies no required education level");
  }
  const requiredRank = EDUCATION_RANK[job.requiredEducationLevel];
  const candidateBest = candidate.education.reduce<{ rank: number; fieldOfStudy?: string | null }>(
    (best, edu) => {
      const rank = EDUCATION_RANK[edu.level];
      return rank > best.rank ? { rank, fieldOfStudy: edu.fieldOfStudy } : best;
    },
    { rank: 0, fieldOfStudy: undefined },
  );

  if (candidateBest.rank === 0) {
    return criterion(0, weight, "Candidate has no education on file");
  }

  const fieldMatches =
    !job.requiredEducationField ||
    (candidateBest.fieldOfStudy ?? "")
      .toLowerCase()
      .includes(job.requiredEducationField.toLowerCase());

  if (candidateBest.rank >= requiredRank) {
    return fieldMatches
      ? criterion(1, weight, "Meets required education level and field")
      : criterion(0.7, weight, "Meets required education level, field of study differs");
  }
  const gap = requiredRank - candidateBest.rank;
  const score = gap === 1 ? 0.3 : 0.1;
  return criterion(score, weight, `Below required education level by ${gap} tier(s)`);
}

function scoreExperience(
  candidate: CandidateForMatching,
  job: JobForMatching,
  weight: number,
): CriterionResult {
  if (!job.requiredExperienceLevel) {
    return criterion(1, weight, "Job specifies no required experience level");
  }
  if (!candidate.experienceLevel) {
    return criterion(0.2, weight, "Candidate has no experience level on file");
  }
  const required = EXPERIENCE_RANK[job.requiredExperienceLevel];
  const actual = EXPERIENCE_RANK[candidate.experienceLevel];

  if (actual === required) return criterion(1, weight, "Experience level matches exactly");
  if (actual > required) return criterion(0.9, weight, "Candidate exceeds required experience level");
  const gap = required - actual;
  const score = gap === 1 ? 0.4 : 0.1;
  return criterion(score, weight, `Below required experience level by ${gap} tier(s)`);
}

function scoreLocation(
  candidate: CandidateForMatching,
  job: JobForMatching,
  weight: number,
): CriterionResult {
  if (job.remote && candidate.openToRemote) {
    return criterion(1, weight, "Remote job and candidate is open to remote work");
  }
  if (job.location) {
    const wants = candidate.preferredLocations.some(
      (loc) => loc.trim().toLowerCase() === job.location!.trim().toLowerCase(),
    );
    if (wants) return criterion(1, weight, `Job location (${job.location}) is a preferred location`);
  }
  if (candidate.preferredLocations.length === 0 && !candidate.openToRemote) {
    return criterion(0.6, weight, "Candidate has no location preference on file");
  }
  return criterion(0, weight, "Job location doesn't match candidate's preferences");
}

export function scoreCandidateAgainstJob(
  candidate: CandidateForMatching,
  job: JobForMatching,
  options: ScoreOptions = {},
): MatchResult {
  const weights = options.weights ?? resolveWeightsForCandidate(candidate.disabilityCategories);
  const threshold = options.threshold ?? MATCH_THRESHOLD;
  const similarity = options.skillsSimilarity ?? exactMatchSkillsSimilarity;

  if (process.env.NODE_ENV !== "production") {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 1e-6) {
      throw new Error(`MatchWeights must sum to 1, got ${sum}`);
    }
  }

  const breakdown = {
    disability: scoreDisability(candidate, job, weights.disability),
    accommodationFit: scoreAccommodationFit(candidate, job, weights.accommodationFit),
    assistiveTechFit: scoreAssistiveTechFit(candidate, job, weights.assistiveTechFit),
    skills: scoreSkills(candidate, job, weights.skills, similarity),
    education: scoreEducation(candidate, job, weights.education),
    experience: scoreExperience(candidate, job, weights.experience),
    location: scoreLocation(candidate, job, weights.location),
  };

  const total = Object.values(breakdown).reduce((sum, c) => sum + c.contribution, 0);
  const score = Math.round(total * 100);

  return { score, breakdown, isMatch: score >= threshold };
}
