import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { ProjectService } from '@/services/projectService';

export const GET = withTeam(
  async (req: NextRequest, context: any) => {
    const { team, user } = context;

    try {
      // Use role-aware project fetching for proper multi-tenancy
      const projects = await ProjectService.getProjectsForUser(
        team.teamId,
        user.userId,
        team.role
      );
      return NextResponse.json({ projects });
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
  },
  { roles: ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'] }
);

export const POST = withTeam(
  async (req: NextRequest, context: any) => {
    const { team } = context;

    try {
      const body = await req.json();
      const project = await ProjectService.createProject({
        ...body,
        teamId: team.teamId,
      });

      return NextResponse.json({ project });
    } catch (error: any) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
  },
  { roles: ['OWNER', 'ADMIN', 'MANAGER'] }
);
