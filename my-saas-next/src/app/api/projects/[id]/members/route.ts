
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware/auth';
import { ProjectService } from '@/services/projectService';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-utils';


// POST /api/projects/[id]/members - Add Member
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        teamMembers: {
          with: { team: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        error: 'User not found. Please invite them to your organization first via Team Settings.'
      }, { status: 404 });
    }

    // 🔒 SECURITY: Verify user is a member of THIS team
    const isTeamMember = user.teamMembers.some(
      (tm: any) => tm.teamId === authResult.teamId
    );

    if (!isTeamMember) {
      return NextResponse.json({
        error: `This user belongs to a different organization (${user.teamMembers[0]?.team?.name || 'another company'}). Only members of your team can be added to projects.`
      }, { status: 403 });
    }

    // Add to project
    const member = await ProjectService.addMember(id, user.id, role || 'editor');

    return NextResponse.json({ success: true, member });

  } catch (error: unknown) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/members - Remove Member
// Request body: { userId }
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await ProjectService.removeMember(id, userId);

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Remove member error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
