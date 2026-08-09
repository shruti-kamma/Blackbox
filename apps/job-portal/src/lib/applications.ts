import { prisma } from "@/lib/db";

export class NotMatchedError extends Error {
  constructor() {
    super("You can only apply to jobs matched to your profile");
    this.name = "NotMatchedError";
  }
}

// Does this candidate have every skill the employer marked essential for a
// job offering the guaranteed-interview commitment? Vacuously true if the
// employer opted in but named no essential skills — no stated bar means the
// guarantee already covers anyone matched, see JobSkill.essential.
async function computeMetEssentialCriteria(jobId: string, candidateId: string): Promise<boolean> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      offersGuaranteedInterview: true,
      requiredSkills: { where: { essential: true }, select: { skill: { select: { name: true } } } },
    },
  });
  if (!job?.offersGuaranteedInterview) return false;
  if (job.requiredSkills.length === 0) return true;

  const candidateSkills = await prisma.candidateSkill.findMany({
    where: { candidateProfileId: candidateId },
    select: { skill: { select: { name: true } } },
  });
  const candidateSkillNames = new Set(candidateSkills.map((s) => s.skill.name.toLowerCase()));
  return job.requiredSkills.every((s) => candidateSkillNames.has(s.skill.name.toLowerCase()));
}

export async function createApplicationFromMatch(input: { jobId: string; candidateId: string; coverNote?: string }) {
  const match = await prisma.match.findUnique({
    where: { jobId_candidateId: { jobId: input.jobId, candidateId: input.candidateId } },
  });
  if (!match) {
    throw new NotMatchedError();
  }

  const metEssentialCriteria = await computeMetEssentialCriteria(input.jobId, input.candidateId);

  return prisma.application.upsert({
    where: { jobId_candidateId: { jobId: input.jobId, candidateId: input.candidateId } },
    create: {
      jobId: input.jobId,
      candidateId: input.candidateId,
      coverNote: input.coverNote || null,
      matchScore: match.score,
      metEssentialCriteria,
    },
    update: {},
  });
}
