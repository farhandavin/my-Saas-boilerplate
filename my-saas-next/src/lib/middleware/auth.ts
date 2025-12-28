// src/lib/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { UserJwtPayload, Role } from '@/types';

// 1. Token Verification Helper
export const verifyToken = (token: string): UserJwtPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
  } catch {
    return null;
  }
};

// 2. Extract Token from Request
export const extractToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return req.cookies.get('token')?.value || null;
};

// 3. Get Authenticated User (untuk API routes)
export const getAuthUser = async (req: NextRequest) => {
  const token = extractToken(req);
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      teamMembers: {
        include: { team: true }
      }
    }
  });

  return user ? { ...payload, user } : null;
};

// 4. Get Team Context
export const getTeamContext = async (userId: string, teamId: string) => {
  const member = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
    include: { team: true }
  });
  return member;
};

// 5. RBAC Check
export const checkRole = (userRole: Role, allowedRoles: Role[]): boolean => {
  return allowedRoles.includes(userRole);
};

// 6. API Response Helpers
export const unauthorized = (message = 'Unauthorized') => 
  NextResponse.json({ error: message }, { status: 401 });

export const forbidden = (message = 'Forbidden') => 
  NextResponse.json({ error: message }, { status: 403 });

export const badRequest = (message: string) => 
  NextResponse.json({ error: message }, { status: 400 });

// 7. Wrapper untuk protected API routes
export const withAuth = (
  handler: (req: NextRequest, context: { user: UserJwtPayload }) => Promise<NextResponse>,
  options?: { roles?: Role[] }
) => {
  return async (req: NextRequest) => {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    // RBAC check if roles specified
    if (options?.roles && payload.role) {
      if (!checkRole(payload.role as Role, options.roles)) {
        return forbidden('Insufficient permissions');
      }
    }

    return handler(req, { user: payload });
  };
};

// 8. Wrapper dengan Team Context
export const withTeam = (
  handler: (req: NextRequest, context: { 
    user: UserJwtPayload; 
    team: Awaited<ReturnType<typeof getTeamContext>> 
  }) => Promise<NextResponse>,
  options?: { roles?: Role[] }
) => {
  return async (req: NextRequest) => {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const teamContext = await getTeamContext(payload.userId, payload.teamId);
    if (!teamContext) return forbidden('Not a team member');

    // RBAC check
    if (options?.roles) {
      if (!checkRole(teamContext.role as Role, options.roles)) {
        return forbidden('Insufficient permissions');
      }
    }

    return handler(req, { user: payload, team: teamContext });
  };
};
