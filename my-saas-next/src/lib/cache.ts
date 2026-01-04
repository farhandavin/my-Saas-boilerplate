/**
 * Redis Cache Utility
 * 
 * Provides caching layer for frequently accessed data
 * - Team settings (5 minute TTL)
 * - User permissions (2 minute TTL)
 * - Reduces database queries for read-heavy operations
 */

import { redis } from './redis';

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    TEAM_SETTINGS: 300,     // 5 minutes
    USER_PERMISSIONS: 120,  // 2 minutes
    TEAM_MEMBERS: 180,      // 3 minutes
    SUBSCRIPTION: 600,      // 10 minutes
} as const;

// Cache key prefixes
const CACHE_KEYS = {
    TEAM: 'cache:team:',
    USER_PERMISSIONS: 'cache:perms:',
    TEAM_MEMBERS: 'cache:members:',
    SUBSCRIPTION: 'cache:sub:',
} as const;

/**
 * Generic cache wrapper with automatic serialization
 */
export async function withCache<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>
): Promise<T> {
    // If Redis not configured, skip cache and fetch directly
    if (!redis) {
        return fetchFn();
    }

    try {
        // Try to get from cache
        const cached = await redis.get<T>(key);
        if (cached !== null) {
            return cached;
        }
    } catch (error) {
        // If cache read fails, continue to fetch
        console.error('[Cache] Read error:', error);
    }

    // Fetch fresh data
    const data = await fetchFn();

    // Store in cache (non-blocking)
    if (redis && data !== null && data !== undefined) {
        redis.setex(key, ttlSeconds, JSON.stringify(data)).catch((err) => {
            console.error('[Cache] Write error:', err);
        });
    }

    return data;
}

/**
 * Invalidate cache keys matching a pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
    if (!redis) return;

    try {
        // For single key invalidation
        await redis.del(pattern);
    } catch (error) {
        console.error('[Cache] Invalidation error:', error);
    }
}

/**
 * Invalidate team-related cache
 */
export async function invalidateTeamCache(teamId: string): Promise<void> {
    if (!redis) return;

    const keys = [
        `${CACHE_KEYS.TEAM}${teamId}`,
        `${CACHE_KEYS.TEAM_MEMBERS}${teamId}`,
        `${CACHE_KEYS.SUBSCRIPTION}${teamId}`,
    ];

    try {
        await Promise.all(keys.map(key => redis!.del(key)));
    } catch (error) {
        console.error('[Cache] Team cache invalidation error:', error);
    }
}

/**
 * Invalidate user permissions cache
 */
export async function invalidateUserPermissionsCache(userId: string, teamId: string): Promise<void> {
    if (!redis) return;

    try {
        await redis.del(`${CACHE_KEYS.USER_PERMISSIONS}${userId}:${teamId}`);
    } catch (error) {
        console.error('[Cache] User permissions cache invalidation error:', error);
    }
}

/**
 * Get team settings from cache or database
 */
export async function getCachedTeamSettings(
    teamId: string,
    fetchFn: () => Promise<Record<string, unknown> | null>
): Promise<Record<string, unknown> | null> {
    const cacheKey = `${CACHE_KEYS.TEAM}${teamId}`;
    return withCache(cacheKey, CACHE_TTL.TEAM_SETTINGS, fetchFn);
}

/**
 * Get user permissions from cache or database
 */
export async function getCachedUserPermissions<T>(
    userId: string,
    teamId: string,
    fetchFn: () => Promise<T>
): Promise<T> {
    const cacheKey = `${CACHE_KEYS.USER_PERMISSIONS}${userId}:${teamId}`;
    return withCache(cacheKey, CACHE_TTL.USER_PERMISSIONS, fetchFn);
}

/**
 * Get team members from cache or database
 */
export async function getCachedTeamMembers<T>(
    teamId: string,
    fetchFn: () => Promise<T>
): Promise<T> {
    const cacheKey = `${CACHE_KEYS.TEAM_MEMBERS}${teamId}`;
    return withCache(cacheKey, CACHE_TTL.TEAM_MEMBERS, fetchFn);
}

/**
 * Get subscription info from cache or database
 */
export async function getCachedSubscription<T>(
    teamId: string,
    fetchFn: () => Promise<T>
): Promise<T> {
    const cacheKey = `${CACHE_KEYS.SUBSCRIPTION}${teamId}`;
    return withCache(cacheKey, CACHE_TTL.SUBSCRIPTION, fetchFn);
}

export { CACHE_KEYS };
