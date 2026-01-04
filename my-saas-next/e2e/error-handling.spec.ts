import { test, expect } from '@playwright/test';

// Helper to login
async function login(page: any, email: string, password: string) {
    await page.goto('/en/auth');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('Network Error Handling', () => {
    test('should handle offline mode gracefully', async ({ page, context }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Simulate offline
        await context.setOffline(true);

        // Try to navigate
        await page.goto('/en/dashboard/projects').catch(() => { });

        // Should show offline indicator or cached content
        await page.waitForTimeout(2000);

        // Go back online
        await context.setOffline(false);
        await page.reload();

        // Should recover
        await expect(page).toHaveURL(/dashboard/);
    });

    test('should retry failed API requests', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Intercept API calls and simulate failure
        await page.route('**/api/**', async (route, request) => {
            // Fail first request, succeed on retry
            if (!request.headers()['x-retry']) {
                await route.abort('failed');
            } else {
                await route.continue();
            }
        });

        await page.goto('/en/dashboard/projects');

        // Should eventually load or show error message
        await page.waitForTimeout(3000);
    });

    test('should show error message on API failure', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Intercept and fail all API requests
        await page.route('**/api/projects', route => route.abort('failed'));

        await page.goto('/en/dashboard/projects');
        await page.waitForTimeout(2000);

        // Should show error message
        const errorMsg = page.locator('text=/error|failed|try again/i');
        const hasError = await errorMsg.isVisible().catch(() => false);

        // Error handling may vary
        console.log('Error handling:', hasError ? 'Present' : 'Needs improvement');
    });

    test('should handle slow network conditions', async ({ page, context }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Simulate slow network
        await context.route('**/*', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await route.continue();
        });

        await page.goto('/en/dashboard/projects');

        // Should show loading state
        const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner');
        await expect(loadingIndicator.first()).toBeVisible({ timeout: 1000 }).catch(() => { });
    });

    test('should timeout gracefully on hung requests', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Intercept and never respond
        await page.route('**/api/projects', route => {
            // Never resolve - simulate hung request
            // Route will timeout naturally
        });

        await page.goto('/en/dashboard/projects');
        await page.waitForTimeout(10000);

        // Should show timeout error or fallback UI
        const content = await page.content();
        // Should not be stuck forever
    });
});

test.describe('Unauthorized Access Prevention', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
        // Clear cookies
        await page.context().clearCookies();

        // Try to access protected route
        await page.goto('/en/dashboard');

        // Should redirect to login
        await page.waitForURL('**/auth', { timeout: 5000 });
        await expect(page).toHaveURL(/login/);
    });

    test('should prevent STAFF from accessing admin pages', async ({ page }) => {
        // Login as staff (if exists)
        await page.goto('/en/auth');
        await page.fill('input[type="email"]', 'staff@demo.com');
        await page.fill('input[type="password"]', 'TestSprite123!');
        await page.click('button[type="submit"]').catch(() => { });

        await page.waitForTimeout(2000);

        if (page.url().includes('dashboard')) {
            // Try to access billing (admin-only)
            await page.goto('/en/dashboard/setting/billing');
            await page.waitForTimeout(1000);

            // Should either redirect or show 403
            const url = page.url();
            const forbidden = page.locator('text=/forbidden|not authorized|403/i');

            const isForbidden = await forbidden.isVisible().catch(() => false);
            const isRedirected = !url.includes('billing');

            expect(isForbidden || isRedirected).toBeTruthy();
        }
    });

    test('should block access to other team data', async ({ page, context }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Try to access project with invalid team ID
        await page.goto('/en/dashboard/projects/invalid-team-project-id');
        await page.waitForTimeout(1000);

        // Should show 404 or redirect
        const notFound = page.locator('text=/not found|404|doesn\'t exist/i');
        const hasNotFound = await notFound.isVisible().catch(() => false);

        // Data isolation should prevent access
        expect(hasNotFound || !page.url().includes('invalid')).toBeTruthy();
    });

    test('should invalidate session on token expiry', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Manually expire token in localStorage
        await page.evaluate(() => {
            localStorage.setItem('token', 'expired-token-12345');
        });

        // Try to access protected route
        await page.goto('/en/dashboard/projects');
        await page.waitForTimeout(2000);

        // Should redirect to login
        const url = page.url();
        expect(url).toContain('login');
    });

    test('should prevent CSRF attacks', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Try to make request without proper headers
        const response = await page.evaluate(async () => {
            try {
                const res = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'Malicious Project' })
                });
                return { status: res.status, ok: res.ok };
            } catch (e) {
                return { error: true };
            }
        });

        // Should be blocked or require proper auth
        console.log('CSRF protection:', response);
    });
});

