import { z } from 'zod';

const envSchema = z.object({
    // Database - REQUIRED
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // Authentication - REQUIRED
    AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
    // AUTH_URL: z.string().optional(), // Optional in Vercel

    // App Settings
    NEXT_PUBLIC_APP_URL: z.string().min(1).default('http://localhost:3000'),
    NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(1).default('localhost:3000'),

    // Stripe - OPTIONAL (graceful degradation without billing)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

    // AI & Privacy - OPTIONAL (graceful degradation without AI)
    GEMINI_API_KEY: z.string().optional(),
    PII_MASKING_ENABLED: z.string().default('true'),

    // Security - OPTIONAL (uses default in dev)
    CRON_SECRET: z.string().min(16).optional(),

    // Rate Limiting - OPTIONAL (graceful degradation without rate limiting)
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // Node
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Validate process.env
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsedEnv.error.flatten().fieldErrors, null, 2));
    throw new Error('Invalid environment configuration');
}

export const env = parsedEnv.data;
