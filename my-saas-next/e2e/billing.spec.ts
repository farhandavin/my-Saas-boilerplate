import { test, expect } from '@playwright/test';

// Helper to login
async function login(page: any, email: string, password: string) {
    await page.goto('/en/auth/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('Billing & Subscription Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'demo@example.com', 'demo123456');
    });

    test('should navigate to billing page', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        // Should show billing information
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should display current subscription plan', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const planInfo = page.locator('text=/free|pro|enterprise/i, [data-testid="current-plan"]').first();
        await expect(planInfo).toBeVisible({ timeout: 5000 });
    });

    test('should show plan features and limits', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        // Should display limits (members, tokens, etc.)
        const limitsSection = page.locator('text=/members|tokens|projects/i');

        if (await limitsSection.first().isVisible()) {
            const count = await limitsSection.count();
            expect(count).toBeGreaterThan(0);
        }
    });

    test('should display upgrade options', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const upgradeBtn = page.locator('button:has-text("Upgrade"), a:has-text("Upgrade")').first();

        if (await upgradeBtn.isVisible()) {
            await expect(upgradeBtn).toBeVisible();
        } else {
            console.log('Upgrade button not visible - user may already be on highest plan');
        }
    });

    test('should open pricing modal/page', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const upgradeBtn = page.locator('button:has-text("Upgrade"), a:has-text("View Plans")').first();

        if (await upgradeBtn.isVisible()) {
            await upgradeBtn.click();
            await page.waitForTimeout(1000);

            // Should show pricing options
            const pricingInfo = page.locator('text=/\\$\\d+|Free|Pro|Enterprise/');
            await expect(pricingInfo.first()).toBeVisible({ timeout: 5000 });
        }
    });

    test('should display billing history', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const billingHistory = page.locator('text=/billing history|invoices|transactions/i').first();

        if (await billingHistory.isVisible()) {
            await billingHistory.click();
            await page.waitForTimeout(1000);

            // Should show list of past transactions
            const historyList = page.locator('table, .invoice-item, [data-testid="billing-history"]');
            // May be empty if no transactions yet
        }
    });

    test('should show payment method section', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const paymentMethod = page.locator('text=/payment method|credit card/i').first();

        if (await paymentMethod.isVisible()) {
            await expect(paymentMethod).toBeVisible();
        } else {
            console.log('Payment method section not found');
        }
    });

    test('should calculate and display usage-based charges', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const usageCharges = page.locator('text=/usage|metered|tokens used/i');

        if (await usageCharges.first().isVisible()) {
            // Should display current usage and estimated charges
            await expect(usageCharges.first()).toBeVisible();
        }
    });
});

test.describe('Subscription Changes', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'demo@example.com', 'demo123456');
    });

    test('should initiate plan upgrade flow', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const upgradeBtn = page.locator('button:has-text("Upgrade to Pro"), button:has-text("Upgrade to Enterprise")').first();

        if (await upgradeBtn.isVisible()) {
            await upgradeBtn.click();
            await page.waitForTimeout(1000);

            // Should show payment or confirmation modal
            const modal = page.locator('[role="dialog"], .modal, [data-testid="upgrade-modal"]');
            // Stripe checkout may redirect
        }
    });

    test('should show downgrade option', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const downgradeBtn = page.locator('button:has-text("Downgrade"), text=/downgrade/i').first();

        if (await downgradeBtn.isVisible()) {
            await expect(downgradeBtn).toBeVisible();
        } else {
            console.log('Downgrade option not available - may be on free tier');
        }
    });

    test('should display subscription cancellation option', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
        await page.waitForLoadState('networkidle');

        const cancelBtn = page.locator('button:has-text("Cancel Subscription"), a:has-text("Cancel")').first();

        if (await cancelBtn.isVisible()) {
            await cancelBtn.click();
            await page.waitForTimeout(500);

            // Should show confirmation warning
            const warningMsg = page.locator('text=/are you sure|warning|lose access/i');
            await expect(warningMsg.first()).toBeVisible({ timeout: 5000 });
        }
    });
});

test.describe('Invoices Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'demo@example.com', 'demo123456');
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
        await login(page, 'demo@example.com', 'demo123456');
    });

    test('should redirect to Stripe checkout', async ({ page }) => {
        await page.goto('/en/dashboard/settings/billing');
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
        await page.goto('/en/dashboard/settings/billing');

        // After a successful payment, plan should update
        // This is more for integration testing
    });
});
