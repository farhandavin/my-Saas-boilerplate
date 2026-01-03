
import { Redis } from "@upstash/redis";

const isRedisConfigured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;



export const redis = isRedisConfigured
    ? Redis.fromEnv()
    : null; // Return null if not configured, handle gracefully in services
