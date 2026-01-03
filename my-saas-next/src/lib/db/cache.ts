import { unstable_cache } from 'next/cache';
import { cache } from 'react';

/**
 * Cache wrapper for Drizzle queries using Next.js 16 Data Cache.
 * 
 * @param callback The async function (usually a DB query) to cache.
 * @param keys An array of string keys to uniquely identify the data.
 * @param tags An array of tags for revalidation (e.g., ['users', 'dashboard:123']).
 * @param revalidate Duration in seconds to keep the cache. Default: 1 hour (3600).
 */
export const dbCache = <T>(
    callback: (...args: any[]) => Promise<T>,
    { keys, tags, revalidate = 3600 }: {
        keys: string[];
        tags: string[];
        revalidate?: number | false;
    }
) => {
    return unstable_cache(
        callback,
        keys,
        {
            tags,
            revalidate,
        }
    );
};

// React cache (Request Memoization) - de-duplicates requests in a single render pass
export const memoize = cache;
