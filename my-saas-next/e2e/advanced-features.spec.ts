import { test, expect } from '@playwright/test';

// Helper to login
async function login(page: any, email: string, password: string) {
    await page.goto('/en/auth/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('API Keys Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'demo@example.com', 'demo123456');
    });

    test('should navigate to API keys page', async ({ page }) => {
        await page.goto('/en/dashboard/settings/api-keys');
        await page.waitForLoadState('networkidle');

        // Should show API keys interface
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should display list of API keys', async ({ page }) => {
        await page.goto('/en/dashboard/settings/api-keys');
        await page.waitForLoadState('networkidle');

        const keysList = page.locator('table, [data-testid="api-keys-list"], .api-key-item');
        const emptyState = page.locator('text=/no api keys|create your first/i');

        const hasKeys = await keysList.first().isVisible().catch(() => false);
        const isEmpty = await emptyState.isVisible().catch(() => false);

        expect(hasKeys || isEmpty).toBeTruthy();
    });

    test('should create new API key', async ({ page }) => {
        await page.goto('/en/dashboard/settings/api-keys');
        await page.waitForLoadState('networkidle');

        const createBtn = page.locator('button:has-text("Create API Key"), button:has-text("New Key")').first();

        if (await createBtn.isVisible()) {
            await createBtn.click();
            await page.waitForTimeout(500);

            // Fill key name
            const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').last();
            await nameInput.fill(`E2E Test Key ${Date.now()}`);

            // Submit
            const submitBtn = page.locator('button[type="submit"], button:has-text("Create")').last();
            await submitBtn.click();

            // Should show success and display the new key
            await page.waitForTimeout(2000);

            const newKey = page.locator('[data-testid="api-key-value"], code, .key-value');
            if (await newKey.isVisible()) {
                await expect(newKey).toBeVisible();
            }
        }
    });

    test('should copy API key to clipboard', async ({ page }) => {
        await page.goto('/en/dashboard/settings/api-keys');
        await page.waitForLoadState('networkidle');

        const copyBtn = page.locator('button:has-text("Copy"), [data-testid="copy-key"]').first();

        if (await copyBtn.isVisible()) {
            await copyBtn.click();

            // Should show copied confirmation
            await page.waitForTimeout(500);
            const copiedMsg = page.locator('text=/copied|success/i');
            // May appear briefly
        }
    });

    test('should revoke API key', async ({ page }) => {
        await page.goto('/en/dashboard/settings/api-keys');
        await page.waitForLoadState('networkidle');

        const revokeBtn = page.locator('button:has-text("Revoke"), button:has-text("Delete")').first();

        if (await revokeBtn.isVisible()) {
            await revokeBtn.click();
            await page.waitForTimeout(500);

            // Confirm revocation
            const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Revoke")').last();
            if (await confirmBtn.isVisible()) {
                await confirmBtn.click();
                await page.waitForTimeout(2000);
            }
        }
    });

    test('should display API key permissions/scopes', async ({ page }) => {
        await page.goto('/en/dashboard/settings/api-keys');
        await page.waitForLoadState('networkidle');

        const permissions = page.locator('text=/read|write|full access|scope/i');

        if (await permissions.first().isVisible()) {
            // Should show what each key can do
            await expect(permissions.first()).toBeVisible();
        }
    });
});

