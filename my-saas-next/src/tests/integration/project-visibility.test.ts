import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ProjectService } from '@/services/projectService';
import { db } from '@/db';
import { projects, projectMembers, users, teams, teamMembers } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, or } from 'drizzle-orm';

describe('Project Visibility (Multi-Tenancy RBAC)', () => {
    const testTeamId = uuidv4();
    const ownerId = uuidv4();
    const staffId = uuidv4();
    const staffId2 = uuidv4();
    const publicProjectId = uuidv4();
    const privateProjectId = uuidv4();

    beforeAll(async () => {
        // Setup test team
        await db.insert(teams).values({
            id: testTeamId,
            name: 'Test Team - SWOT Fixes',
            slug: 'test-team-swot'
        });

        // Setup test users
        await db.insert(users).values([
            { id: ownerId, email: 'owner@swot-test.com', password: 'hash123' },
            { id: staffId, email: 'staff1@swot-test.com', password: 'hash123' },
            { id: staffId2, email: 'staff2@swot-test.com', password: 'hash123' }
        ]);

        // Setup team memberships
        await db.insert(teamMembers).values([
            { userId: ownerId, teamId: testTeamId, role: 'OWNER' },
            { userId: staffId, teamId: testTeamId, role: 'STAFF' },
            { userId: staffId2, teamId: testTeamId, role: 'STAFF' }
        ]);

        // Create public project (no specific members = visible to all)
        await db.insert(projects).values({
            id: publicProjectId,
            teamId: testTeamId,
            name: 'Public Marketing Website',
            description: 'This is a public project',
            status: 'active'
        });

        // Create private project (assigned to owner + staff1 only)
        await db.insert(projects).values({
            id: privateProjectId,
            teamId: testTeamId,
            name: 'Private Internal Tool',
            description: 'This is a private project',
            status: 'active'
        });

        // Assign owner and staff1 to private project
        await db.insert(projectMembers).values([
            { projectId: privateProjectId, userId: ownerId, role: 'editor' },
            { projectId: privateProjectId, userId: staffId, role: 'viewer' }
        ]);
    });

    afterAll(async () => {
        // Cleanup in reverse order
        await db.delete(projectMembers).where(eq(projectMembers.projectId, privateProjectId));
        await db.delete(projects).where(eq(projects.teamId, testTeamId));
        await db.delete(teamMembers).where(eq(teamMembers.teamId, testTeamId));
        await db.delete(users).where(
            or(
                eq(users.id, ownerId),
                eq(users.id, staffId),
                eq(users.id, staffId2)
            )
        );
        await db.delete(teams).where(eq(teams.id, testTeamId));
    });

    it('OWNER should see all team projects', async () => {
        const result = await ProjectService.getProjectsForUser(testTeamId, ownerId, 'OWNER');

        expect(result).toHaveLength(2);
        expect(result.map(p => p.id)).toContain(publicProjectId);
        expect(result.map(p => p.id)).toContain(privateProjectId);
    });

    it('STAFF assigned to private project should see both public and assigned projects', async () => {
        const result = await ProjectService.getProjectsForUser(testTeamId, staffId, 'STAFF');

        expect(result.length).toBeGreaterThanOrEqual(1);
        // Staff1 should see public project and private project (they're assigned)
        const projectIds = result.map(p => p.id);
        expect(projectIds).toContain(publicProjectId);
        expect(projectIds).toContain(privateProjectId);
    });

    it('STAFF NOT assigned to private project should only see public projects', async () => {
        const result = await ProjectService.getProjectsForUser(testTeamId, staffId2, 'STAFF');

        // Staff2 should only see public project
        expect(result.length).toBeGreaterThanOrEqual(1);
        const projectIds = result.map(p => p.id);
        expect(projectIds).toContain(publicProjectId);
        expect(projectIds).not.toContain(privateProjectId);
    });

    it('ADMIN should see all projects like OWNER', async () => {
        // Create temporary admin
        const adminId = uuidv4();
        await db.insert(users).values({ id: adminId, email: 'admin@test.com', password: 'hash' });
        await db.insert(teamMembers).values({ userId: adminId, teamId: testTeamId, role: 'ADMIN' });

        const result = await ProjectService.getProjectsForUser(testTeamId, adminId, 'ADMIN');

        expect(result).toHaveLength(2);
        expect(result.map(p => p.id)).toContain(publicProjectId);
        expect(result.map(p => p.id)).toContain(privateProjectId);

        // Cleanup
        await db.delete(teamMembers).where(and(eq(teamMembers.userId, adminId), eq(teamMembers.teamId, testTeamId)));
        await db.delete(users).where(eq(users.id, adminId));
    });

    it('getProjects (original method) should still return all team projects', async () => {
        // Ensure backward compatibility
        const result = await ProjectService.getProjects(testTeamId);

        expect(result).toHaveLength(2);
        expect(result.map(p => p.id)).toContain(publicProjectId);
        expect(result.map(p => p.id)).toContain(privateProjectId);
    });
});
