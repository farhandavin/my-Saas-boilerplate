
import { jwtVerify } from 'jose';
import type { UserJwtPayload } from '@/types';

/**
 * Verify JWT token and return typed user payload
 * Returns null if token is invalid or expired
 */
export async function verifyAuth(token: string): Promise<UserJwtPayload | null> {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        // Validate required fields exist
        if (!payload.userId || !payload.teamId || !payload.role) {
            console.warn('[Auth] Invalid JWT payload structure');
            return null;
        }

        return payload as unknown as UserJwtPayload;
    } catch (err) {
        return null;
    }
}
