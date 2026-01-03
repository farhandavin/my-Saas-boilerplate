import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { users, teamMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface JwtPayload {
    userId: string;
    teamId: string;
    role: string;
}

/**
 * GET /api/auth/token
 * 
 * Returns the JWT token and user/team info from the HttpOnly cookie.
 * This is used by the OAuth callback handler to sync to localStorage.
 * Returns the same structure as manual login for consistency.
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    try {
        // Decode the token to get user/team info
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        // Fetch user details
        const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.userId),
        });

        // Fetch team membership with team details
        const member = await db.query.teamMembers.findFirst({
            where: and(
                eq(teamMembers.userId, decoded.userId),
                eq(teamMembers.teamId, decoded.teamId)
            ),
            with: { team: true }
        });

        if (!user || !member?.team) {
            return NextResponse.json({ error: 'User or team not found' }, { status: 404 });
        }

        // Return same structure as manual login (/api/auth/login)
        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image
            },
            team: {
                id: member.team.id,
                name: member.team.name,
                slug: member.team.slug,
                tier: member.team.tier
            },
            role: member.role
        });
    } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}
