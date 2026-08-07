import { prisma } from "@/lib/db";

export class NotMatchedError extends Error {
  constructor() {
    super("You can only apply to jobs matched to your profile");
    this.name = "NotMatchedError";
  }
}

// Shared by the plain apply route and the AI-interview submit route — both
// ultimately create the same kind of Application, just gated differently
// beforehand (a Match must exist either way).
export async function createApplicationFromMatch(input: {
  jobId: string;
  candidateId: string;
  coverNote?: string;
  interviewId?: string;
}) {
  const match = await prisma.match.findUnique({
    where: { jobId_candidateId: { jobId: input.jobId, candidateId: input.candidateId } },
  });
  if (!match) {
    throw new NotMatchedError();
  }

  return prisma.application.upsert({
    where: { jobId_candidateId: { jobId: input.jobId, candidateId: input.candidateId } },
    create: {
      jobId: input.jobId,
      candidateId: input.candidateId,
      coverNote: input.coverNote || null,
      matchScore: match.score,
      interviewId: input.interviewId ?? null,
    },
    update: {},
  });
}
