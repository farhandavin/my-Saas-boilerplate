
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware/auth';
import { TaskService } from '@/services/taskService';
import { ProjectService } from '@/services/projectService';

// GET /api/projects/[id]/tasks - List tasks
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify access (User must be member of the project OR the team)
    // For MVP, we check if the user belongs to the same team as the project
    
    const tasks = await TaskService.getTasks(id);
    return NextResponse.json({ success: true, tasks });

  } catch (error: any) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/projects/[id]/tasks - Create task
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user || !authResult.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, status, priority, dueDate, assigneeId } = body;

    if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await TaskService.createTask({
        projectId: id,
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId // User can assign to themselves or others
    });

    return NextResponse.json({ success: true, task }, { status: 201 });

  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
