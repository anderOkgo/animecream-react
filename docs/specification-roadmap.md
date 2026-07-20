# Executable Specification Roadmap

## Goal

Turn this codebase into a base solid enough to produce an **executable specification**: documentation precise enough that an AI (or a new developer) could regenerate this frontend from scratch, using an automated test suite (unit/component, and browser-driven E2E) as the acceptance criteria the regenerated app must pass.

This roadmap mirrors the one already executed for the backend (`module-api/docs/specification-roadmap.md`), adapted for a frontend that has **no test tooling installed at all today** — Phase 0 here starts one step earlier than the backend's did: choosing and installing a stack, not triaging failures in an existing one.

## Cross-repo context

This app is a pure HTTP client of `module-api`'s API (see that repo's `docs/architecture.md` / `docs/SPECIFICATION.md` for the wire contract it consumes). It owns no server-side logic, no database, no SQL — so several backend-roadmap phases (cross-repo SQL hardening, schema-drift sweeps, transaction handling) simply don't apply here. What this app *does* own and needs its own acceptance criteria for: component rendering/interaction logic, hooks, the `services/` HTTP layer, `localStorage`-backed state (`catalogStorage.js`, auth token), and the encrypt/decrypt helper (`helpers/cyfer.js`).

## Status legend

`TODO` not started · `IN PROGRESS` · `DONE` · `BLOCKED` (needs a decision)

---

## Phase 0 — Baseline audit

**Status: DONE** (2026-07-19)

- **No test runner is installed.** `package.json` has no `test` script and no `jest`/`vitest`/`@testing-library/*` in `devDependencies` — only `react`, `react-dom`, `@fontsource/roboto`, `react-helmet-async` as runtime deps, and `vite`/`@vitejs/plugin-react-swc`/`eslint*` as dev deps.
- **One orphaned test file already exists and cannot run:** `src/Components/CardRow/__tests__/CardRow.test.jsx` imports `@testing-library/react` (not installed) and calls `jest.mock(...)` (no Jest configured, no `jest.config.*` anywhere in the repo). It has presumably never executed since it was added — a real, silent gap, same class of issue as the backend's "0/0 excluded" coverage artifacts, except here the file can't even be picked up by any command that exists today.
- **No lint script and no ESLint config file**, despite `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` all being installed as dev dependencies. Unlike `finan-react` (which has `.eslintrc.cjs` + a `lint` script), this repo's lint tooling is present but entirely unwired.
- **No CI** — `.github/workflows` absent, nothing gates `main` on anything.
- Inventory: 25 component files (`src/Components/**/*.jsx`), 7 hooks (`src/hooks`), 6 helpers (`src/helpers`), 3 services (`src/services`).
- Build itself works (`npm run build` via `vite build`) — this is not a broken app, just an untested one.

---

## Phase 0b — Choose and install the testing stack

**Status: DONE** (2026-07-19)

Decision: **Vitest**, not Jest — this project already runs on Vite; Vitest reuses `vite.config.js` directly (same resolver, same SWC/JSX transform), needs no separate transform pipeline, and exposes a Jest-compatible `vi.mock`/`describe`/`it` API, which made adopting the existing orphaned `CardRow.test.jsx` a matter of installing dependencies and swapping `jest.mock` → `vi.mock`, not a rewrite.

Installed: `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@playwright/test` (for Phase 4). Added a `test` block to `vite.config.js` (`environment: 'jsdom'`, `globals: true`, `setupFiles: ['./test/setup.js']`, v8 coverage), `test/setup.js` (imports `@testing-library/jest-dom/vitest`), and `test`/`test:watch`/`test:cov`/`test:e2e`/`lint` scripts in `package.json`.

**Real friction hit and fixed:** `@vitejs/plugin-react-swc`'s fast-refresh transform throws (`TypeError: The argument 'filename' must be a file URL object...`) under Vitest's jsdom environment — it assumes a real dev-server request URL that doesn't exist in a one-shot test run. Fixed by skipping the plugin when `process.env.VITEST` is set (Vitest sets this automatically); esbuild's default automatic JSX transform covers `.jsx` compilation for the test run instead, with zero effect on `dev`/`build` (which still use the real plugin).

