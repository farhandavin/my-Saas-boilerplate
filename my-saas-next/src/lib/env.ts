/**
 * Safe Environment Accessor for Edge Runtime
 * 
 * This file avoids importing Zod or heavy validation logic to ensure
 * lightweight execution in Middleware and Edge functions.
 */

export const safeEnv = {
    // Public keys are safe to access anywhere
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    // Auth - Critical for Middleware
    // Note: In Edge, we trust the deployment platform to provide these.
    // We do NOT validate them here to avoid crashing if one is missing during a cold start
    // (validation happens in instrumentation.ts or during build)
    AUTH_SECRET: process.env.AUTH_SECRET,

    // Feature Flags (derived)
    isProduction: process.env.NODE_ENV === 'production',
    isStripeEnabled: !!process.env.STRIPE_SECRET_KEY,
    isAIEnabled: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
};

// No-op for Edge compatibility if accidentally imported
export function validateEnv() {
    // This function is deprecated in favor of @/lib/env.server.ts
    // We leave it here as a no-op just in case, or to log a warning.
    if (process.env.NODE_ENV !== 'production') {
        console.warn("⚠️  Warning: strict `validateEnv` called from Edge-safe module. Use `@/lib/env.server` for validation.");
    }
    return true;
}
