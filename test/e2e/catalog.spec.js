import { test, expect } from '@playwright/test';

// Public, unauthenticated golden path: no mocking, drives the real built
// app in a real browser against a real running module-api instance (see
// playwright.config.js and docs/specification-roadmap.md Phase 4).
test.describe('Public catalog (no auth, read-only)', () => {
  test('loads the home page and renders real series data from module-api', async ({ page }) => {
    await page.goto('/');

    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('shows a series title and image sourced from the real catalog', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    // Each card renders its title in two tab panels (compact + full view);
    // .first() targets the compact one, not asserting on both.
    await expect(firstCard.locator('h2').first()).not.toBeEmpty();
    await expect(firstCard.locator('img.img-card')).toHaveAttribute('src', /.+/);
  });
});
