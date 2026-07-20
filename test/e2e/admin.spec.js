import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_IMAGE = path.join(__dirname, '../../public/img/icon/android-icon-32x32.png');

const adminLogin = process.env.E2E_ADMIN_LOGIN;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

// Admin CRUD golden path -- the one E2E suite here that mutates the real,
// shared dev database (not a throwaway/CI-provisioned one). Every fixture
// this creates is distinctively named (__E2E_TEST_SERIES_<timestamp>__,
// matching module-api's own E2E naming convention) and cleaned up via a
// direct DELETE call in afterEach -- there is no delete button in
// AdminPanel today, so cleanup goes straight to the API, bypassing the UI.
test.describe('Admin: create a series', () => {
  test.skip(!adminLogin || !adminPassword, 'E2E_ADMIN_LOGIN/E2E_ADMIN_PASSWORD not set -- see .env.e2e.local.example');

  let createdSeriesId;

  test.afterEach(async ({ request }) => {
    if (!createdSeriesId) return;
    const loginResp = await request.post('http://localhost:3001/api/users/login', {
      data: { username: adminLogin, password: adminPassword },
    });
    const { token } = await loginResp.json();
    await request.delete(`http://localhost:3001/api/series/${createdSeriesId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    createdSeriesId = undefined;
  });

  test('logs in, opens the Admin tab, and creates a series via the form', async ({ page }) => {
    const seriesName = `__E2E_TEST_SERIES_${Date.now()}__`;

    await page.goto('/');
    await page.getByText('Session', { exact: true }).hover();
    await page.getByRole('link', { name: 'Login' }).click({ force: true });
    await page.locator('#username').fill(adminLogin);
    await page.locator('#password').fill(adminPassword);
    await page.locator('.btn-primary.btn-block').click();
    await expect(page.locator('.login-overlay')).toHaveCount(0, { timeout: 10000 });

    await page.locator('label[for="tab-2"]').click();
    await expect(page.locator('#name')).toBeHidden(); // still on JSON mode by default
    await page.locator('input[name="inputMode"]').nth(1).check(); // "Use Form"
    await expect(page.locator('#name')).toBeVisible();

    await page.locator('#name').fill(seriesName);
    await page.locator('#year').fill('2024');
    await page.locator('#image').setInputFiles(TEST_IMAGE);

    // Capture the response to the real create-complete call to get the new
    // series' id for cleanup, without relying on any UI element for it.
    const [createResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/series/create-complete') && res.request().method() === 'POST'),
      page.locator('.btn-submit').click(),
    ]);
    const createBody = await createResponse.json();
    expect(createResponse.ok()).toBe(true);
    createdSeriesId = createBody.id;
    expect(createdSeriesId).toBeTruthy();

    // Confirm it actually persisted with the submitted name, via the real
    // API directly -- more reliable than searching the (ranked/paginated)
    // public catalog UI for a freshly-created, arbitrarily-ranked entry.
    const getResponse = await page.request.get(`http://localhost:3001/api/series/${createdSeriesId}`);
    expect(getResponse.ok()).toBe(true);
    const persisted = await getResponse.json();
    expect(persisted.data.name).toBe(seriesName);

    // --- Update: search for the just-created series, open it via the
    // admin edit button, change a field, and confirm the update persists.
    // The search toolbar lives on the Series tab, not the Admin tab.
    await page.locator('label[for="tab-1"]').click();
    await page.getByTitle('Search', { exact: true }).click();
    await page.locator('input[name="production_name"]').fill(seriesName);
    await page.locator('.form-container form input[type="submit"]').click();

    const card = page.locator('.card', { hasText: seriesName });
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.locator('.card-edit-btn').click();

    await expect(page.locator('#year')).toHaveValue('2024');
    await page.locator('#year').fill('2025');

    const [updateResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes(`/api/series/${createdSeriesId}`) && res.request().method() === 'PUT'),
      page.locator('.btn-submit').click(),
    ]);
    expect(updateResponse.ok()).toBe(true);

    const getAfterUpdate = await page.request.get(`http://localhost:3001/api/series/${createdSeriesId}`);
    const afterUpdate = await getAfterUpdate.json();
    expect(afterUpdate.data.year).toBe(2025);
  });
});
