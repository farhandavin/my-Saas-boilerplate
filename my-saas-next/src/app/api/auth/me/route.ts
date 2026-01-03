
// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, teamMembers } from '@/db/schema';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { eq, sql } from 'drizzle-orm';
import { AuthService } from '@/services/authService';


export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    // Fetch full user data with teams
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      with: {
        teamMembers: {
          with: {
            team: true
          }
        }
      }
    });

    if (!user) return unauthorized('User not found');

    // Filter valid members with teams
    const validMembers = user.teamMembers.filter(tm => tm.team);

    // Format response with member counts (fetching counts separately or assuming optimization later)
    // For now, doing separate count queries per team to mimic previous logic
    const teamsWithMemberCount = await Promise.all(
      validMembers.map(async (tm) => {
        // Count members in this team
        const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(teamMembers)
            .where(eq(teamMembers.teamId, tm.teamId!));
            
        const memberCount = Number(countResult.count);

        return {
          id: tm.team!.id,
          name: tm.team!.name,
          slug: tm.team!.slug,
          tier: tm.team!.tier,
          aiUsageCount: tm.team!.aiUsageCount || 0,
          aiTokenLimit: tm.team!.aiTokenLimit || 0,
          memberCount,
          myRole: tm.role,
          isActive: tm.teamId === payload.teamId
        };
      })
    );

    const activeTeam = teamsWithMemberCount.find(t => t.isActive) || teamsWithMemberCount[0];


    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      teams: teamsWithMemberCount,
      activeTeam,
      currentRole: activeTeam?.myRole || payload.role
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const body = await req.json();
    const { name, image } = body;

    // Validate input (prevent updating other fields)
    const updateData: { name?: string; image?: string } = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
       return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Use AuthService.updateUser (which we just added)
    const updatedUser = await AuthService.updateUser(payload.userId, updateData);
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
     console.error('Update me error:', error);
     return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}


