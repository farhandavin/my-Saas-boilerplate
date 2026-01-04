/**
 * Circuit Breaker Pattern
 * 
 * Provides resilience for external API calls (Stripe, AI, Email)
 * - Prevents cascade failures when external services are down
 * - Allows graceful degradation
 * - Auto-recovery when service becomes available
 */

interface CircuitBreakerState {
    failures: number;
    lastFailure: number;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

interface CircuitBreakerConfig {
    failureThreshold: number;    // Number of failures before opening
    resetTimeoutMs: number;      // Time before trying again
    successThreshold: number;    // Successes needed to close circuit
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeoutMs: 30000, // 30 seconds
    successThreshold: 2,
};

// In-memory circuit state (per service)
const circuitStates = new Map<string, CircuitBreakerState>();

/**
 * Get or create circuit state for a service
 */
function getCircuitState(serviceName: string): CircuitBreakerState {
    if (!circuitStates.has(serviceName)) {
        circuitStates.set(serviceName, {
            failures: 0,
            lastFailure: 0,
            state: 'CLOSED',
        });
    }
    return circuitStates.get(serviceName)!;
}

/**
 * Execute function with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
    serviceName: string,
    fn: () => Promise<T>,
    fallback?: () => T | Promise<T>,
    config: Partial<CircuitBreakerConfig> = {}
): Promise<T> {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const state = getCircuitState(serviceName);
    const now = Date.now();

    // Check if circuit is open
    if (state.state === 'OPEN') {
        // Check if enough time has passed to try again
        if (now - state.lastFailure >= cfg.resetTimeoutMs) {
            state.state = 'HALF_OPEN';
        } else {
            // Circuit still open - use fallback or throw
            if (fallback) {
                return fallback();
            }
            throw new Error(`Circuit breaker OPEN for ${serviceName}. Service temporarily unavailable.`);
        }
    }

    try {
        const result = await fn();

        // Success - update state
        if (state.state === 'HALF_OPEN') {
            state.failures = 0;
            state.state = 'CLOSED';
        }

        return result;
    } catch (error) {
        // Failure - update state
        state.failures++;
        state.lastFailure = now;

        if (state.failures >= cfg.failureThreshold) {
            state.state = 'OPEN';
            console.error(`[CircuitBreaker] ${serviceName} circuit OPENED after ${state.failures} failures`);
        }

        // Use fallback if available
        if (fallback) {
            console.warn(`[CircuitBreaker] ${serviceName} failed, using fallback`);
            return fallback();
        }

        throw error;
    }
}

/**
 * Reset circuit breaker for a service
 */
export function resetCircuitBreaker(serviceName: string): void {
    circuitStates.delete(serviceName);
}

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus(serviceName: string): CircuitBreakerState | null {
    return circuitStates.get(serviceName) || null;
}

/**
 * Get all circuit breaker statuses
 */
export function getAllCircuitBreakerStatuses(): Record<string, CircuitBreakerState> {
    const result: Record<string, CircuitBreakerState> = {};
    circuitStates.forEach((state, name) => {
        result[name] = { ...state };
    });
    return result;
}

// Pre-defined service names for consistency
export const SERVICES = {
    STRIPE: 'stripe',
    GEMINI_AI: 'gemini-ai',
    RESEND_EMAIL: 'resend-email',
    UPSTASH_REDIS: 'upstash-redis',
} as const;

/**
 * Retry function with exponential backoff
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt < maxRetries) {
                // Exponential backoff with jitter
                const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Combine circuit breaker with retry for maximum resilience
 */
export async function withResilientCall<T>(
    serviceName: string,
    fn: () => Promise<T>,
    options: {
        fallback?: () => T | Promise<T>;
        maxRetries?: number;
        circuitConfig?: Partial<CircuitBreakerConfig>;
    } = {}
): Promise<T> {
    return withCircuitBreaker(
        serviceName,
        () => withRetry(fn, options.maxRetries ?? 3),
        options.fallback,
        options.circuitConfig
    );
}
