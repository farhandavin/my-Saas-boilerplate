import { validateEnv } from '@/lib/env-validator';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validate environment variables on startup
    validateEnv();

    await import('./sentry.server.config');
    await import('./otel.node');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