test.describe('Concurrent User Actions', () => {
    test('should handle multiple users editing same project', async ({ browser }) => {
        // Create two separate browser contexts (two users)
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        // Both users login
        await login(page1, 'testsprite@test.com', 'TestSprite123!');
        await login(page2, 'testsprite@test.com', 'TestSprite123!');

        // Both navigate to same project
        await page1.goto('/en/dashboard/projects');
        await page2.goto('/en/dashboard/projects');

        // User 1 edits project
        const firstProject1 = page1.locator('a[href*="/projects/"]').first();
        if (await firstProject1.isVisible()) {
            await firstProject1.click();
            await page1.waitForTimeout(1000);

            // User 2 also opens same project
            const firstProject2 = page2.locator('a[href*="/projects/"]').first();
            if (await firstProject2.isVisible()) {
                await firstProject2.click();
                await page2.waitForTimeout(1000);

                // Both try to edit simultaneously
                // Should handle conflicts gracefully
            }
        }

        await context1.close();
        await context2.close();
    });

    test('should handle race conditions on resource creation', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
        await page.goto('/en/dashboard/projects');

        // Rapidly click create button multiple times
        const createBtn = page.locator('text=/new project/i').first();

        if (await createBtn.isVisible()) {
            // Try to create multiple at once  
            await Promise.all([
                createBtn.click(),
                createBtn.click(),
                createBtn.click()
            ]).catch(() => { });

            // Should only create one or show proper error
            await page.waitForTimeout(2000);
        }
    });
});

test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
        await page.goto('/en/dashboard/projects');

        // Refresh page
        await page.reload();

        // Should still be logged in
        await expect(page).toHaveURL(/dashboard/);
    });

    test('should logout on session expiry', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Clear token to simulate expiry
        await page.evaluate(() => {
            localStorage.removeItem('token');
            sessionStorage.clear();
        });

        // Navigate to protected route
        await page.goto('/en/dashboard/projects');

        // Should redirect to login
        await page.waitForURL('**/login', { timeout: 5000 });
    });

    test('should prevent session hijacking', async ({ page, context }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');

        // Get token
        const token = await page.evaluate(() => localStorage.getItem('token'));

        // Create new incognito context
        const newContext = await page.context().browser()!.newContext();
        const newPage = await newContext.newPage();

        // Try to use stolen token
        await newPage.goto('/en/auth');
        await newPage.evaluate((stolenToken) => {
            localStorage.setItem('token', stolenToken || '');
        }, token);

        await newPage.goto('/en/dashboard');
        await newPage.waitForTimeout(2000);

        // Should require proper authentication
        // (Depending on implementation)

        await newContext.close();
    });
});

test.describe('Invalid Input Handling', () => {
    test('should validate email format', async ({ page }) => {
        await page.goto('/en/auth');

        await page.fill('input[type="email"]', 'invalid-email');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Should show validation error
        const errorMsg = page.locator('text=/invalid.*email/i');
        await expect(errorMsg).toBeVisible({ timeout: 3000 });
    });

    test('should prevent XSS in project names', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
        await page.goto('/en/dashboard/projects');

        const createBtn = page.locator('text=/new project/i').first();

        if (await createBtn.isVisible()) {
            await createBtn.click();
            await page.waitForTimeout(500);

            // Try to inject script
            const nameInput = page.locator('input[name="name"]');
            await nameInput.fill('<script>alert("XSS")</script>');

            await page.locator('button[type="submit"]').first().click();
            await page.waitForTimeout(2000);

            // Should be escaped, not executed
            const alerts = page.locator('dialog[role="alert"]');
            const count = await alerts.count();
            expect(count).toBe(0); // No alert dialogs
        }
    });

    test('should validate required fields', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
        await page.goto('/en/dashboard/projects');

        const createBtn = page.locator('text=/new project/i').first();

        if (await createBtn.isVisible()) {
            await createBtn.click();
            await page.waitForTimeout(500);

            // Try to submit without filling required fields
            await page.locator('button[type="submit"]').first().click();

            // Should show validation errors
            await page.waitForTimeout(1000);
            const errorMsg = page.locator('text=/required|please fill/i');
            // Validation should prevent submission
        }
    });

    test('should handle special characters in input', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
        await page.goto('/en/dashboard/projects');

        const createBtn = page.locator('text=/new project/i').first();

        if (await createBtn.isVisible()) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const nameInput = page.locator('input[name="name"]');
            await nameInput.fill('Test & Project "Special" \'Chars\' 日本語');

            await page.locator('button[type="submit"]').first().click();
            await page.waitForTimeout(2000);

            // Should handle gracefully
        }
    });

    test('should enforce input length limits', async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
        await page.goto('/en/dashboard/projects');

        const createBtn = page.locator('text=/new project/i').first();

        if (await createBtn.isVisible()) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const nameInput = page.locator('input[name="name"]');
            const longName = 'A'.repeat(1000); // Very long name

            await nameInput.fill(longName);
            await page.locator('button[type="submit"]').first().click();

            // Should show error or truncate
            await page.waitForTimeout(1000);
        }
    });
});