Also wrote the missing `.eslintrc.cjs` (ESLint was installed but had no config, matching `finan-react`'s existing pattern) and a test-file override (`env: { jest: true }`) so Vitest's `describe`/`it`/`expect` globals lint cleanly.

---

## Phase 1 — First green baseline

**Status: DONE** (2026-07-19)

Fixed the orphaned `CardRow.test.jsx`: swapped `jest.mock`/`jest.fn` → `vi.mock`/`vi.fn`, then triaged each assertion against the real component (same correct-vs-stale judgment call as the backend's Phase 1) —

| Test | Finding | Resolution |
|---|---|---|
| "renders the read aloud button" / "shows correct button title" | Stale: asserted `getByText('Read Aloud')`, but the button is an icon (`▶`/`⏸`) with the translated label only in `title`, not visible text — the component evolved to an icon+tooltip pattern after the test was written | Switched to `getByTitle(...)` |
| "uses English/Spanish description" | Stale: asserted a single `getByText(...)` match, but the description renders twice (once per tab panel) by design | Switched to `getAllByText(...)` + length assertion |

Wired ESLint (wrote `.eslintrc.cjs`, see Phase 0b) and ran it for the first time ever against this codebase: **254 problems** initially. Turned off `react/prop-types` project-wide (only 1 of ~25 components uses PropTypes at all, and `prop-types` isn't even a declared dependency — enforcing it now would mean annotating every other component from scratch, out of scope for "wire up the linter"). That brought it to 74, then real fixes closed the rest — see "Findings from the first lint pass" below.

Confirmed: `npm run test`, `npm run lint`, `npm run build` all pass from the current working tree.

### Findings from the first lint pass (real bugs and dead code, not just style)

- **`useLanguage.js` had duplicate object keys with diverging values** (`no-dupe-keys`) — the `en` and `es` translation objects each had two separate blocks defining the same ~10 validation-message keys (`'ID must contain valid numbers separated by commas.'`, `'Production name must be...'`, etc.). In `en` both blocks were identical pass-through strings (no information lost), but in **`es` the two blocks had genuinely different wording** (e.g. `'El nombre de la producción debe ser una cadena de texto con una longitud máxima de 50 caracteres.'` vs. the shorter `'El nombre debe ser texto de máximo 50 caracteres.'`) — since JS object literals silently let the later key win, the second block's wording was already the one taking effect and the first block's text was silently unreachable dead code. Removed the shadowed first-block entries in both languages; zero behavior change (kept exactly what already won at runtime), just made it not a footgun for the next edit. Same fix applied to a duplicated `search` key.
- **Two components (`Tab.jsx`'s `handleTop100Click`, `chartOptions.js`-equivalent doesn't apply here) had fully-implemented-but-never-wired handlers** — `Tab.jsx` defines `handleTop100Click` (mirrors the working `handleTop250Click`, and both `Home.jsx`'s `/top100` route effect and the history-restore switch already anticipate a `'top100'` request type), but no `.lang-top100` UI element next to the existing `.lang-top250` one calls it. Left in place (renamed `_handleTop100Click` to document the gap without guessing at the missing button's placement/label), same class of finding as the backend roadmap's Phase 2.6 `validateInitialLoad` — flagged for a product decision, not silently deleted or silently invented.
- **`App.jsx` had a fully dead `username` state** — `setUsername(...)` was called on every auth-check, but the `username` value itself was never read anywhere (no display, no prop). Removed both the state and its setter calls; `role` (which *is* consumed) was left untouched.
- **`useAlive.js`'s `online` state is set but never returned/exposed** by the hook — `setOnline` is called throughout the online/offline/visibility-change handling, but no consumer of `useAlive()` can read it. Kept the state (still useful internal bookkeeping, and deleting it would touch a lot of event-handling logic to verify safety), renamed to `_online` to document that this is a known, not-yet-decided gap rather than an oversight.
- **Real dead code removed** (Phase-2-style, done inline since ESLint caught it directly): unused `React` default imports in 11 files (JSX runtime is `automatic`, so the import was never needed with this plugin), an unused `navigation` prop in `CardRow.jsx`, an unused `Jumbotron` import in `App.jsx` (only referenced inside a commented-out JSX line), and an unused `Message` import + `resolveApiError` helper in `AdminPanel.jsx` (superseded by the `setGlobalMessage` callback pattern used everywhere else in that file).
- **Two unknown-DOM-property lint errors, one real bug and one plugin-version gap:** `CardRow.jsx` had `variant="text"` on a plain `<span>` (dead MUI-style prop with zero effect on a native element — removed) and `fetchpriority="high"` on an `<img>` (a real, valid browser attribute, just newer than this installed `eslint-plugin-react` release's known-properties list — corrected to the camelCase `fetchPriority` React expects and scoped-disabled the lint rule for that one line with a comment explaining why, rather than downgrading the rule project-wide).
- **8 `react-hooks/exhaustive-deps` warnings, all reviewed individually, none blindly "fixed" by adding the missing dependency** — in every case the omitted dependency was either an object recreated with a new identity every render (`navigation`) or a function/value already redundant with a more specific dependency already in the array (e.g. `navigation.currentState` already covers what `navigation` would add). Blindly adding these would risk introducing infinite re-render loops without deep per-effect verification, which is out of scope for a lint-wiring pass — each got a scoped `eslint-disable-next-line` with a one-line rationale instead, matching the backend roadmap's principle of not touching behavior without being sure.

---

## Phase 2 — Dead code sweep

**Status: IN PROGRESS** — the ESLint-driven findings above already covered several concrete cases (see Phase 1's findings table) as a side effect of wiring the linter. What Phase 1 did *not* do: a systematic basename-grep sweep across every `src/` file the way the backend's Phase 2 did (which catches whole-file dead code that ESLint's per-file analysis can't see, e.g. a component nobody imports at all).

Remaining: for every file under `src/`, grep for import-by-basename references from any other file, excluding `main.jsx`/`App.jsx` as entry points. No path aliases are configured in `vite.config.js`, so basename-grep should catch all real edges here too. Manually verify each candidate (barrel exports, conditional dynamic imports) before deleting.

---

## Phase 2.5 — Coverage hardening

**Status: IN PROGRESS** (2026-07-19)

Added dedicated test suites for all of `src/helpers/`'s pure-logic files: `searchUtils.js` (AND/OR search parsing, suggestion generation), `catalogStorage.js` (the offline query engine mirroring the backend's `series-read` filter/sort/limit rules — the single highest-value file in `helpers/`, given how much filter logic it reimplements client-side), and `cyfer.js` (encrypt/decrypt round-trip, diacritic-stripping, key-cycling, and the `dcy` negative-intermediate-value correction branch — same test suite as `finan-react`'s identical copy of this helper, see that repo's roadmap for the design note on why each test uses a fresh `cyfer()` instance per `cy`/`dcy` call rather than reusing one across both).

Result: **`src/helpers/` at 98.09% statements / 92.85% branches**, and the project-wide aggregate went from 22% to **79.49% statements / 70% branches** (the remaining gap is almost entirely `CardRow.jsx`, the one component file with tests today — component-level testing hasn't started yet, this phase focused on pure-logic files first per the original plan's priority call).

Remaining: the other 24 component files (0% today), the other 6 hooks, and the 3 services (`auth.service.js`, `data.service.js`, `data.local.service.js`) — deferred to a follow-up pass; a 100% target may still not be the right call for purely presentational JSX branches once component testing starts.

---

## Phase 3 — CI gate

**Status: DONE** (2026-07-19)

Added `.github/workflows/ci.yml`: checkout → `npm ci` → `npm run lint` → `npm run test:cov` → `npm run build`. Runs on every push to `main` and every PR targeting `main`. Verified `npm ci` installs cleanly from the current `package-lock.json` and every step passes locally. No coverage threshold set yet (deferred to Phase 2.5, same dependency the backend roadmap's Phase 3 had on its own Phase 2.5) — today this gate catches lint errors, test failures, and build breakage, not coverage regressions.

---

## Phase 4 — Executable specification layers

**Status: TODO**

1. **`docs/SPECIFICATION.md`** — generative design rules: component/folder conventions (`Components/<Name>/<Name>.jsx` + co-located `.css`), hook conventions, the `services/` HTTP-client layer's contract with `module-api`, `localStorage` usage conventions (`catalogStorage.js`, auth token, `cyfer.js` encryption), context/state conventions.
2. **Playwright E2E** (`test/e2e/` or `e2e/`) — drives the real built app in a real browser against a real running `module-api` instance (mirrors the backend's E2E-against-real-DB philosophy: no mocking the thing you're trying to prove works end to end). Covers the golden paths: browse/search catalog, login, admin CRUD via `AdminPanel`, `MyLists` create/add/remove.
3. **Post-deploy smoke check** — a small script (Playwright in headless mode, or even a plain script hitting the deployed URL) that confirms the built site actually loads and its key routes render after `npm run up` ships it — the frontend analogue of the backend's `scripts/smoke-test.js`, scoped to "does the deployed bundle work," not full behavioral coverage (that's Playwright E2E's job, run pre-deploy).

---

## Progress log

- **2026-07-19** — Phase 0 baseline audit completed at the user's request, extending the executable-specification approach already applied to `module-api` to this frontend. Roadmap drafted.
- **2026-07-19, same day** — Phases 0b, 1, and 3 executed in full: Vitest + Testing Library + Playwright installed, the orphaned `CardRow.test.jsx` fixed and passing (5/5), ESLint wired from scratch and brought to a clean pass (254 → 0 problems, with real bugs fixed along the way — see Phase 1's findings table), and a CI workflow added. `npm run lint`, `npm run test:cov`, and `npm run build` all pass from the current working tree. Committed and pushed (`48702fa`).
- **2026-07-19, later same day** — Phase 2.5 started: added `searchUtils.test.js`, `catalogStorage.test.js`, and `cyfer.test.js`, bringing `src/helpers/` to 98.09% statements / 92.85% branches and the project-wide aggregate from 22% to 79.49% statements (56/56 tests passing). Component-level and service-level testing remain open for a follow-up pass.
