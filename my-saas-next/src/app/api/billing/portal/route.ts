import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { PaymentService } from '@/services/paymentService';

// POST /api/billing/portal - Redirect to Stripe Customer Portal
export const POST = withTeam(async (req, context: any) => {
  const { team, user } = context;
  if (!team) {
    return NextResponse.json({ error: 'Team context required' }, { status: 403 });
  }

  try {
    const result = await PaymentService.createPortalSession(user.userId, team.teamId);
    return NextResponse.json({ success: true, url: result.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}, { roles: ['ADMIN'] });
