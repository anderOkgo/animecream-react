import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  // @vitejs/plugin-react-swc's fast-refresh transform assumes a dev-server
  // request URL and breaks under Vitest's jsdom environment (no fast refresh
  // is needed for a one-shot test run anyway) -- skip it when running tests,
  // esbuild's default automatic JSX transform covers .jsx compilation instead.
  plugins: process.env.VITEST ? [] : [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    // test/e2e/*.spec.js are Playwright specs (run via `npm run test:e2e`,
    // a separate process/API) -- Vitest's default include glob also
    // matches `*.spec.js`, so without this it tries to run them too and
    // fails immediately on Playwright's `test`/`expect` imports.
    exclude: ['node_modules/**', 'test/e2e/**'],
    // GitHub Actions' shared runners are far more CPU-constrained than a
    // dev machine -- user-event-driven tests (real keystroke/click timing
    // simulation) reproducibly blew past Vitest's 5000ms default under a
    // `--cpus=2` Docker container matching the runner, even though nothing
    // is actually wrong. Confirmed via that reproduction before raising
    // this, not a guess.
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Set from the real aggregate after Phase 2.5's coverage-hardening
      // pass (see docs/specification-roadmap.md) with a few points of
      // margin below the actual numbers at the time -- gates a real
      // regression (e.g. a large untested file added) without going
      // flaky on normal day-to-day fluctuation.
      thresholds: {
        statements: 70,
        branches: 58,
        functions: 75,
        lines: 72,
      },
    },
  },
})
