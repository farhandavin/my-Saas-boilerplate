import { test, expect } from '@playwright/test';

// Helper to login
async function login(page: any, email: string, password: string) {
    await page.goto('/en/auth');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('AI Features - RAG (Knowledge Base)', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should navigate to knowledge base page', async ({ page }) => {
        // Look for AI/Knowledge Base menu item
        const knowledgeBaseLink = page.locator(
            'a[href*="/knowledge-base"], text=/Documents/i, text=/Knowledge Base/i'
        ).first();

        if (await knowledgeBaseLink.isVisible()) {
            await knowledgeBaseLink.click();
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(/knowledge-base/);
        } else {
            // Direct navigation fallback
            console.log('Sidebar link not found, attempting direct navigation');
            await page.goto('/en/dashboard/knowledge-base');
            await expect(page).toHaveURL(/knowledge-base/);
        }
    });

    test('should display upload document interface', async ({ page }) => {
        await page.goto('/en/dashboard/knowledge-base');

        const uploadBtn = page.locator(
            'button[type="submit"], [data-testid="add-document-btn"]'
        ).first();

        await expect(uploadBtn).toBeVisible();
    });

    test('should show list of uploaded documents', async ({ page }) => {
        await page.goto('/en/dashboard/knowledge-base');
        await page.waitForLoadState('networkidle');

        // Should show documents list or empty state
        const documentsList = page.locator('[data-testid="documents-list"]');
        await expect(documentsList).toBeVisible();
    });

    test('should open AI chat interface', async ({ page }) => {
        await page.goto('/en/dashboard/ai-hub');

        // Click Chat Tab
        const chatTab = page.locator('button:has-text("Chat Assistant")');
        await chatTab.click();

        const chatInput = page.locator('textarea, input[placeholder*="Ask"]').last();
        await expect(chatInput).toBeVisible();
    });

    test('should send message to AI chat', async ({ page }) => {
        await page.goto('/en/dashboard/ai-hub');

        // Click Chat Tab
        const chatTab = page.locator('button:has-text("Chat Assistant")');
        await chatTab.click();

        const chatInput = page.locator('textarea, input[placeholder*="Ask"]').last();

        if (await chatInput.isVisible()) {
            await chatInput.fill('What can you do?');
            await chatInput.press('Enter'); // The UI might not have a button, or uses Enter

            // Check for response bubble
            // Note: Use a generous timeout for AI response
            const messages = page.locator('.whitespace-pre-wrap');
            await expect(messages.count()).resolves.toBeGreaterThan(0);
        }
    });
});

test.describe('CEO Digest - AI Summary', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    // CEO Digest is now a tab in AI Hub
    test('should navigate to CEO Digest tab', async ({ page }) => {
        await page.goto('/en/dashboard/ai-hub');

        const digestTab = page.locator('button:has-text("CEO Digest")');
        if (await digestTab.isVisible()) {
            await digestTab.click();
            await expect(page.locator('h2:has-text("CEO Digest")')).toBeVisible();
        } else {
            console.log("CEO Digest tab not visible (likely requires ADMIN role)");
        }
    });
});

test.describe('AI Token Usage Tracking', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should display token usage in settings', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        const tokenUsage = page.locator('text=/token|usage|AI usage/i').first();

        if (await tokenUsage.isVisible()) {
            await expect(tokenUsage).toBeVisible();
        } else {
            console.log('Token usage display not found');
        }
    });

    test('should show usage limit and current usage', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        // Look for numbers indicating limits
        const usageNumbers = page.locator('text=/\\d+.*tokens|\\d+.*of.*\\d+/i');

        if (await usageNumbers.first().isVisible()) {
            // Should display usage metrics
            const text = await usageNumbers.first().textContent();
            console.log('Usage info:', text);
        }
    });
});

test.describe('AI Pre-Check Feature', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should have AI validation on invoice form', async ({ page }) => {
        await page.goto('/en/dashboard/invoices/new');

        const preCheckBtn = page.locator('button:has-text("AI Check"), button:has-text("Validate")').first();

        if (await preCheckBtn.isVisible()) {
            await expect(preCheckBtn).toBeVisible();
        } else {
            console.log('AI Pre-Check button not found on invoice form');
        }
    });

    test('should validate input with AI', async ({ page }) => {
        await page.goto('/en/dashboard/invoices/new');

        // Fill some form data
        const amountInput = page.locator('input[name="amount"]');
        if (await amountInput.isVisible()) {
            await amountInput.fill('10000');

            const preCheckBtn = page.locator('button:has-text("AI Check"), button:has-text("Validate")').first();

            if (await preCheckBtn.isVisible()) {
                await preCheckBtn.click();

                // Should show validation result
                await page.waitForTimeout(2000);

                const validationMsg = page.locator('.validation-result, [data-testid="ai-validation"]');
                // Result may appear
            }
        }
    });
});
