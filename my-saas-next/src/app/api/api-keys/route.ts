
// src/app/api/api-keys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized, forbidden } from '@/lib/middleware/auth';
import { db } from '@/db';
import { teamMembers, apiKeys, auditLogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { getErrorMessage } from '@/lib/error-utils';


// GET /api/api-keys - List API keys
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');
    if (!payload.teamId) return unauthorized('Team context required');

    // Check role
    const member = await db.query.teamMembers.findFirst({
        where: and(
            eq(teamMembers.userId, payload.userId),
            eq(teamMembers.teamId, payload.teamId)
        )
    });

    if (!member || !member.role || !['ADMIN', 'MANAGER'].includes(member.role)) {
      return forbidden('Only owners and admins can view API keys');
    }

    const keys = await db.query.apiKeys.findMany({
      where: eq(apiKeys.teamId, payload.teamId),
      orderBy: [desc(apiKeys.createdAt)],
      columns: {
        id: true,
        name: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, apiKeys: keys });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// POST /api/api-keys - Create new API key
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');
    if (!payload.teamId) return unauthorized('Team context required');

    // Check role
    const member = await db.query.teamMembers.findFirst({
        where: and(
            eq(teamMembers.userId, payload.userId),
            eq(teamMembers.teamId, payload.teamId)
        )
    });

    if (!member || !member.role || !['ADMIN', 'MANAGER'].includes(member.role)) {
      return forbidden('Only owners and admins can create API keys');
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 });
    }

    // Generate API key
    const rawKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefix = rawKey.substring(0, 12);

    const [apiKey] = await db.insert(apiKeys).values({
        name,
        prefix,
        keyHash, // Map hash to 'keyHash' column
        teamId: payload.teamId
    }).returning();

    // Audit log
    await db.insert(auditLogs).values({
        teamId: payload.teamId!,
        userId: payload.userId,
        action: 'API_KEY_CREATED',
        entity: 'API_KEY',
        details: `Created API key: ${name}`
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey, // Only returned once!
        prefix: apiKey.prefix
      },
      warning: 'Save this key now. You won\'t be able to see it again!'
    }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// DELETE /api/api-keys - Revoke/Delete API key
export async function DELETE(req: NextRequest) {
    try {
      const token = extractToken(req);
      if (!token) return unauthorized();
  
      const payload = verifyToken(token);
      if (!payload) return unauthorized('Invalid token');
      if (!payload.teamId) return unauthorized('Team context required');
  
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
  
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
  
      if (!id) {
        return NextResponse.json({ error: 'API Key ID is required' }, { status: 400 });
      }
  
      // Ensure key belongs to team
      const existingKey = await db.query.apiKeys.findFirst({
          where: and(
              eq(apiKeys.id, id),
              eq(apiKeys.teamId, payload.teamId) // Security check
          )
      });
  
      if (!existingKey) {
          return NextResponse.json({ error: 'API key not found' }, { status: 404 });
      }
  
      await db.delete(apiKeys).where(eq(apiKeys.id, id));
  
      // Audit log
      await db.insert(auditLogs).values({
          teamId: payload.teamId!,
          userId: payload.userId,
          action: 'API_KEY_REVOKED',
          entity: 'API_KEY',
          details: `Revoked API key: ${existingKey.name} (${existingKey.prefix})`
      });
  
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
