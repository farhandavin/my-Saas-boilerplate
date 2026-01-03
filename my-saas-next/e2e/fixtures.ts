import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Test users for different roles
export const TEST_USERS = {
    owner: {
        email: 'owner@e2e-test.com',
        password: 'TestPassword123!',
        role: 'OWNER'
    },
    admin: {
        email: 'admin@e2e-test.com',
        password: 'TestPassword123!',
        role: 'ADMIN'
    },
    manager: {
        email: 'manager@e2e-test.com',
        password: 'TestPassword123!',
        role: 'MANAGER'
    },
    staff: {
        email: 'staff@e2e-test.com',
        password: 'TestPassword123!',
        role: 'STAFF'
    }
};

// Helper functions
export async function login(page: Page, email: string, password: string) {
    await page.goto('/en/auth/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

export async function logout(page: Page) {
    // Assuming there's a user menu or logout button
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    await page.waitForURL('**/auth/login');
}

export async function createProject(page: Page, name: string, description?: string) {
    await page.goto('/en/dashboard/projects');
    await page.click('text=New Project');

    await page.fill('input[name="name"]', name);
    if (description) {
        await page.fill('textarea[name="description"]', description);
    }

    await page.click('button[type="submit"]');

    // Wait for redirect or success message
    await page.waitForTimeout(1000);
}

// Extended test with authenticated user context
type TestFixtures = {
    authenticatedPage: Page;
    ownerPage: Page;
    staffPage: Page;
};

export const test = base.extend<TestFixtures>({
    authenticatedPage: async ({ page }, use) => {
        await login(page, TEST_USERS.owner.email, TEST_USERS.owner.password);
        await use(page);
    },

    ownerPage: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await login(page, TEST_USERS.owner.email, TEST_USERS.owner.password);
        await use(page);
        await context.close();
    },

    staffPage: async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await login(page, TEST_USERS.staff.email, TEST_USERS.staff.password);
        await use(page);
        await context.close();
    }
});

export { expect };
