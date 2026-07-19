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
npm run test:e2e  # playwright test (see docs/specification-roadmap.md, Phase 4 -- not written yet)
```

All three (`lint`, `test:cov`, `build`) run in CI on every push/PR to `main` — see `.github/workflows/ci.yml`.

## Deploy

`npm run up` bumps the service-worker version and syncs the built assets to production over FTP (`com/db-sync-FTP-both.bat`, requires local FTP credentials). `npm run bup` does `build` + `up` in one step.

## Docs

`docs/specification-roadmap.md` tracks the ongoing effort to make this codebase's test suite precise enough to serve as an executable specification (mirrors the sibling `finan-react` and backend `module-api` repos' roadmaps) — read it for the current state of testing/coverage/CI and what's still open.
