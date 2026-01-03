import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Enterprise OS/);
});

test('can navigate to login', async ({ page }) => {
  await page.goto('/');
  
  // Find "Sign In" or similar
  // This depends on your landing page. Assuming there is a link.
  // If not, we can go directly to /auth
  await page.goto('/auth');

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});
