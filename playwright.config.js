import { defineConfig, devices } from '@playwright/test';

// E2E golden-path suite: drives the real built/dev app in a real browser
// against a real running module-api instance (see docs/specification-roadmap.md
// Phase 4) -- no mocking, same philosophy as the backend's own E2E suite.
// Requires: module-api running locally (see README.md), pointed at the real
// dev database. Not run in CI (no backend available there); local/manual only.
export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5180 --strictPort',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
    timeout: 30000,
    env: {
      // Points the app at a local module-api instead of production --
      // see src/helpers/apiConfig.js.
      VITE_API_BASE_URL: 'http://localhost:3001/',
    },
  },
});
