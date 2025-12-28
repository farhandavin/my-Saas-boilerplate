// src/app/api/api-keys/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized, forbidden } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

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
    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: payload.userId, teamId: payload.teamId } }
    });

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return forbidden('Only owners and admins can revoke API keys');
    }

    const { id } = await params;

    // Verify key belongs to team
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, teamId: payload.teamId }
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await prisma.apiKey.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        teamId: payload.teamId,
        userId: payload.userId,
        action: 'API_KEY_REVOKED',
        details: `Revoked API key: ${apiKey.name}`
      }
    });

    return NextResponse.json({ success: true, message: 'API key revoked' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
