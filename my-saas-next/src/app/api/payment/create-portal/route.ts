// src/app/api/payment/create-portal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { PaymentService } from '@/services/paymentService';
import { getErrorMessage } from '@/lib/error-utils';


export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const { teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Pass the origin (e.g. http://localhost:3001) to ensure the redirect comes back to the correct port
    const origin = req.nextUrl.origin;
    const result = await PaymentService.createPortalSession(payload.userId, teamId, origin);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Portal error:', error);
    const errorMessage = getErrorMessage(error);

    // Handle specific business logic errors
    if (errorMessage === 'This team has no billing history') {
      return NextResponse.json(
        { error: 'No billing history found. Please subscribe to a plan first.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

