import { NextRequest, NextResponse } from 'next/server';
import { OAuthService } from '@/services/oauthService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle Google Errors
  if (error) {
    return NextResponse.redirect(new URL(`/auth?error=${error}`, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=no_code', req.url));
  }

  try {
    const { token, user, team, isNewUser } = await OAuthService.handleGoogleCallback(code);

    // Redirect to client-side callback handler to sync token to localStorage
    // The callback handler will then redirect to dashboard or onboarding
    const redirectUrl = new URL('/auth/callback', req.url);

    // Set JWT in HttpOnly Cookie for security
    const response = NextResponse.redirect(redirectUrl);

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    };

    response.cookies.set('token', token, cookieOptions);

    // Also redirect with query params so client can set localStorage if needed (Hybrid approach)
    // Ideally we rely on cookies, but your client side logic uses localStorage currently.
    // For specific compatibility with your AuthPage logic:
    // We can't set localStorage from server. 
    // So we redirect to a standard "Callback Handler" page OR we assume middleware reads cookie.

    // Existing middleware reads cookie 'token'. So the user IS logged in.
    return response;

  } catch (err: any) {
    console.error('Google Auth Error:', err);
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(err.message)}`, req.url));
  }
}
