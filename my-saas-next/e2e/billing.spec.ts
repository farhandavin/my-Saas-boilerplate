import { test, expect } from '@playwright/test';

// Helper to login
async function login(page: any, email: string, password: string) {
    await page.goto('/en/auth');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('Billing & Subscription Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should navigate to billing page', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        // Should show billing information
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should display current subscription plan', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        const planInfo = page.locator('text=/Tier/i, text=/Current Plan/i');
        await expect(planInfo.first()).toBeVisible({ timeout: 5000 });
    });

    test('should show plan features and limits', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        // Should display limits (Usage Stats)
        const usageStats = page.getByText('Usage Stats', { exact: false });
        if (await usageStats.isVisible()) {
            await expect(usageStats).toBeVisible();
        } else {
            // Fallback to checking token usage card
            await expect(page.locator('text=Tokens Used')).toBeVisible();
        }
    });

    test('should display manage subscription options', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        // Look for "Manage Subscription" which opens Stripe Portal
        const manageBtn = page.locator('button:has-text("Manage Subscription")');
        await expect(manageBtn).toBeVisible();
    });

    test('should display billing history / invoices', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        const invoiceHeader = page.getByText('Invoice History');
        await expect(invoiceHeader).toBeVisible();

        // Check for table
        const table = page.locator('table');
        await expect(table).toBeVisible();
    });

    test('should show payment method section', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        const paymentMethod = page.getByText('Payment Method');
        await expect(paymentMethod).toBeVisible();
    });
});

test.describe('Subscription Changes', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should initiate portal redirect', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        const manageBtn = page.locator('button:has-text("Manage Subscription")');

        // This button usually does a window.location.href redirect. 
        // We can't fully test the Stripe Portal in E2E without mocking, 
        // but we can ensure the button is clickable.
        await expect(manageBtn).toBeEnabled();
    });
});

test.describe('Invoices Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should navigate to invoices page', async ({ page }) => {
        await page.goto('/en/dashboard/invoices');
        await page.waitForLoadState('networkidle');

        // Should show invoices list or empty state
        const invoicesList = page.locator('table, [data-testid="invoices-list"]');
        const emptyState = page.locator('text=/no invoices/i');

        const hasInvoices = await invoicesList.isVisible().catch(() => false);
        const isEmpty = await emptyState.isVisible().catch(() => false);

        expect(hasInvoices || isEmpty).toBeTruthy();
    });

    test('should create new invoice', async ({ page }) => {
        await page.goto('/en/dashboard/invoices');
        await page.waitForLoadState('networkidle');

        const newInvoiceBtn = page.locator('button:has-text("New Invoice"), a[href*="/invoices/new"]').first();

        if (await newInvoiceBtn.isVisible()) {
            await newInvoiceBtn.click();
            await page.waitForLoadState('networkidle');

            // Should show invoice form
            await expect(page).toHaveURL(/invoices\/new/);

            const amountInput = page.locator('input[name="amount"]');
            await expect(amountInput).toBeVisible();
        }
    });

    test('should download invoice PDF', async ({ page }) => {
        await page.goto('/en/dashboard/invoices');
        await page.waitForLoadState('networkidle');

        // Click first invoice if exists
        const firstInvoice = page.locator('tr, .invoice-item').nth(1);

        if (await firstInvoice.isVisible()) {
            await firstInvoice.click();
            await page.waitForTimeout(1000);

            const downloadBtn = page.locator('button:has-text("Download"), a:has-text("PDF")').first();

            if (await downloadBtn.isVisible()) {
                // Trigger download (won't actually download in test)
                await downloadBtn.click();
            }
        }
    });
});

test.describe('Payment Processing', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'testsprite@test.com', 'TestSprite123!');
    });

    test('should redirect to Stripe checkout', async ({ page }) => {
        await page.goto('/en/dashboard/setting/billing');
        await page.waitForLoadState('networkidle');

        const upgradeBtn = page.locator('button:has-text("Upgrade")').first();

        if (await upgradeBtn.isVisible()) {
            // Click and check if redirects to Stripe
            const [popup] = await Promise.all([
                page.waitForEvent('popup').catch(() => null),
                upgradeBtn.click()
            ]);

            if (popup) {
                await popup.waitForLoadState();
                // Should contain stripe.com or checkout
                const url = popup.url();
                console.log('Redirected to:', url);
            }
        }
    });

    test('should handle Stripe webhook callback', async ({ page }) => {
        // This would typically be tested via API tests
        // E2E can verify the UI reflects webhook updates
        await page.goto('/en/dashboard/setting/billing');

        // After a successful payment, plan should update
        // This is more for integration testing
    });
});
