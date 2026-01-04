import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { TrustService } from '@/services/trustService';
import { getErrorMessage } from '@/lib/error-utils';


export const GET = withTeam(async (req, context: any) => {
  const { team } = context;
  if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });

  try {
    const trustData = await TrustService.getScore(team.teamId);
    return NextResponse.json({ success: true, data: trustData });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}, { roles: ['ADMIN', 'MANAGER', 'STAFF'] });
