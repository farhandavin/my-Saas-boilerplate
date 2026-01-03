// src/app/api/team/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { TeamService } from '@/services/teamService';

// GET /api/team - Get user's teams
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const teams = await TeamService.getMyTeams(payload.userId);
    
    // Format with role info
    const formattedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      slug: team.slug,
      tier: team.tier,
      aiUsageCount: team.aiUsageCount,
      aiTokenLimit: team.aiTokenLimit,
      memberCount: team.memberCount,
      myRole: team.myRole,
    }));

    return NextResponse.json({ success: true, teams: formattedTeams });
  } catch (error: any) {
    console.error('Get teams error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/team - Create new team
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const { name, slug } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const team = await TeamService.createTeam({
      name,
      slug,
      ownerId: payload.userId
    });

    return NextResponse.json({ success: true, team }, { status: 201 });
  } catch (error: any) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
