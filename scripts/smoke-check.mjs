#!/usr/bin/env node
/**
 * Standalone post-deploy smoke check -- drives a real Chromium browser
 * against a *deployed* instance of this SPA (not the dev server, not a
 * mock) and confirms the bundle actually boots and its key UI renders.
 * This is the frontend analogue of module-api's scripts/smoke-test.js,
 * scoped the same way: "does the deployed bundle work", not full
 * behavioral coverage (that's test/e2e/'s job, run pre-deploy against a
 * local backend). See docs/specification-roadmap.md, Phase 4.
 *
 * A plain HTTP fetch can't do this check: this app is a client-rendered
 * SPA, so the raw HTML response is just the empty #root shell -- only a
 * real browser executing the bundle can confirm the catalog actually
 * renders from a real module-api response.
 *
 * Read-only: never logs in, never mutates data. Confirms structural
 * presence of the login entry point, not a real login (that needs real
 * credentials and belongs to test/e2e/auth.spec.js instead).
 *
 * Usage:
 *   node scripts/smoke-check.mjs [url]
 *   SMOKE_URL=https://animecream.com/ node scripts/smoke-check.mjs
 *   npm run smoke -- https://animecream.com/
 *
 * Defaults to the real production frontend (https://animecream.com/) --
 * note this is deliberately *not* set.json's `base_url`, which is the
 * module-api backend's URL (https://info.animecream.com/), not this app's.
 *
 * Exit code 0 if every check passes, 1 otherwise -- suitable as a deploy-
 * pipeline gate.
 */

import { chromium } from '@playwright/test';

const url = process.argv[2] || process.env.SMOKE_URL || 'https://animecream.com/';

const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (error) {
    results.push({ name, ok: false, error: error.message || String(error) });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${error.message || error}`);
  }
}

async function main() {
  console.log(`\nSmoke checking ${url}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await check('page loads and responds', async () => {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response || !response.ok()) {
      throw new Error(`expected a 2xx response, got ${response && response.status()}`);
    }
  });

  await check('React app mounts into #root', async () => {
    const root = page.locator('#root');
    await root.waitFor({ state: 'attached', timeout: 10000 });
    const hasChildren = await root.evaluate((el) => el.childElementCount > 0);
    if (!hasChildren) throw new Error('#root is empty -- the bundle did not mount');
  });

  await check('renders real series data from module-api (catalog cards)', async () => {
    const cards = page.locator('.card');
    await cards.first().waitFor({ state: 'visible', timeout: 15000 });
    const count = await cards.count();
    if (count === 0) throw new Error('no .card elements rendered');
  });

  await check('a card shows a non-empty title and an image with a real src', async () => {
    const firstCard = page.locator('.card').first();
    const title = await firstCard.locator('h2').first().textContent();
    if (!title || !title.trim()) throw new Error('first card has no title text');
    const src = await firstCard.locator('img.img-card').getAttribute('src');
    if (!src) throw new Error('first card has no image src');
  });

  await check('the search UI is present', async () => {
    // SearchMethod's <form> only mounts once its toggle is opened, but its
    // wrapping .toggle-search container is always rendered -- checking for
    // that (rather than clicking through) keeps this check read-only.
    await page.locator('.toggle-search').first().waitFor({ state: 'attached', timeout: 5000 });
  });

  await check('the login entry point is structurally present (no real login attempted)', async () => {
    await page.getByText('Session', { exact: true }).hover();
    const loginLink = page.getByRole('link', { name: 'Login' });
    await loginLink.waitFor({ state: 'visible', timeout: 5000 });
  });

  await check('no uncaught JS errors during load', async () => {
    if (consoleErrors.length > 0) {
      throw new Error(`console/page errors: ${consoleErrors.slice(0, 3).join(' | ')}`);
    }
  });

  await browser.close();

  console.log('');
  const failed = results.filter((r) => !r.ok);
  const passed = results.length - failed.length;
  console.log(`${passed}/${results.length} checks passed.`);

  if (failed.length > 0) {
    console.log('\nFailed checks:');
    failed.forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\nSmoke check crashed unexpectedly:', error.message);
  process.exitCode = 1;
});
