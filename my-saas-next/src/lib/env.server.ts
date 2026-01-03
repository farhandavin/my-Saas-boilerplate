import { z } from 'zod';

const envSchema = z.object({
    // --- CRITICAL (App will crash if missing) ---
    DATABASE_URL: z.string().url().min(1, "Database URL is required"),
    AUTH_SECRET: z.string().min(1, "Auth Secret is required"),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

    // --- BILLING (Optional but recommended) ---
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

    // --- AI (Optional) ---
    GEMINI_API_KEY: z.string().optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(), // Fallback

    // --- EMAIL (Optional) ---
    RESEND_API_KEY: z.string().optional(),

    // --- OBSERVABILITY (Optional) ---
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

export function validateEnv() {
    const processEnv = { ...process.env }; // Shallow copy

    const result = envSchema.safeParse(processEnv);

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const missingCritical: string[] = [];
        const missingWarnings: string[] = [];

        // Categorize errors
        Object.entries(errors).forEach(([key, msgs]) => {
            missingCritical.push(`${key}: ${msgs?.[0]}`);
        });

        if (missingCritical.length > 0) {
            console.error("\n❌ CRITICAL: Missing Required Environment Variables:");
            missingCritical.forEach(err => console.error(`   - ${err}`));
            console.error("\nPlease check your .env file.\n");

            if (process.env.NODE_ENV === 'production') {
                process.exit(1);
            }
        }
    }

    // --- LOGIC FOR OPTIONAL FEATURES ---
    const data = result.data || processEnv;
    const warnings: string[] = [];

    // @ts-ignore
    if (!data.STRIPE_SECRET_KEY) warnings.push("⚠️  Billing (Stripe): Disabled (Missing STRIPE_SECRET_KEY)");
    // @ts-ignore
    if (!data.GEMINI_API_KEY && !data.GOOGLE_GENERATIVE_AI_API_KEY) warnings.push("⚠️  AI Services: Disabled (Missing GEMINI_API_KEY)");
    // @ts-ignore
    if (!data.RESEND_API_KEY) warnings.push("⚠️  Email Service: Disabled (Missing RESEND_API_KEY)");

    if (warnings.length > 0) {
        console.warn("\n⚠️  Optional Features Disabled:");
        warnings.forEach(w => console.warn(`   ${w}`));
        console.warn(""); // Newline
    }

    return result.success;
}
