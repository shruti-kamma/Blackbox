import type { CandidateForMatching, JobForMatching } from "@blackbox/matching-engine";
import type { Prisma } from "@blackbox/db";

export const candidateMatchingInclude = {
  education: { select: { level: true, fieldOfStudy: true } },
  skills: { select: { skill: { select: { name: true } } } },
  assistiveTechnologies: { select: { assistiveTechnology: { select: { name: true } } } },
} satisfies Prisma.CandidateProfileInclude;

export type CandidateForMatchingRow = Prisma.CandidateProfileGetPayload<{
  include: typeof candidateMatchingInclude;
}>;

export function toCandidateForMatching(candidate: CandidateForMatchingRow): CandidateForMatching {
  return {
    id: candidate.id,
    disabilityCategories: candidate.disabilityCategories as CandidateForMatching["disabilityCategories"],
    accommodationNeeds: candidate.accommodationNeeds as CandidateForMatching["accommodationNeeds"],
    assistiveTechnologies: candidate.assistiveTechnologies.map((a) => a.assistiveTechnology.name),
    experienceLevel: candidate.experienceLevel as CandidateForMatching["experienceLevel"],
    preferredLocations: candidate.preferredLocations,
    openToRemote: candidate.openToRemote,
    education: candidate.education.map((edu) => ({
      level: edu.level as CandidateForMatching["education"][number]["level"],
      fieldOfStudy: edu.fieldOfStudy,
    })),
    skills: candidate.skills.map((s) => s.skill.name),
  };
}

export const jobMatchingInclude = {
  requiredSkills: { select: { skill: { select: { name: true } } } },
  preferredAssistiveTechnologies: { select: { assistiveTechnology: { select: { name: true } } } },
} satisfies Prisma.JobInclude;

export type JobForMatchingRow = Prisma.JobGetPayload<{ include: typeof jobMatchingInclude }>;

export function toJobForMatching(job: JobForMatchingRow): JobForMatching {
  return {
    id: job.id,
    targetDisabilityCategories: job.targetDisabilityCategories as JobForMatching["targetDisabilityCategories"],
    accommodationTypes: job.accommodationTypes as JobForMatching["accommodationTypes"],
    preferredAssistiveTechnologies: job.preferredAssistiveTechnologies.map((a) => a.assistiveTechnology.name),
    requiredEducationLevel: job.requiredEducationLevel as JobForMatching["requiredEducationLevel"],
    requiredEducationField: job.requiredEducationField,
    requiredExperienceLevel: job.requiredExperienceLevel as JobForMatching["requiredExperienceLevel"],
    requiredSkills: job.requiredSkills.map((s) => s.skill.name),
    location: job.location,
    remote: job.remote,
  };
}
