import IORedis from "ioredis";

let connection: IORedis | undefined;

// BullMQ requires maxRetriesPerRequest: null on the connection it's given.
export function getRedisConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379/0", {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}