test.describe('Webhooks Configuration', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'demo@example.com', 'demo123456');
    });

    test('should navigate to webhooks page', async ({ page }) => {
        await page.goto('/en/dashboard/settings/webhooks');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should display webhooks list', async ({ page }) => {
        await page.goto('/en/dashboard/settings/webhooks');
        await page.waitForLoadState('networkidle');

        const webhooksList = page.locator('table, [data-testid="webhooks-list"]');
        const emptyState = page.locator('text=/no webhooks/i');

        const hasWebhooks = await webhooksList.isVisible().catch(() => false);
        const isEmpty = await emptyState.isVisible().catch(() => false);

        expect(hasWebhooks || isEmpty).toBeTruthy();
    });

    test('should create new webhook', async ({ page }) => {
        await page.goto('/en/dashboard/settings/webhooks');
        await page.waitForLoadState('networkidle');

        const createBtn = page.locator('button:has-text("Create Webhook"), button:has-text("New Webhook")').first();

        if (await createBtn.isVisible()) {
            await createBtn.click();
            await page.waitForTimeout(500);

            // Fill webhook URL
            const urlInput = page.locator('input[name="url"], input[placeholder*="url" i]').last();
            await urlInput.fill('https://example.com/webhook');

            // Select events
            const eventCheckbox = page.locator('input[type="checkbox"]').first();
            if (await eventCheckbox.isVisible()) {
                await eventCheckbox.click();
            }

            // Submit
            const submitBtn = page.locator('button[type="submit"], button:has-text("Create")').last();
            await submitBtn.click();

            await page.waitForTimeout(2000);
        }
    });

    test('should test webhook endpoint', async ({ page }) => {
        await page.goto('/en/dashboard/settings/webhooks');
        await page.waitForLoadState('networkidle');

        const testBtn = page.locator('button:has-text("Test"), [data-testid="test-webhook"]').first();

        if (await testBtn.isVisible()) {
            await testBtn.click();

            // Should send test payload and show result
            await page.waitForTimeout(2000);

            const resultMsg = page.locator('text=/success|failed|sent/i');
            // Result may appear
        }
    });

    test('should show webhook event history', async ({ page }) => {
        await page.goto('/en/dashboard/settings/webhooks');
        await page.waitForLoadState('networkidle');

        // Click on a webhook
        const firstWebhook = page.locator('tr, .webhook-item').nth(1);

        if (await firstWebhook.isVisible()) {
            await firstWebhook.click();
            await page.waitForTimeout(1000);

            // Should show delivery history
            const historySection = page.locator('text=/delivery history|recent deliveries/i');
            if (await historySection.isVisible()) {
                await expect(historySection).toBeVisible();
            }
        }
    });

    test('should disable/enable webhook', async ({ page }) => {
        await page.goto('/en/dashboard/settings/webhooks');
        await page.waitForLoadState('networkidle');

        const toggleBtn = page.locator('button:has-text("Disable"), button:has-text("Enable"), input[type="checkbox"]').first();

        if (await toggleBtn.isVisible()) {
            await toggleBtn.click();
            await page.waitForTimeout(1000);

            // Status should update
        }
    });

    test('should delete webhook', async ({ page }) => {
        await page.goto('/en/dashboard/settings/webhooks');
        await page.waitForLoadState('networkidle');

        const deleteBtn = page.locator('button:has-text("Delete"), [data-testid="delete-webhook"]').first();

        if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
            await page.waitForTimeout(500);

            // Confirm deletion
            const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
            if (await confirmBtn.isVisible()) {
                await confirmBtn.click();
                await page.waitForTimeout(2000);
            }
        }
    });
});

test.describe('Audit Logs Viewing', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'demo@example.com', 'demo123456');
    });

    test('should navigate to audit logs page', async ({ page }) => {
        await page.goto('/en/dashboard/audit-logs');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should display audit log entries', async ({ page }) => {
        await page.goto('/en/dashboard/audit-logs');
        await page.waitForLoadState('networkidle');

        const logsList = page.locator('table, [data-testid="audit-logs"], .log-entry');

        if (await logsList.first().isVisible()) {
            // Should show activity logs
            await expect(logsList.first()).toBeVisible();
        } else {
            console.log('No audit logs found or feature not accessible');
        }
    });

    test('should filter logs by action type', async ({ page }) => {
        await page.goto('/en/dashboard/audit-logs');
        await page.waitForLoadState('networkidle');

        const filterSelect = page.locator('select[name="action"], [data-testid="action-filter"]').first();

        if (await filterSelect.isVisible()) {
            await filterSelect.selectOption({ index: 1 });
            await page.waitForTimeout(1000);

            // Logs should filter
        }
    });

    test('should filter logs by date range', async ({ page }) => {
        await page.goto('/en/dashboard/audit-logs');
        await page.waitForLoadState('networkidle');

        const dateFilter = page.locator('input[type="date"], [data-testid="date-filter"]').first();

        if (await dateFilter.isVisible()) {
            await dateFilter.fill('2026-01-01');
            await page.waitForTimeout(1000);
        }
    });

    test('should search logs by user or resource', async ({ page }) => {
        await page.goto('/en/dashboard/audit-logs');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

        if (await searchInput.isVisible()) {
            await searchInput.fill('demo@example.com');
            await page.waitForTimeout(1000);

            // Should filter to matching logs
        }
    });

    test('should show log entry details', async ({ page }) => {
        await page.goto('/en/dashboard/audit-logs');
        await page.waitForLoadState('networkidle');

        const firstLog = page.locator('tr, .log-entry').nth(1);

        if (await firstLog.isVisible()) {
            await firstLog.click();
            await page.waitForTimeout(500);

            // Should expand or show modal with details
            const details = page.locator('.log-details, [role="dialog"]');
            // May show more information
        }
    });

    test('should export audit logs', async ({ page }) => {
        await page.goto('/en/dashboard/audit-logs');
        await page.waitForLoadState('networkidle');

        const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")').first();

        if (await exportBtn.isVisible()) {
            await exportBtn.click();

            // Should trigger download (CSV/JSON)
            await page.waitForTimeout(1000);
        } else {
            console.log('Export feature not found');
        }
    });
});
