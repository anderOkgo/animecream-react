import { test, expect } from '@playwright/test';

// Real login against a real account (see .env.e2e.local.example) --
// skipped entirely when credentials aren't configured, so this suite
// doesn't fail for anyone who hasn't set up .env.e2e.local.
const adminLogin = process.env.E2E_ADMIN_LOGIN;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test.describe('Login (real admin account)', () => {
  test.skip(!adminLogin || !adminPassword, 'E2E_ADMIN_LOGIN/E2E_ADMIN_PASSWORD not set -- see .env.e2e.local.example');

  test('logs in with a real account and closes the login overlay on success', async ({ page }) => {
    await page.goto('/');

    // The Login link lives in a CSS-hover dropdown under "Session".
    await page.getByText('Session', { exact: true }).hover();
    await page.getByRole('link', { name: 'Login' }).click({ force: true });

    await expect(page.locator('.login-overlay')).toBeVisible();
    await page.locator('#username').fill(adminLogin);
    await page.locator('#password').fill(adminPassword);
    // `.btn-primary.btn-block` is unique to Login's own submit button --
    // `.login-container` also contains an unrelated `.login-close` button.
    await page.locator('.btn-primary.btn-block').click();

    await expect(page.locator('.login-overlay')).toHaveCount(0, { timeout: 10000 });
  });
});
