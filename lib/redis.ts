import Redis from "ioredis";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  throw new Error("REDIS_URL is not set");
};

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

const createRedis = () =>
  new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    connectTimeout: 10_000,
    keepAlive: 10_000,
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    },
  });

export const redis = globalThis.__redis ?? createRedis();

if (process.env.NODE_ENV !== "production") {
  globalThis.__redis = redis;
}

redis.on("error", (err) => {
  console.error("Redis error", err);
});
