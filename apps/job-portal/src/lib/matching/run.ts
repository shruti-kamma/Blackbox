import { scoreCandidateAgainstJob } from "@blackbox/matching-engine";
import type { DisabilityCategory, Prisma } from "@blackbox/db";
import { prisma } from "@/lib/db";
import {
  candidateMatchingInclude,
  jobMatchingInclude,
  toCandidateForMatching,
  toJobForMatching,
} from "./adapters";

const BATCH_SIZE = 500;

export interface MatchingRunSummary {
  scanned: number;
  matched: number;
  durationMs: number;
}

// Stage 1 of 2: a cheap, indexed prefilter down to a plausible subset. This
// is intentionally approximate — it narrows on disability-category overlap
// (GIN-indexed) and location/remote plausibility (also GIN-indexed), the two
// dimensions cheapest to check in SQL, so a job posting doesn't trigger a
// full-table scan of the candidate pool. Because both dimensions must look
// plausible (AND, not OR), there's a narrow theoretical edge case it can
// miss: a candidate scoring exactly 0 on *both* disability and location but
// a perfect 100% on skills+education+experience would land exactly at the
// 60-point threshold and get excluded here before stage 2 ever scores them.
// Accepted tradeoff for scanning hundreds of thousands of candidates — see
// the final summary for the full writeup.
function candidatePrefilterWhere(job: {
  targetDisabilityCategories: DisabilityCategory[];
  remote: boolean;
  location: string | null;
}): Prisma.CandidateProfileWhereInput {
  const disabilityFilter: Prisma.CandidateProfileWhereInput =
    job.targetDisabilityCategories.length === 0
      ? {}
      : { disabilityCategories: { hasSome: job.targetDisabilityCategories } };

  const locationFilter: Prisma.CandidateProfileWhereInput = job.remote
    ? {}
    : job.location
      ? {
          OR: [
            { openToRemote: true },
            { preferredLocations: { has: job.location } },
            { preferredLocations: { isEmpty: true } },
          ],
        }
      : {};

  return { AND: [disabilityFilter, locationFilter] };
}

function jobPrefilterWhere(candidate: {
  disabilityCategories: DisabilityCategory[];
  openToRemote: boolean;
  preferredLocations: string[];
}): Prisma.JobWhereInput {
  const disabilityFilter: Prisma.JobWhereInput =
    candidate.disabilityCategories.length === 0
      ? { targetDisabilityCategories: { isEmpty: true } }
      : {
          OR: [
            { targetDisabilityCategories: { hasSome: candidate.disabilityCategories } },
            { targetDisabilityCategories: { isEmpty: true } },
          ],
        };

  const locationFilter: Prisma.JobWhereInput = candidate.openToRemote
    ? {}
    : candidate.preferredLocations.length > 0
      ? { OR: [{ remote: true }, { location: { in: candidate.preferredLocations } }] }
      : {};

  return { isOpen: true, AND: [disabilityFilter, locationFilter] };
}

