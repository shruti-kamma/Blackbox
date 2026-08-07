import { EDUCATION_RANK, EXPERIENCE_RANK } from "@blackbox/matching-engine";

export interface AtsScoreCandidate {
  skills: string[];
  education: { level: keyof typeof EDUCATION_RANK }[];
  experienceLevel: keyof typeof EXPERIENCE_RANK | null;
}

export interface AtsScoreJob {
  requiredSkills: string[];
  requiredEducationLevel: keyof typeof EDUCATION_RANK | null;
  requiredExperienceLevel: keyof typeof EXPERIENCE_RANK | null;
}

export interface AtsScoreResult {
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  educationMet: boolean;
  experienceMet: boolean;
}

function normalize(skill: string): string {
  return skill.trim().toLowerCase();
}

// Job-fit ATS score: how well this candidate's structured profile matches a
// specific posting's requirements, framed the way a real ATS keyword filter
// actually works — required-skill coverage drives the headline number,
// education/experience are separate met/not-met flags rather than blended
// into one score, since ATS systems typically hard-filter on those instead
// of weighting them continuously.
export function computeAtsScore(candidate: AtsScoreCandidate, job: AtsScoreJob): AtsScoreResult {
  const candidateSkillSet = new Set(candidate.skills.map(normalize));
  const matchedSkills = job.requiredSkills.filter((skill) => candidateSkillSet.has(normalize(skill)));
  const missingSkills = job.requiredSkills.filter((skill) => !candidateSkillSet.has(normalize(skill)));
  const overallScore =
    job.requiredSkills.length === 0 ? 100 : Math.round((matchedSkills.length / job.requiredSkills.length) * 100);

  const educationMet =
    !job.requiredEducationLevel ||
    candidate.education.some((edu) => EDUCATION_RANK[edu.level] >= EDUCATION_RANK[job.requiredEducationLevel!]);

  const experienceMet =
    !job.requiredExperienceLevel ||
    (candidate.experienceLevel !== null &&
      EXPERIENCE_RANK[candidate.experienceLevel] >= EXPERIENCE_RANK[job.requiredExperienceLevel]);

  return { overallScore, matchedSkills, missingSkills, educationMet, experienceMet };
}
