import { Queue } from "bullmq";
import { getRedisConnection } from "./connection";

export const MATCHING_QUEUE_NAME = "matching";

export type MatchingJobData =
  | { type: "job-posted"; jobId: string }
  | { type: "candidate-profile-updated"; candidateProfileId: string };

let queue: Queue<MatchingJobData> | undefined;

function getQueue(): Queue<MatchingJobData> {
  if (!queue) {
    queue = new Queue<MatchingJobData>(MATCHING_QUEUE_NAME, { connection: getRedisConnection() });
  }
  return queue;
}

// Called from the job-posting API right after the Job row is saved, and from
// the candidate-profile API right after a substantial edit. Both return
// immediately — actual scoring happens in the worker (see src/worker).
export async function enqueueMatchingJob(data: MatchingJobData): Promise<void> {
  await getQueue().add(data.type, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  });
}
