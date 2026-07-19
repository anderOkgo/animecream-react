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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
