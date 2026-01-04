
// src/app/api/api-keys/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized, forbidden } from '@/lib/middleware/auth';
import { db } from '@/db';
import { teamMembers, apiKeys, auditLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-utils';


// DELETE /api/api-keys/[id] - Revoke API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    // Check role
    const member = await db.query.teamMembers.findFirst({
        where: and(
            eq(teamMembers.userId, payload.userId),
            eq(teamMembers.teamId, payload.teamId)
        )
    });

    if (!member || !member.role || !['ADMIN', 'MANAGER'].includes(member.role)) {
      return forbidden('Only owners and admins can revoke API keys');
    }

    const { id } = await params;

    // Verify key belongs to team
    const apiKey = await db.query.apiKeys.findFirst({
        where: and(
            eq(apiKeys.id, id),
            eq(apiKeys.teamId, payload.teamId)
        )
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await db.delete(apiKeys).where(eq(apiKeys.id, id));

    // Audit log
    await db.insert(auditLogs).values({
        teamId: payload.teamId!,
        userId: payload.userId,
        action: 'API_KEY_REVOKED',
        entity: 'API_KEY',
        details: `Revoked API key: ${apiKey.name}`
    });

    return NextResponse.json({ success: true, message: 'API key revoked' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
