import { NextRequest, NextResponse } from 'next/server';
import { ratelimit } from '@/lib/rate-limit';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { verifyAuth } from '@/lib/auth-helper';

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host")!;

  const isProd = process.env.NODE_ENV === 'production';
  const currentHost = hostname.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, ""); // Subdomain extraction if needed

  // NOTE: For now, we only inject headers to allow the app to read the domain.
  // Full rewriting to `/_sites/[site]` would require moving `[locale]` pages into `_sites` or a complex dynamic route.
  // We enable the app to recognize "Who am I" via headers.

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-url', req.url);
  requestHeaders.set('x-current-domain', hostname);
  requestHeaders.set('x-current-path', pathname);

  // 0. Rate Limiting for API Routes
  if (pathname.startsWith('/api')) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    try {
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);

      // Return 429 if rate limited
      if (!success) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    } catch (error) {
      // Fail open: if Redis is down or config is invalid, allow request
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("WRONGPASS") || errorMessage.includes("unauthorized")) {
        // Suppress noisy auth errors in dev/build
        console.warn("⚠️ Rate Limiting skipped: Invalid Upstash credentials. Check UPSTASH_REDIS_REST_TOKEN.");
      } else {
        console.error("Rate Limit Error:", error);
      }
    }
  }

  // Exclude API and static files from i18n logic
  // API requests fall through to here after rate limiting check above
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }


  // 1. Run intlMiddleware with updated headers
  // We need to clone the request with new headers
  // Note: next-intl middleware might not accept a Request object easily if it expects NextRequest.
  // For simplicity, we just pass the original req but we accept that intl might not see the new headers unless we reconstruct.
  // However, we can return the headers in the final response.

  const response = intlMiddleware(req as any);

  // Apply the headers to the response from intlMiddleware
  response.headers.set('x-current-domain', hostname);
  response.headers.set('x-current-path', pathname);

  // If intlMiddleware redirects (e.g. / -> /en), return immediately
  if (response.status === 307 || response.status === 308) {
    return response;
  }

  // 2. Auth Protection Logic
  // Extract locale to construct correct redirects
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] || 'en'; // default to en if missing (though intlMiddleware handles this)

  const protectedPaths = ['/dashboard', '/onboarding', '/settings', '/admin', '/superadmin'];
  const publicPaths = ['/demo']; // Public demo page

  // Check if path contains protected segment and is not a public path
  const isProtectedPath = protectedPaths.some(path => pathname.includes(path)) &&
    !publicPaths.some(path => pathname.includes(path));

  if (isProtectedPath) {
    const token = req.cookies.get('token')?.value ||
      req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/auth`, req.url));
    }

    const user = await verifyAuth(token);
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/auth?session=expired`, req.url));
    }

    // RBAC Check - user is now properly typed from verifyAuth
    if (pathname.includes('/admin')) {
      if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
        return NextResponse.rewrite(new URL('/403', req.url));
      }
    }

    // Superadmin Check
    if (pathname.includes('/superadmin')) {
      if (!user.isSuperAdmin) {
        return NextResponse.rewrite(new URL('/403', req.url));
      }
    }
  }

  return response;
}

export const config = {
  // Matched paths:
  // - All API routes (for rate limiting)
  // - All pages (for i18n & auth)
  // - Excludes: _next (static), and files with extensions (./image.png)
  matcher: ['/((?!_next|.*\\..*).*)']
};
