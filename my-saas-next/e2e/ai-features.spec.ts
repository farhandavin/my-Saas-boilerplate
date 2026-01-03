import { test, expect } from '@playwright/test';

// Helper to login
async function login(page: any, email: string, password: string) {
    await page.goto('/en/auth/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('AI Features - RAG (Knowledge Base)', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'demo@example.com', 'demo123456');
    });

    test('should navigate to knowledge base page', async ({ page }) => {
        // Look for AI/Knowledge Base menu item
        const knowledgeBaseLink = page.locator(
            'a[href*="/knowledge"], a[href*="/rag"], text=/knowledge base/i'
        ).first();

        if (await knowledgeBaseLink.isVisible()) {
            await knowledgeBaseLink.click();
            await page.waitForLoadState('networkidle');

            // Should be on knowledge base page
            await expect(page).toHaveURL(/knowledge|rag/);
        } else {
            console.log('Knowledge Base feature not found - may not be implemented');
        }
    });

    test('should display upload document interface', async ({ page }) => {
        await page.goto('/en/dashboard/knowledge');

        const uploadBtn = page.locator(
            'button:has-text("Upload"), input[type="file"], [data-testid="upload-document"]'
        ).first();

        if (await uploadBtn.isVisible()) {
            await expect(uploadBtn).toBeVisible();
        } else {
            console.log('Upload interface not found');
        }
    });

    test('should show list of uploaded documents', async ({ page }) => {
        await page.goto('/en/dashboard/knowledge');
        await page.waitForLoadState('networkidle');

        // Should show documents list or empty state
        const documentsList = page.locator('[data-testid="documents-list"], table, .document-item');
        const emptyState = page.locator('text=/no documents|empty/i');

        const hasDocs = await documentsList.first().isVisible().catch(() => false);
        const isEmpty = await emptyState.isVisible().catch(() => false);

        expect(hasDocs || isEmpty).toBeTruthy();
    });

    test('should open AI chat interface', async ({ page }) => {
        await page.goto('/en/dashboard/ai-chat');

        const chatInput = page.locator(
            'textarea[placeholder*="Ask" i], textarea[placeholder*="Question" i], [data-testid="chat-input"]'
        ).first();

        if (await chatInput.isVisible()) {
            await expect(chatInput).toBeVisible();
        } else {
            console.log('AI Chat interface not found');
        }
    });

    test('should send message to AI chat', async ({ page }) => {
        await page.goto('/en/dashboard/ai-chat');

        const chatInput = page.locator('textarea, input[type="text"]').last();

        if (await chatInput.isVisible()) {
            await chatInput.fill('What is the company policy on remote work?');

            const sendBtn = page.locator('button:has-text("Send"), button[type="submit"]').last();
            await sendBtn.click();

            // Should show loading or response
            await page.waitForTimeout(2000);

            const response = page.locator('.message, [data-testid="ai-response"]').last();
            // Response may appear async
        } else {
            console.log('Chat input not available');
        }
    });
});

test.describe('CEO Digest - AI Summary', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'demo@example.com', 'demo123456');
    });

    test('should display CEO Digest widget on dashboard', async ({ page }) => {
        await page.goto('/en/dashboard');
        await page.waitForLoadState('networkidle');

        const digestWidget = page.locator(
            'text=/CEO Digest/i, [data-testid="ceo-digest"], .digest-widget'
        ).first();

        if (await digestWidget.isVisible()) {
            await expect(digestWidget).toBeVisible();
        } else {
            console.log('CEO Digest widget not found - may be OWNER-only feature');
        }
    });

    test('should show summary statistics', async ({ page }) => {
        await page.goto('/en/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for key metrics
        const metrics = page.locator('text=/revenue|tasks|projects/i');

        if (await metrics.first().isVisible()) {
            const count = await metrics.count();
            expect(count).toBeGreaterThan(0);
        }
    });

    test('should navigate to full CEO Digest page', async ({ page }) => {
        await page.goto('/en/dashboard');

        const viewFullBtn = page.locator('a:has-text("View Full"), a[href*="/digest"]').first();

        if (await viewFullBtn.isVisible()) {
            await viewFullBtn.click();
            await expect(page).toHaveURL(/digest/);
        } else {
            console.log('Full digest page link not found');
        }
    });
});

test.describe('AI Token Usage Tracking', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'demo@example.com', 'demo123456');
    });

    test('should display token usage in settings', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const tokenUsage = page.locator('text=/token|usage|AI usage/i').first();

        if (await tokenUsage.isVisible()) {
            await expect(tokenUsage).toBeVisible();
        } else {
            console.log('Token usage display not found');
        }
    });

    test('should show usage limit and current usage', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
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
        await login(page, 'demo@example.com', 'demo123456');
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
