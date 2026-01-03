
// src/app/api/payment/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { PaymentService } from '@/services/paymentService';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const { priceId, teamId, planType } = await req.json();

    if (!priceId || !teamId) {
      return NextResponse.json({ 
        error: 'Missing required fields: priceId or teamId' 
      }, { status: 400 });
    }

    // Get user email
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: { email: true }
    });

    if (!user) return unauthorized('User not found');

    const result = await PaymentService.createCheckoutSession({
      userId: payload.userId,
      email: user.email,
      teamId,
      priceId,
      planType,
      returnUrlBase: req.nextUrl.origin
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
