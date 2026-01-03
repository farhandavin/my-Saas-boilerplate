import { db } from '@/db';
import { tasks, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const TaskService = {
  async createTask(data: { projectId: string; title: string; description?: string; assigneeId?: string; dueDate?: Date; priority?: string; status?: string }) {
    const [task] = await db.insert(tasks).values({
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate,
      priority: data.priority || 'medium',
      status: data.status || 'todo'
    }).returning();
    return task;
  },

  async getTasks(projectId: string) {
    return await db.query.tasks.findMany({
      where: eq(tasks.projectId, projectId),
      with: {
        assignee: {
            columns: { id: true, name: true, image: true }
        }
      },
      orderBy: desc(tasks.createdAt)
    });
  },

  async updateTask(id: string, projectId: string, data: Partial<typeof tasks.$inferInsert>) {
    const [updated] = await db.update(tasks)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)))
        .returning();
    return updated;
  },

  async deleteTask(id: string, projectId: string) {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.projectId, projectId)));
    return true;
  }
};
