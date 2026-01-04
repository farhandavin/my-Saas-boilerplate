import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { PaymentService } from '@/services/paymentService';
import { getErrorMessage } from '@/lib/error-utils';
import { withCsrfProtection } from '@/lib/csrf';


// POST /api/billing/portal - Redirect to Stripe Customer Portal
export const POST = withTeam(async (req, context) => {
  // CSRF Protection - prevent cross-site request forgery
  const csrfError = withCsrfProtection(req);
  if (csrfError) return csrfError;

  const { team, user } = context;
  if (!team) {
    return NextResponse.json({ error: 'Team context required' }, { status: 403 });
  }

  try {
    const result = await PaymentService.createPortalSession(user.userId, team.teamId!);
    return NextResponse.json({ success: true, url: result.url });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}, { roles: ['ADMIN'] });
