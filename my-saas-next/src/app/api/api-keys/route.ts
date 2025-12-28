// src/app/api/api-keys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized, forbidden } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// GET /api/api-keys - List API keys
export async function GET(req: NextRequest) {
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
      return forbidden('Only owners and admins can view API keys');
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { teamId: payload.teamId },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, apiKeys });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/api-keys - Create new API key
export async function POST(req: NextRequest) {
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

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        prefix,
        keyHash,
        teamId: payload.teamId
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        teamId: payload.teamId,
        userId: payload.userId,
        action: 'API_KEY_CREATED',
        details: `Created API key: ${name}`
      }
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
