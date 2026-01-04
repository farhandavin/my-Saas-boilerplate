import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { ProjectService } from '@/services/projectService';
import { TeamContext } from '@/types';

export const GET = withTeam(
  async (req: NextRequest, context: TeamContext) => {
    const { team, user } = context;

    try {
      // Use role-aware project fetching for proper multi-tenancy
      // team.teamId might be null in TeamContext if not strictly checked, but withTeam guarantees it?
      // withTeam should guarantee it. The TeamContext interface in index.ts has nullable teamId. 
      // I should enforce non-null assertion or check because withTeam ensures it.
      if (!team.teamId) throw new Error("Team ID missing in context");

      const projects = await ProjectService.getProjectsForUser(
        team.teamId,
        user.userId,
        team.role || 'STAFF'
      );
      return NextResponse.json({ projects });
    } catch (error: unknown) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
  },
  { roles: ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'] }
);

export const POST = withTeam(
  async (req: NextRequest, context: TeamContext) => {
    const { team } = context;

    try {
      if (!team.teamId) throw new Error("Team ID missing in context");

      const body = await req.json();
      const project = await ProjectService.createProject({
        ...body,
        teamId: team.teamId,
      });

      return NextResponse.json({ project });
    } catch (error: unknown) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
  },
  { roles: ['OWNER', 'ADMIN', 'MANAGER'] }
);
