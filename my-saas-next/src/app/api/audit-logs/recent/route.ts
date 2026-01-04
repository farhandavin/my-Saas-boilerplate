
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { AuditLogService } from '@/services/auditLogService';
import { getErrorMessage } from '@/lib/error-utils';


export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const logs = await AuditLogService.getRecentLogs(payload.teamId, 5);

    return NextResponse.json({ success: true, logs });
  } catch (error: unknown) {
    console.error('Fetch recent logs error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
