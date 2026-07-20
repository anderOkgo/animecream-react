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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
