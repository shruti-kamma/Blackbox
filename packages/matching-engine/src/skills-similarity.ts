// Extension point: skills matching is the piece most likely to benefit from
// semantic similarity later (e.g. "React" vs "Frontend development" vs a
// candidate's résumé text) instead of exact-name overlap. Any implementation
// of this interface — including a future embedding/LLM-based one — can be
// passed into scoreCandidateAgainstJob without touching the rest of the
// scoring pipeline. No external API is wired up here; see the matching-agent
// service README for the intended future direction, and confirm with the
// team before adding a real LLM/embedding call.
export interface SkillsSimilarity {
  /** Returns a 0..1 coverage score for how well candidateSkills satisfy requiredSkills. */
  score(candidateSkills: string[], requiredSkills: string[]): number;
}

function normalize(skill: string): string {
  return skill.trim().toLowerCase();
}

// Rule-based default: fraction of the job's required skills the candidate
// has (exact, case-insensitive name match). Recall-oriented against the
// job's requirements, which is what "skills overlap" means from a job's
// point of view. A job with no required skills imposes no constraint.
export const exactMatchSkillsSimilarity: SkillsSimilarity = {
  score(candidateSkills, requiredSkills) {
    if (requiredSkills.length === 0) return 1;
    const candidateSet = new Set(candidateSkills.map(normalize));
    const matched = requiredSkills.filter((skill) => candidateSet.has(normalize(skill)));
    return matched.length / requiredSkills.length;
  },
};
