import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { TrustService } from '@/services/trustService';

export const GET = withTeam(async (req, context: any) => {
  const { team } = context;
  if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });

  try {
    const trustData = await TrustService.getScore(team.teamId);
    return NextResponse.json({ success: true, data: trustData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { roles: ['ADMIN', 'MANAGER', 'STAFF'] });
