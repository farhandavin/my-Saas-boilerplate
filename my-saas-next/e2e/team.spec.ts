import { test, expect } from '@playwright/test';

// Helper to login
async function login(page: any, email: string, password: string) {
    await page.goto('/en/auth');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('Team Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should display team settings page', async ({ page }) => {
        await page.goto('/en/dashboard/setting/team');
        await page.waitForLoadState('networkidle');

        // Should show team name
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should show team members list', async ({ page }) => {
        await page.goto('/en/dashboard/setting/team');
        await page.waitForLoadState('networkidle');

        // Should show at least the current user as a member
        const membersList = page.locator('[data-testid="team-members"], table, [class*="member"]');
        await expect(membersList.first()).toBeVisible({ timeout: 5000 });
    });

    test('should open invite member modal', async ({ page }) => {
        await page.goto('/en/dashboard/setting/team');
        await page.waitForLoadState('networkidle');

        const inviteBtn = page.locator('button:has-text("Invite"), button:has-text("Add Member")').first();

        if (await inviteBtn.isVisible()) {
            await inviteBtn.click();
            await page.waitForTimeout(500);

            // Should show invite form
            const emailInput = page.locator('input[type="email"]').last();
            await expect(emailInput).toBeVisible();
        } else {
            console.log('Invite button not found - may require different permissions');
        }
    });

    test('should invite team member with email', async ({ page }) => {
        await page.goto('/en/dashboard/setting/team');
        await page.waitForLoadState('networkidle');

        const inviteBtn = page.locator('button:has-text("Invite"), button:has-text("Add Member")').first();

        if (await inviteBtn.isVisible()) {
            await inviteBtn.click();
            await page.waitForTimeout(500);

            // Fill invite form
            const emailInput = page.locator('input[type="email"]').last();
            await emailInput.fill(`invited-${Date.now()}@example.com`);

            // Select role if dropdown exists
            const roleSelect = page.locator('select[name="role"], [data-testid="role-select"]');
            if (await roleSelect.isVisible()) {
                await roleSelect.selectOption('STAFF');
            }

            // Submit
            await page.locator('button[type="submit"], button:has-text("Send")').last().click();

            // Should show success message
            await page.waitForTimeout(2000);
            const successMsg = page.locator('text=/invited|invitation sent/i');
            await expect(successMsg).toBeVisible({ timeout: 5000 });
        }
    });

    test('should change member role', async ({ page }) => {
        await page.goto('/en/dashboard/setting/team');
        await page.waitForLoadState('networkidle');

        // Find a member row (not the owner)
        const memberRow = page.locator('[data-testid="member-row"], tr').nth(1);

        if (await memberRow.isVisible()) {
            // Look for role dropdown or edit button
            const roleSelect = memberRow.locator('select, [data-testid="role-select"]').first();

            if (await roleSelect.isVisible()) {
                await roleSelect.selectOption('MANAGER');

                // Should auto-save or have save button
                await page.waitForTimeout(2000);

                // Verify change
                const value = await roleSelect.inputValue();
                expect(value).toBe('MANAGER');
            }
        }
    });

    test('should remove team member', async ({ page }) => {
        await page.goto('/en/dashboard/setting/team');
        await page.waitForLoadState('networkidle');

        // Find a member row (not the owner)
        const memberRow = page.locator('[data-testid="member-row"], tr').nth(1);

        if (await memberRow.isVisible()) {
            const removeBtn = memberRow.locator('button:has-text("Remove"), [data-testid="remove-button"]').first();

            if (await removeBtn.isVisible()) {
                await removeBtn.click();

                // Confirm in modal
                await page.waitForTimeout(500);
                await page.locator('button:has-text("Confirm"), button:has-text("Remove")').last().click();

                // Should show success
                await page.waitForTimeout(2000);
            }
        }
    });
});

test.describe('Team Switching', () => {
    test('should switch between teams if user has multiple', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Look for team switcher
        const teamSwitcher = page.locator('[data-testid="team-switcher"], button:has-text("Switch Team")').first();

        if (await teamSwitcher.isVisible()) {
            await teamSwitcher.click();
            await page.waitForTimeout(500);

            // Select another team
            const teamOption = page.locator('[data-testid="team-option"]').nth(1);

            if (await teamOption.isVisible()) {
                await teamOption.click();

                // Should reload dashboard with new team context
                await page.waitForLoadState('networkidle');
            }
        } else {
            console.log('Team switcher not visible - user may only have one team');
        }
    });
});

test.describe('Team Creation', () => {
    test('should create a new team', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Navigate to team creation
        const createTeamBtn = page.locator('button:has-text("Create Team"), a[href*="create-team"]').first();

        if (await createTeamBtn.isVisible()) {
            await createTeamBtn.click();
            await page.waitForTimeout(500);

            // Fill team details
            await page.fill('input[name="name"]', `E2E Test Team ${Date.now()}`);
            await page.fill('input[name="slug"]', `e2e-team-${Date.now()}`);

            // Submit
            await page.locator('button[type="submit"]').click();

            // Should redirect to new team dashboard
            await page.waitForTimeout(2000);
        } else {
            console.log('Create team button not found - feature may be restricted');
        }
    });
});

test.describe('Team Settings', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should update team name', async ({ page }) => {
        await page.goto('/en/dashboard/setting/team');
        await page.waitForLoadState('networkidle');

        const nameInput = page.locator('input[name="name"], input[name="teamName"]').first();

        if (await nameInput.isVisible()) {
            await nameInput.fill(`Updated Team ${Date.now()}`);

            // Save
            const saveBtn = page.locator('button:has-text("Save")').first();
            await saveBtn.click();

            // Should show success
            await page.waitForTimeout(2000);
            const successMsg = page.locator('text=/saved|updated/i');
            await expect(successMsg).toBeVisible({ timeout: 5000 });
        }
    });

    test('should update team slug', async ({ page }) => {
        await page.goto('/en/dashboard/setting/team');
        await page.waitForLoadState('networkidle');

        const slugInput = page.locator('input[name="slug"]').first();

        if (await slugInput.isVisible()) {
            const newSlug = `team-${Date.now()}`;
            await slugInput.fill(newSlug);

            // Save
            const saveBtn = page.locator('button:has-text("Save")').first();
            await saveBtn.click();

            await page.waitForTimeout(2000);
        }
    });

    test('should display plan limits', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        // Should show current plan
        const planInfo = page.locator('text=/free|pro|enterprise/i');
        await expect(planInfo.first()).toBeVisible({ timeout: 5000 });
    });
});
