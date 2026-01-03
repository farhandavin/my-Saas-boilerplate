import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash Redis env vars are set
const isRedisConfigured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Create a new ratelimiter
export const ratelimit = isRedisConfigured
  ? new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "10 s"),
    analytics: true,
    prefix: "@enterprise-os/ratelimit",
  })
  : {
    // Mock limiter for development/when no Redis provided
    limit: async () => ({ success: true, limit: 100, remaining: 99, reset: 0 }),
    blockUntilReady: async () => { },
  } as unknown as Ratelimit;

