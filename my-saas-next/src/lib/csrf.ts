/**
 * CSRF Protection Utility
 * 
 * Provides CSRF token generation and validation for state-changing API endpoints.
 * Uses the Double Submit Cookie pattern for protection.
 */

import { NextRequest, NextResponse } from 'next/server';

// CSRF Configuration
const CSRF_COOKIE_NAME = '__Host-csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Validate CSRF token from request
 * Uses Double Submit Cookie pattern
 * Returns true if valid, false otherwise
 */
export function validateCsrfToken(req: NextRequest): boolean {
    const csrfCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value;
    const csrfHeader = req.headers.get(CSRF_HEADER_NAME);

    if (!csrfCookie || !csrfHeader) {
        return false;
    }

    // Double submit pattern: header token should match cookie token
    return csrfCookie === csrfHeader;
}

/**
 * CSRF Protection Middleware for API Routes
 * 
 * Usage in API route:
 * ```typescript
 * import { withCsrfProtection } from '@/lib/csrf';
 * 
 * export async function POST(req: NextRequest) {
 *   const csrfError = withCsrfProtection(req);
 *   if (csrfError) return csrfError;
 *   
 *   // Your handler logic
 * }
 * ```
 */
export function withCsrfProtection(req: NextRequest): NextResponse | null {
    // Skip CSRF check for:
    // 1. Webhook endpoints (they use their own signature verification)
    // 2. OAuth callbacks
    // 3. Non-mutating requests (GET, HEAD, OPTIONS)

    const pathname = new URL(req.url).pathname;
    const method = req.method.toUpperCase();

    // Skip for webhooks and callbacks
    if (pathname.includes('/webhooks/') || pathname.includes('/callback')) {
        return null;
    }

    // Skip for non-mutating methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return null;
    }

    // Validate CSRF token
    if (!validateCsrfToken(req)) {
        return NextResponse.json(
            { error: 'Invalid or missing CSRF token' },
            { status: 403 }
        );
    }

    return null; // Valid - continue with request
}

/**
 * Helper to create response with CSRF token cookie
 */
export function createCsrfResponse(
    data: Record<string, unknown>,
    status: number = 200
): NextResponse {
    const response = NextResponse.json(data, { status });

    // Generate a new CSRF token
    const token = crypto.randomUUID();

    response.cookies.set(CSRF_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    });

    // Also include token in response body for client to use
    const body = { ...data, _csrfToken: token };

    return NextResponse.json(body, { status });
}

export { CSRF_HEADER_NAME, CSRF_COOKIE_NAME };
