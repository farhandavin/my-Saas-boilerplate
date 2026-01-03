
import { db } from '@/db';
import { projects, projectMembers, tasks } from '@/db/schema';
import { eq, and, or, desc, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { PrivacyService } from './privacyService';

interface CreateProjectDTO {
  teamId: string;
  name: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}

export class ProjectService {
  /**
   * Create a new project with PII masking on description.
   */
  static async createProject(data: CreateProjectDTO) {
    let description = data.description || '';

    // Apply PII Masking
    if (description) {
      const { maskedContent } = await PrivacyService.maskContent(data.teamId, description);
      description = maskedContent;
    }

    const [project] = await db.insert(projects).values({
      id: uuidv4(),
      teamId: data.teamId,
      name: data.name,
      description: description,
      status: data.status || 'active',
    }).returning();

    return project;
  }

  /**
   * Get all projects for a team.
   */
  static async getProjects(teamId: string) {
    return await db.select()
      .from(projects)
      .where(eq(projects.teamId, teamId))
      .orderBy(desc(projects.createdAt));
  }

  /**
   * Get projects for a specific user based on their role and assignments.
   * - OWNER/ADMIN: See all team projects
   * - MANAGER/STAFF: See only projects they are assigned to + public projects
   */
  static async getProjectsForUser(teamId: string, userId: string, role: string) {
    // OWNER and ADMIN have full visibility
    if (['OWNER', 'ADMIN'].includes(role)) {
      return this.getProjects(teamId);
    }

    // MANAGER and STAFF see only assigned projects + "public" projects
    // Strategy: Use in-memory filtering for clearer logic

    // Step 1: Get all projects in the team
    const allTeamProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        teamId: projects.teamId,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(eq(projects.teamId, teamId))
      .orderBy(desc(projects.createdAt));

    // Step 2: Get ALL project members (for this team's projects)
    const teamProjectIds = allTeamProjects.map(p => p.id);
    if (teamProjectIds.length === 0) {
      return []; // No projects in team
    }

    const allProjectMembers = await db
      .select({
        projectId: projectMembers.projectId,
        userId: projectMembers.userId
      })
      .from(projectMembers);

    // Build lookup structures
    const projectIdsWithMembers = new Set(allProjectMembers.map(pm => pm.projectId));
    const userProjectIds = new Set(
      allProjectMembers
        .filter(pm => pm.userId === userId)
        .map(pm => pm.projectId)
    );

    // Step 3: Filter - user sees:
    // a) Projects they're assigned to
    // b) Projects with NO members (public to all team)
    const visibleProjects = allTeamProjects.filter(project => {
      const hasNoMembers = !projectIdsWithMembers.has(project.id);
      const userIsAssigned = userProjectIds.has(project.id);
      return hasNoMembers || userIsAssigned;
    });

    return visibleProjects;
  }


  /**
   * Get a single project by ID.
   */
  static async getProjectById(id: string, teamId: string) {
    const [project] = await db.select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.teamId, teamId)));
    return project;
  }

  /**
   * Update a project.
   */
  static async updateProject(id: string, teamId: string, data: Partial<CreateProjectDTO>) {
    const updates: Partial<{ name: string; status: string; description: string; updatedAt: Date }> = { updatedAt: new Date() };
    if (data.name) updates.name = data.name;
    if (data.status) updates.status = data.status;

    if (data.description !== undefined) {
      if (data.description) {
        const { maskedContent } = await PrivacyService.maskContent(teamId, data.description);
        updates.description = maskedContent;
      } else {
        updates.description = '';
      }
    }

    const [updated] = await db.update(projects)
      .set(updates)
      .where(and(eq(projects.id, id), eq(projects.teamId, teamId)))
      .returning();

    return updated;
  }

  /**
   * Delete a project.
   */
  static async deleteProject(id: string, teamId: string) {
    const [deleted] = await db.delete(projects)
      .where(and(eq(projects.id, id), eq(projects.teamId, teamId)))
      .returning();
    return deleted;
  }

  /**
   * Get project details with stats
   */
  static async getProjectDetails(id: string, teamId: string) {
    const [project] = await db.select().from(projects)
      .where(and(eq(projects.id, id), eq(projects.teamId, teamId)));

    if (!project) return null;

    // Fetch stats separately for speed/cleanliness
    // 1. Members
    const members = await db.select().from(projectMembers).where(eq(projectMembers.projectId, id));

    // 2. Tasks
    const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, id));
    const completedTasks = allTasks.filter(t => t.status === 'done').length;
    const progress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

    return {
      ...project,
      memberCount: members.length,
      taskCount: allTasks.length,
      progress: progress,
      members: members,
      tasks: allTasks
    };
  }

  /**
   * Add a member to a project
   */
  static async addMember(projectId: string, userId: string, role: 'viewer' | 'editor' = 'editor') {
    const [member] = await db.insert(projectMembers).values({
      projectId,
      userId,
      role
    }).onConflictDoNothing().returning();
    return member;
  }

  /**
   * Remove a member from a project
   */
  static async removeMember(projectId: string, userId: string) {
    await db.delete(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
    return true;
  }
}
