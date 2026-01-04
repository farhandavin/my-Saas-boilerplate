// src/app/api/payment/resume/route.ts
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

    const result = await PaymentService.resumeSubscription(payload.userId, teamId);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Resume subscription error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
