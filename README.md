# animecream-react

React (Vite) frontend for [animecream.com](https://animecream.com). Pure HTTP client of `module-api`'s `series` module — no server-side logic, no database.

## Development

```bash
npm install
npm run dev      # local dev server (vite)
npm run build    # production build -> dist/
npm run preview  # preview a production build locally
```

## Quality gates

```bash
npm run lint      # eslint src --ext js,jsx --max-warnings 0
npm run test      # vitest run
npm run test:cov  # vitest run --coverage
npm run test:e2e  # Playwright, against a real local module-api -- see below
```

`lint`, `test:cov`, and `build` run in CI on every push/PR to `main` — see `.github/workflows/ci.yml`. `test:e2e` does **not** run in CI (no backend available there); it's local/manual only.

### Running the E2E suite

`test/e2e/` drives the real app in a real browser against a real running `module-api` instance — no mocking, same philosophy as `module-api`'s own E2E suite. Requires:

1. Docker Desktop running, with the `animecream-mariadb` container up (`docker ps` should show it).
2. `module-api` built and running locally: `cd ../module-api && npm run build && node dist/index.js` (listens on `http://localhost:3001`).
3. `npm run test:e2e` — this automatically starts the Vite dev server on port 5180 with `VITE_API_BASE_URL=http://localhost:3001/` (see `src/helpers/apiConfig.js`), overriding `set.json`'s production default.

The admin-login test needs real credentials: copy `.env.e2e.local.example` to `.env.e2e.local` (gitignored) and fill in a real account. Without it, that test is skipped automatically — the public catalog tests still run.

## Deploy

`npm run up` bumps the service-worker version and syncs the built assets to production over FTP (`com/db-sync-FTP-both.bat`, requires local FTP credentials). `npm run bup` does `build` + `up` in one step.

## Docs

`docs/specification-roadmap.md` tracks the ongoing effort to make this codebase's test suite precise enough to serve as an executable specification (mirrors the sibling `finan-react` and backend `module-api` repos' roadmaps) — read it for the current state of testing/coverage/CI and what's still open.
