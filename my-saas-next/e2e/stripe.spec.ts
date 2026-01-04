import { test, expect } from '@playwright/test';

test.describe('Billing Flow', () => {
    // Mock authentication for billing tests
    test.use({ storageState: 'playwright/.auth/user.json' });

    test('should display pricing tables and trigger checkout', async ({ page }) => {
        // 1. Navigate to billing page
        await page.goto('/dashboard/billing');

        // 2. Verify pricing tables are visible
        // Assuming standard "Pro" and "Enterprise" tiers
        await expect(page.getByText('Pro', { exact: true })).toBeVisible();
        await expect(page.getByText('Enterprise')).toBeVisible();

        // 3. Verify Upgrade Trigger
        // Find the upgrade button for Pro tier
        const upgradeButton = page.getByRole('button', { name: /Upgrade to Pro|Get Started/i }).first();
        await expect(upgradeButton).toBeVisible();

        // 4. Intercept the checkout call to verify it fires
        // Note: Actual Stripe checkout redirect might leave the app, so we intercept the API call or check for redirect initiation
        const checkoutRequest = page.waitForRequest(req =>
            req.url().includes('/api/stripe/checkout') && req.method() === 'POST'
        );

        await upgradeButton.click();

        // Verify request was made
        const request = await checkoutRequest;
        expect(request).toBeTruthy();

        // Optional: Check if we are redirected to Stripe (url contains stripe.com)
        // await expect(page).toHaveURL(/checkout.stripe.com/); 
    });
});
