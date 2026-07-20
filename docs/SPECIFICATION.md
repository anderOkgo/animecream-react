# Design Specification

**What this is**: the *generative* rules — how to shape new code so it belongs in this codebase, not a description of what already exists. `README.md` is descriptive ("here's how to run it"); this file is the remaining piece — the conventions an implementer (human or AI) must follow so that a from-scratch regeneration, or a new component bolted onto this one, *feels like* it was written by the same hand, not just renders the same pixels.

Every rule below was extracted by reading the actual code, not designed on a whiteboard. Where the codebase is internally inconsistent, that's recorded honestly in "Known deviations" at the end, rather than papered over. This document also cross-references `finan-react` — the sibling frontend, same author, same backend, built at a different time — wherever the two disagree on something a regenerator might assume is a shared convention. It isn't always one.

## 1. Component shape: `Components/<Name>/<Name>.jsx` + co-located `.css`

Every component lives in its own folder under `src/Components/`, named exactly like the component, containing `<Name>.jsx` and (if it has any non-trivial markup) `<Name>.css` imported directly at the top of the `.jsx` file — never a shared/global stylesheet reached into from a component that doesn't own it. A folder may hold more than one component if they're tightly coupled and only one is ever imported from outside (`MyLists/` holds only `ListManager.jsx` today — three sibling files that looked like alternate entry points, `MyLists.jsx`/`AddToListModal.jsx`/`ListView.jsx`, turned out to be dead code with zero real importers, found and deleted via Phase 4's E2E work — see `docs/specification-roadmap.md`).

Functional components only, no class components anywhere in this codebase. A component's props are destructured directly in the function signature (`function CardRow({ el, t, language, ... })`), never accessed via a `props` object.

**PropTypes are used, but inconsistently — not a project-wide convention.** 5 of ~25 components (`Login.jsx`, `Status.jsx`, `SearchSuggestions.jsx`, `TablePagination.jsx`, `TableSearch.jsx`) declare `.propTypes`; the rest don't, including components with equally complex prop surfaces (`AdminPanel.jsx`, `Home.jsx`). `prop-types` isn't even a declared dependency — it resolves today only because something else pulls it in transitively. One file (`Menu.jsx`) has a `Menu.propTypes = {...}` block, but it's commented out — dead code, not a real usage; don't count it. A new component should follow whichever of these two patterns its immediate neighbors use, not assume either is "the" convention — and shouldn't be the one to unilaterally decide the whole codebase should adopt PropTypes everywhere; that's a project-wide call, not a per-component one.

## 2. State management: prop-drilling, not Context — the one deliberate exception is `useLanguage`

Unlike `finan-react` (which uses a single `GlobalContext` pervasively — see that repo's `docs/SPECIFICATION.md` §2), **this app has no app-wide state Context**. `App.jsx` owns `init`/`role`/`showLogin`/`globalMessage` as local `useState`, and passes them down as explicit props through `Menu`/`Tab`/`Home`/`Card`/`CardRow` — real prop-drilling, several levels deep in places (`navigation`, `t`, `onAddToList` all thread through 3-4 component layers).

The **one exception** is `useLanguage.js`, which exports both the hook *and* a `LanguageContext`/`LanguageProvider` pair (wrapping the whole app in `main.jsx`) — language is the one piece of state genuinely needed at every leaf (every string on screen goes through `t()`), which is what earns it the Context treatment the rest of app state doesn't get. A new piece of truly global, every-component-needs-it state should follow this same bar before reaching for Context; anything narrower belongs as local state passed down explicitly, matching the rest of the app.

**Known asymmetry, not a bug**: this means adding a new prop that several distant components need (the way `navigation` or `t` already are) means threading it through every intermediate component's signature by hand — verbose, but consistent with how this app already works. Don't introduce a second Context to shortcut this without a reason as strong as `useLanguage`'s.

## 3. Hooks: `src/hooks/use<Name>.js`, one file per hook, plain functions

Every hook is `export const use<Name> = () => { ... }` in its own file, named `use<Name>.js` (note: **`.js`, not `.jsx`** — even though `finan-react`'s equivalent hooks use `.jsx`; neither hook file in either app renders JSX directly, this is a naming-convention divergence between the two sibling repos, not a functional one — see "Known deviations"). A hook returns a plain object of values/setters/callbacks; none of them return JSX.

`useLanguage.js` is the only hook that also exports a Context/Provider pair (§2). Every other hook (`useAlive`, `useTheme`, `useNavigationHistory`, `useSwipeableTabs`, `useTextToSpeech`, `useSearchSuggestions`) is self-contained — no hook-to-hook composition beyond React's own built-ins.

## 4. The `services/` layer: this app's only contract with `module-api`

`src/services/auth.service.js` and `src/services/data.service.js` are the *only* files allowed to know about authentication/session mechanics — everything else that talks to the backend does so directly via `helpHttp` + `API_BASE_URL` (see §5), which is a real, existing split: `services/` owns login/session state, ad-hoc `helpHttp.get/post/put` calls scattered across `Home.jsx`/`AdminPanel.jsx`/`SearchMethod.jsx`/`ListView.jsx` own everything else (catalog fetch, search, admin CRUD). **A new module needing session-aware requests should add a method to `auth.service.js` or a sibling `*.service.js` file, not invent a third pattern.**

**`data.service.js` was found to be a near-verbatim copy of `finan-react`'s finance-module client** (`totalBank`/`insert`/`update`/`del`/`balanceMonthly`, all pointing at `api/finan/...` endpoints that don't exist for this app) — confirmed dead except `.boot()`, and stripped down to just that during Phase 4's E2E work (see `docs/specification-roadmap.md`). This is exactly the class of mistake this section exists to prevent: **do not copy a sibling app's service file as a starting point without deleting what doesn't apply.**

Every real API call, wherever it lives, follows the same shape: `helpHttp.<method>(url, { body, token, timeout })`, checks `response?.err` on return (never a thrown exception for an expected API-level failure — `helpHttp` itself catches and returns `{ err }`), and reads/writes the JWT via `AuthService.getCurrentUser()` (§5's `cyfer`-encrypted `localStorage` entry).

## 5. `API_BASE_URL`, not `set.json`'s `base_url` directly

`set.json`'s `base_url` is hardcoded to production (`https://info.animecream.com/`) with no built-in override — added in Phase 4 (see roadmap) precisely because there was no way to point local dev/E2E at anything else without hand-editing this file. Every file that needs the API's base URL imports `API_BASE_URL` from `src/helpers/apiConfig.js` (`import.meta.env.VITE_API_BASE_URL || set.base_url`), never `set.base_url` directly. **A new file making its own HTTP calls must import from `apiConfig.js`, not read `set.json` for this field** — six existing files were migrated to this in Phase 4 specifically so this rule could hold everywhere at once, not just in the newest code.

`helpHttp.js` (`src/helpers/helpHttp.js`) is the one fetch wrapper — handles `FormData` vs. JSON bodies, `AbortController`-based timeouts, and normalizes `AbortError` into a readable `'Request timeout'` message. **This file has diverged from `finan-react`'s copy of the same name** (this version is strictly more capable — multipart upload support, timeout handling, richer error-message extraction — `finan-react`'s is an older, simpler version). Not unified across the two apps; see "Known deviations."

## 6. `localStorage` conventions

Every key is a plain string, no namespacing/prefix scheme beyond what's below — a new feature needing persistent client state should follow the nearest existing pattern rather than inventing a new naming style:

| Key(s) | Owner | Purpose |
|---|---|---|
| `cyfer().cy('user-in', formattedDate())` (a computed key, not a literal string) | `auth.service.js` | The logged-in user's JWT + response payload, `cyfer`-encrypted with `set.salt`. Computing the *key itself* from `cyfer` (not just the value) is deliberate obscurity, matching `finan-react`'s identical pattern. |
| `storage` / `storage_initial` | `catalogStorage.js` | Offline-first catalog cache — `storage` is the mutable "last successful fetch," `storage_initial` is an immutable first-load snapshot preferred on cold start (see `getCachedFullCatalog`'s fallback order). Both `cyfer`-encrypted. |
| `options_genres` / `options_demographics` (+ `*_ts` timestamp siblings) | `Home.jsx`, `AdminPanel.jsx`, `SearchMethod.jsx` | 24h-TTL cache for the two rarely-changing lookup lists, read/written independently by three different components — not centralized behind one helper today (a real duplication, not yet worth a shared module at this scale). |
| `list_<timestamp>` (one key per list) | `ListManager.jsx` | User-created "My Lists" — `{ name, items: [{id, name}] }`. The timestamp-as-id means two lists created in the same millisecond would collide; not observed in practice, not guarded against. |
| `selectedListId` | `Tab.jsx` | Which list is currently active for one-click "add to list" (see `docs/specification-roadmap.md`'s Phase 4 MyLists E2E notes). |
| `lang`, `themePreference` | `useLanguage.js`, `useTheme.js` | Explicit user overrides of the system default; presence of the key (not its value alone) distinguishes "user chose this" from "following the system," per both hooks' double-click-to-toggle-default UX. |

## 7. Testing: Vitest (unit/component) + Playwright (E2E), never mixed in one file

Unit/component tests live in `__tests__/` folders next to the file they cover (`src/Components/Foo/__tests__/Foo.test.jsx`, `src/helpers/__tests__/foo.test.js`), run via `npm test`/`npm run test:cov`, mock at the module boundary (`vi.mock`) rather than reaching into implementation details. E2E specs live in `test/e2e/*.spec.js`, run via `npm run test:e2e` (never picked up by Vitest — see `vite.config.js`'s `test.exclude`), and follow one hard rule established across all four existing specs: **no mocking the backend** — every E2E test drives the real built app against a real running `module-api` instance, the same "prove it end to end for real" philosophy `module-api`'s own E2E suite uses. A test needing to mutate real, shared dev data (`admin.spec.js`, the only one that does) uses a distinctively-named, disposable fixture and cleans it up itself (`afterEach`), matching `module-api`'s own `__E2E_TEST_SERIES_<timestamp>__`-style convention.

## Known deviations (tracked here so a regeneration doesn't copy them as if they were intentional)

| Deviation | Where | Disposition |
|---|---|---|
| Hook files use `.js`, `finan-react`'s use `.jsx`, for the same kind of file | This repo vs. `finan-react` | Not unified — cosmetic, not functional (neither app's hooks render JSX). A regenerator should pick one extension convention per app, not assume it's shared across the two sibling repos. |
| `helpHttp.js` has diverged from `finan-react`'s copy (this one gained multipart/timeout/richer-error-message support, `finan-react`'s didn't) | Both repos | Not synced. `finan-react`'s version is the one to catch up, if this is ever revisited — this repo's is strictly more capable. |
| PropTypes used on 5/~25 components, not the rest; `prop-types` isn't a declared dependency | This repo | Left as-is (see §1) — not a convention to extend to every component, not worth ripping out of the 5 either. |
| `data.service.js` was a dead/wrong copy of `finan-react`'s finance-module client | This repo | **Fixed** in Phase 4 (2026-07-19) — stripped to just `.boot()`, the only method anything actually calls. |
| `Table.jsx`, `MyLists.jsx`, `AddToListModal.jsx`, `ListView.jsx` were fully orphaned (zero real importers) | This repo | **Fixed** — deleted during Phase 2.5/Phase 4 (see `docs/specification-roadmap.md`). |

---

**Companion documents**: `README.md` (how to run/test/deploy), `docs/specification-roadmap.md` (how and why any of this changed, day by day, including every bug this document's rules were extracted while fixing).

**Last verified against source**: 2026-07-19
