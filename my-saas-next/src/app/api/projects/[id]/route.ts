import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware/auth';
import { ProjectService } from '@/services/projectService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = authResult.teamId;

    const project = await ProjectService.getProjectDetails(id, teamId);

    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Get Project Details Error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Allow OWNER, ADMIN, MANAGER (No STAFF)
    const member = authResult.user.teamMembers.find((tm: any) => tm.teamId === authResult.teamId);
    if (!member || !member.role || !['OWNER', 'ADMIN', 'MANAGER'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await ProjectService.updateProject(id, authResult.teamId, body);

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error('Update Project Error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Allow OWNER, ADMIN, MANAGER (No STAFF)
    const member = authResult.user.teamMembers.find((tm: any) => tm.teamId === authResult.teamId);
    if (!member || !member.role || !['OWNER', 'ADMIN', 'MANAGER'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await ProjectService.deleteProject(id, authResult.teamId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Project Error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
