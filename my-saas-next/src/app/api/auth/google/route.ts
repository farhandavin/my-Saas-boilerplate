import { NextResponse } from 'next/server';
import { OAuthService } from '@/services/oauthService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = OAuthService.getGoogleAuthUrl();
  return NextResponse.redirect(url);
}