// Runs when a hiring manager posts a new job: scores it against the
// currently plausible subset of candidates, batched/paginated so the whole
// candidate table is never loaded into memory at once, and stores any match
// clearing the threshold. Never invoked synchronously from the create-job
// request — see src/lib/queue and src/worker.
export async function runMatchingForJob(jobId: string): Promise<MatchingRunSummary> {
  const start = Date.now();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId }, include: jobMatchingInclude });
  const jobForMatching = toJobForMatching(job);
  const where = candidatePrefilterWhere(job);

  let scanned = 0;
  let matched = 0;
  let cursor: string | undefined;

  while (true) {
    const batch = await prisma.candidateProfile.findMany({
      where,
      include: candidateMatchingInclude,
      take: BATCH_SIZE,
      orderBy: { id: "asc" },
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    if (batch.length === 0) break;
    scanned += batch.length;
    cursor = batch[batch.length - 1]!.id;

    const userIdByCandidateId = new Map(batch.map((c) => [c.id, c.userId]));
    const toCreate: Prisma.MatchCreateManyInput[] = [];

    for (const candidate of batch) {
      const result = scoreCandidateAgainstJob(toCandidateForMatching(candidate), jobForMatching);
      if (result.isMatch) {
        toCreate.push({
          candidateId: candidate.id,
          jobId,
          score: result.score,
          breakdown: result.breakdown as unknown as Prisma.InputJsonValue,
        });
      }
    }

    if (toCreate.length > 0) {
      await prisma.match.createMany({ data: toCreate, skipDuplicates: true });
      const fresh = await prisma.match.findMany({
        where: { jobId, candidateId: { in: toCreate.map((m) => m.candidateId) }, notifiedAt: null },
        select: { id: true, candidateId: true, score: true },
      });
      if (fresh.length > 0) {
        await prisma.$transaction([
          prisma.notification.createMany({
            data: fresh.map((m) => ({
              userId: userIdByCandidateId.get(m.candidateId)!,
              type: "NEW_MATCH" as const,
              payload: { jobId, matchId: m.id, score: m.score },
            })),
          }),
          prisma.match.updateMany({
            where: { id: { in: fresh.map((m) => m.id) } },
            data: { notifiedAt: new Date() },
          }),
        ]);
        matched += fresh.length;
      }
    }

    if (batch.length < BATCH_SIZE) break;
  }

  const durationMs = Date.now() - start;
  console.log(
    JSON.stringify({ event: "matching_run", trigger: "job-posted", jobId, scanned, matched, durationMs }),
  );
  return { scanned, matched, durationMs };
}

// Runs when a candidate substantially edits their profile: re-scores against
// currently open jobs so they don't miss postings that predate the edit.
// Existing matches are updated in place (score/breakdown refreshed); a match
// that no longer clears the threshold is left as-is rather than deleted, so
// a job the candidate has already viewed or applied to doesn't vanish from
// their history — see the final summary for this tradeoff.
export async function runMatchingForCandidate(candidateProfileId: string): Promise<MatchingRunSummary> {
  const start = Date.now();
  const candidate = await prisma.candidateProfile.findUniqueOrThrow({
    where: { id: candidateProfileId },
    include: candidateMatchingInclude,
  });
  const candidateForMatching = toCandidateForMatching(candidate);
  const where = jobPrefilterWhere(candidate);

  let scanned = 0;
  let matched = 0;
  let cursor: string | undefined;

  while (true) {
    const batch = await prisma.job.findMany({
      where,
      include: jobMatchingInclude,
      take: BATCH_SIZE,
      orderBy: { id: "asc" },
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    if (batch.length === 0) break;
    scanned += batch.length;
    cursor = batch[batch.length - 1]!.id;

    const existing = await prisma.match.findMany({
      where: { candidateId: candidate.id, jobId: { in: batch.map((j) => j.id) } },
      select: { jobId: true },
    });
    const existingJobIds = new Set(existing.map((m) => m.jobId));

    for (const job of batch) {
      const result = scoreCandidateAgainstJob(candidateForMatching, toJobForMatching(job));
      if (!result.isMatch) continue;

      const wasNew = !existingJobIds.has(job.id);
      const match = await prisma.match.upsert({
        where: { jobId_candidateId: { jobId: job.id, candidateId: candidate.id } },
        create: {
          jobId: job.id,
          candidateId: candidate.id,
          score: result.score,
          breakdown: result.breakdown as unknown as Prisma.InputJsonValue,
        },
        update: {
          score: result.score,
          breakdown: result.breakdown as unknown as Prisma.InputJsonValue,
          matchedAt: new Date(),
        },
      });

      if (wasNew) {
        await prisma.$transaction([
          prisma.notification.create({
            data: {
              userId: candidate.userId,
              type: "NEW_MATCH",
              payload: { jobId: job.id, matchId: match.id, score: match.score },
            },
          }),
          prisma.match.update({ where: { id: match.id }, data: { notifiedAt: new Date() } }),
        ]);
        matched += 1;
      }
    }

    if (batch.length < BATCH_SIZE) break;
  }

  const durationMs = Date.now() - start;
  console.log(
    JSON.stringify({
      event: "matching_run",
      trigger: "candidate-profile-updated",
      candidateProfileId,
      scanned,
      matched,
      durationMs,
    }),
  );
  return { scanned, matched, durationMs };
}
