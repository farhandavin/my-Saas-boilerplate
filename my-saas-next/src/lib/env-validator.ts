export interface MissingEnvVar {
    key: string;
    description: string;
    required: boolean;
    fix: string;
}

const REQUIRED_VARS = [
    {
        key: 'DATABASE_URL',
        description: 'PostgreSQL Connection String',
        required: true,
        fix: 'Use Neon (https://neon.tech) free tier or run "npm run docker:up"',
    },
    {
        key: 'AUTH_SECRET',
        description: 'Secret for session encryption',
        required: true,
        fix: 'Run "openssl rand -base64 32" to generate',
    },
    {
        key: 'JWT_SECRET',
        description: 'Secret for JWT signing',
        required: true,
        fix: 'Run "openssl rand -hex 32" to generate',
    },
    {
        key: 'NEXT_PUBLIC_APP_URL',
        description: 'Public URL of the application',
        required: true,
        fix: 'Set to "http://localhost:3000" for local development',
    },
];

const OPTIONAL_VARS = [
    {
        key: 'STRIPE_SECRET_KEY',
        description: 'Stripe Secret Key',
        required: false,
        fix: 'Get from Stripe Dashboard > Developers > API Keys',
    },
    {
        key: 'STRIPE_WEBHOOK_SECRET',
        description: 'Stripe Webhook Signing Secret',
        required: false,
        fix: 'Run "stripe listen" to generate local secret',
    },
    {
        key: 'GEMINI_API_KEY',
        description: 'Google Gemini AI Key',
        required: false,
        fix: 'Get from Google AI Studio (https://aistudio.google.com)',
    },
    {
        key: 'UPSTASH_REDIS_REST_URL',
        description: 'Redis URL for Rate Limiting',
        required: false,
        fix: 'Get from Upstash Console',
    },
];

export function validateEnv() {
    const missingCritical: MissingEnvVar[] = [];
    const missingOptional: MissingEnvVar[] = [];

    // Check Required
    for (const v of REQUIRED_VARS) {
        if (!process.env[v.key]) {
            missingCritical.push(v);
        }
    }

    // Check Optional
    for (const v of OPTIONAL_VARS) {
        if (!process.env[v.key]) {
            missingOptional.push(v);
        }
    }

    // Formatting Output
    if (missingCritical.length > 0 || missingOptional.length > 0) {
        console.log('\n┌────────────────────────────────────────────────────────┐');
        console.log('│ 🛡️  ENVIRONMENT CONFIGURATION CHECK                     │');

        if (missingCritical.length > 0) {
            console.log('├────────────────────────────────────────────────────────┤');
            console.log('│ ❌ CRITICAL MISSING VARIABLES (App will crash)          │');
            missingCritical.forEach(v => {
                console.log(`│    • ${v.key.padEnd(20)} ${v.description}`);
                console.log(`│      Fix: ${v.fix}`);
            });
        }

        if (missingOptional.length > 0) {
            console.log('├────────────────────────────────────────────────────────┤');
            console.log('│ ⚠️  OPTIONAL MISSING VARIABLES (Features disabled)      │');
            missingOptional.forEach(v => {
                console.log(`│    • ${v.key.padEnd(20)} ${v.description}`);
                console.log(`│      Fix: ${v.fix}`);
            });
        }

        console.log('└────────────────────────────────────────────────────────┘\n');
    }
}
