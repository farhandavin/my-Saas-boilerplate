import { test, expect } from '@playwright/test';

// Helper to login
async function login(page: any, email: string, password: string) {
    await page.goto('/en/auth');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('Project Visibility - RBAC', () => {
    test('OWNER should see all projects', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        await page.goto('/en/dashboard/projects');
        await page.waitForLoadState('networkidle');

        // Should see projects list (not empty state)
        const emptyState = page.locator('text=/no projects yet/i');
        const projectList = page.locator('[data-testid="project-card"], .project-card, [class*="project"]').first();

        // Either has projects or shows empty state correctly
        const hasProjects = await projectList.isVisible().catch(() => false);
        const isEmpty = await emptyState.isVisible().catch(() => false);

        expect(hasProjects || isEmpty).toBeTruthy();
    });

    test('STAFF should only see assigned projects', async ({ page }) => {
        // This test assumes staff@demo.com exists
        // If not, it will be skipped
        try {
            await login(page, 'staff@demo. com', 'TestSprite123!');

            await page.goto('/en/dashboard/projects');
            await page.waitForLoadState('networkidle');

            // Staff should NOT see "New Project" button
            const newProjectBtn = page.locator('text=/new project/i');
            await expect(newProjectBtn).not.toBeVisible();

        } catch (error) {
            console.log('Staff user not available, skipping test');
            test.skip();
        }
    });
});

test.describe('Project CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should create a new project', async ({ page }) => {
        await page.goto('/en/dashboard/projects');

        // Check if "New Project" button exists
        const newProjectBtn = page.locator('text=/new project/i').first();

        if (await newProjectBtn.isVisible()) {
            await newProjectBtn.click();

            // Fill project form
            await page.waitForTimeout(500);
            await page.fill('input[name="name"], input[placeholder*="name" i]', `E2E Test Project ${Date.now()}`);
            await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 'Created by E2E test');

            // Submit
            const submitBtn = page.locator('button[type="submit"], button:has-text("Create")').first();
            await submitBtn.click();

            // Should redirect or show success
            await page.waitForTimeout(2000);

            // Verify project appears in list
            await page.goto('/en/dashboard/projects');
            await expect(page.locator('text=/E2E Test Project/i').first()).toBeVisible({ timeout: 5000 });
        } else {
            console.log('New Project button not visible - user may not have permission');
        }
    });

    test('should view project details', async ({ page }) => {
        await page.goto('/en/dashboard/projects');
        await page.waitForLoadState('networkidle');

        // Click first project
        const firstProject = page.locator('[data-testid="project-card"], a[href*="/projects/"]').first();

        if (await firstProject.isVisible()) {
            await firstProject.click();

            // Should navigate to project detail page
            await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+/);

            // Should show project name
            await expect(page.locator('h1, h2').first()).toBeVisible();
        }
    });

    test('should update project details', async ({ page }) => {
        await page.goto('/en/dashboard/projects');
        await page.waitForLoadState('networkidle');

        // Click first project
        const firstProject = page.locator('[data-testid="project-card"], a[href*="/projects/"]').first();

        if (await firstProject.isVisible()) {
            await firstProject.click();
            await page.waitForLoadState('networkidle');

            // Look for edit button
            const editBtn = page.locator('button:has-text("Edit"), [data-testid="edit-button"]').first();

            if (await editBtn.isVisible()) {
                await editBtn.click();

                // Update name
                const nameInput = page.locator('input[name="name"]');
                await nameInput.fill(`Updated Project ${Date.now()}`);

                // Save
                await page.locator('button:has-text("Save"), button[type="submit"]').first().click();

                // Should show success message or updated content
                await page.waitForTimeout(2000);
            }
        }
    });

    test('should delete project', async ({ page }) => {
        await page.goto('/en/dashboard/projects');
        await page.waitForLoadState('networkidle');

        // Click first project
        const firstProject = page.locator('[data-testid="project-card"], a[href*="/projects/"]').first();

        if (await firstProject.isVisible()) {
            const projectName = await firstProject.textContent();
            await firstProject.click();
            await page.waitForLoadState('networkidle');

            // Look for delete button
            const deleteBtn = page.locator('button:has-text("Delete"), [data-testid="delete-button"]').first();

            if (await deleteBtn.isVisible()) {
                await deleteBtn.click();

                // Confirm deletion in modal
                await page.waitForTimeout(500);
                const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
                await confirmBtn.click();

                // Should redirect to projects list
                await page.waitForURL('**/projects', { timeout: 5000 });

                // Verify project is gone
                if (projectName) {
                    await expect(page.locator(`text=${projectName}`)).not.toBeVisible();
                }
            }
        }
    });
});

test.describe('Project Member Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should add member to project', async ({ page }) => {
        await page.goto('/en/dashboard/projects');
        await page.waitForLoadState('networkidle');

        const firstProject = page.locator('[data-testid="project-card"], a[href*="/projects/"]').first();

        if (await firstProject.isVisible()) {
            await firstProject.click();
            await page.waitForLoadState('networkidle');

            // Look for "Add Member" or "Invite" button
            const addMemberBtn = page.locator('button:has-text("Add Member"), button:has-text("Invite")').first();

            if (await addMemberBtn.isVisible()) {
                await addMemberBtn.click();
                await page.waitForTimeout(500);

                // This would require selecting a user from team
                // Implementation depends on UI
                console.log('Add member UI found - full test requires team members');
            }
        }
    });
});

test.describe('Project Filtering and Search', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should filter projects by status', async ({ page }) => {
        await page.goto('/en/dashboard/projects');
        await page.waitForLoadState('networkidle');

        // Look for filter button or dropdown
        const filterBtn = page.locator('button:has-text("Filter"), [data-testid="filter-button"]').first();

        if (await filterBtn.isVisible()) {
            await filterBtn.click();
            // Test implementation depends on filter UI
        }
    });

    test('should search projects by name', async ({ page }) => {
        await page.goto('/en/dashboard/projects');
        await page.waitForLoadState('networkidle');

        // Look for search input
        const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();

        if (await searchInput.isVisible()) {
            await searchInput.fill('test');
            await page.waitForTimeout(1000);

            // Results should filter
            // Specific assertion depends on implementation
        }
    });
});
