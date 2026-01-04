/**
 * CSRF Token API Endpoint
 * 
 * GET /api/csrf - Returns a CSRF token for use in subsequent requests
 * 
 * Usage:
 * 1. Call this endpoint to get a token
 * 2. Include the token in the x-csrf-token header for POST/PUT/DELETE requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { CSRF_COOKIE_NAME } from '@/lib/csrf';

export async function GET(req: NextRequest) {
    // Generate a new CSRF token
    const token = crypto.randomUUID();

    const response = NextResponse.json({
        success: true,
        csrfToken: token,
        message: 'Include this token in the x-csrf-token header for state-changing requests'
    });

    // Set the CSRF cookie
    response.cookies.set(CSRF_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
}
