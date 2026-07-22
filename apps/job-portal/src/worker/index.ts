import { Worker } from "bullmq";
import { getRedisConnection } from "@/lib/queue/connection";
import { MATCHING_QUEUE_NAME, type MatchingJobData } from "@/lib/queue/matching-queue";
import { runMatchingForCandidate, runMatchingForJob } from "@/lib/matching/run";

// Standalone process — run with `pnpm --filter job-portal worker`, separate
// from the Next.js server. Matching never runs inside a request/response
// cycle (see the "job-posted" / "candidate-profile-updated" API routes,
// which only enqueue).
const worker = new Worker<MatchingJobData>(
  MATCHING_QUEUE_NAME,
  async (job) => {
    if (job.data.type === "job-posted") {
      return runMatchingForJob(job.data.jobId);
    }
    return runMatchingForCandidate(job.data.candidateProfileId);
  },
  { connection: getRedisConnection(), concurrency: 4 },
);

worker.on("failed", (job, error) => {
  console.error(JSON.stringify({ event: "matching_job_failed", jobId: job?.id, error: error.message }));
});

console.log(`Matching worker listening on queue "${MATCHING_QUEUE_NAME}"`);
