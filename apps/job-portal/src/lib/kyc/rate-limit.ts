import { getRedisConnection } from "@/lib/queue/connection";

const MAX_SENDS = 3;
const WINDOW_SECONDS = 10 * 60;

// Redis INCR+EXPIRE counter, keyed per user+channel. Returns true if the
// send is allowed (and counts it); false if the caller has hit the cap for
// this window.
export async function checkAndConsumeSendRateLimit(userId: string, channel: string): Promise<boolean> {
  const redis = getRedisConnection();
  const key = `kyc:send:${userId}:${channel}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  return count <= MAX_SENDS;
}
