# Coverage gate at 100%

**Date:** 2026-11-14 · **Branch:** `feature/20261114-animecream-coverage-100` · **Released in:** https://animecream.com, 2026-11-14 (sw.js 3.3.34, with `20261114-animecream-g14-g15`)
**Implements:** `module-docs/apps/animecream/SPEC.md` v0.7.2, gap G11 (backlog B4)
**Change ID:** `20261114-animecream-coverage-100`

## Summary
The unit coverage gate goes from 70 / 58 / 75 / 72 % (statements / branches / functions / lines) to the
playbook's 100% on all four, measured over every file of `src/`. Most of the change is tests. Nine production
files lose branches that no test could reach. The owner asked for that on 2026-11-14 ("change code but keep
backward compatibility"), on the condition that behavior stays the same. Each removal is explained in a code
comment next to it.

## What was hidden
The old gate measured only the files some test loaded: with Vitest 4, coverage without `include` leaves out
every file no test imports. Measured over all of `src/` (minus `main.jsx`, which only mounts the app), 727 of
2,585 lines, 895 of 2,153 branches and 133 functions had no test. The largest gaps were `Home.jsx`
(307 lines / 340 branches), `AdminPanel.jsx` (127 / 200), `App.jsx` (77 / 64) and `helpers/helpHttp.js`
(55 / 48). The config now sets `include` and `exclude` as `bitacora-react` and `finan-react` do.
`scripts/` are build tools and are left out.

## Result
| | Before (all of `src/`) | After (all of `src/`) |
|---|---|---|
| Test files / tests | 34 / 307 | 49 / 530 |
| Statements | — | **100%** (2,669 / 2,669) |
| Branches | 58.4% (1,258 / 2,153) | **100%** (1,932 / 1,932) |
| Functions | — | **100%** (531 / 531) |
| Lines | 71.9% (1,858 / 2,585) | **100%** (2,494 / 2,494) |

The totals are lower after the change because the removed branches are gone.

New suites:
- Helpers: `helpers/__tests__/helpHttp.test.js`, `catalogStorage.edges.test.js`.
- Hooks: `hooks/__tests__/useAlive.recovery.test.jsx` (ported from Finanz's twin hook),
  `useNavigationHistory.flow.test.js`, `useLanguage.provider.test.jsx`.
- App: `src/__tests__/App.test.jsx`.
- Components: `InstallPrompt.test.jsx`, `Card.numbers.test.jsx`, `CardRow.edges.test.jsx`, `Tab.more.test.jsx`,
  `ListManager.edges.test.jsx`, `AdminPanel.load.test.jsx`, `AdminPanel.submit.test.jsx`,
  `Home.flows.test.jsx`, `Home.seed.test.jsx`.

Extended: `Login`, `TableSearch`, `RangeFilter`, `Menu`, `TablePagination`, `SearchMethod`, `useInstallPrompt`,
`useSwipeableTabs`, `auth.service`, `useSearchSuggestions`, `Home`.

## Production edits: unreachable branches removed, behavior unchanged
Playbook §4.4 treats dead-code cleanup as a change the owner must ask for, and the owner asked for it here. No
branch below could run, so removing it changes nothing a user can see. The callers named below are the only
ones; this was checked with `grep` over `src/`.

| File | Removed | Why it is the same |
|---|---|---|
| `hooks/useAlive.js` | `typeof navigator` guard on the initial state (`useState(() => navigator.onLine)`); the mount effect's `if` before `boot(true)` | The app runs only in a browser. The effect runs only at mount (twice in a row under `StrictMode` in development), before any boot has answered, so the ref is always `false` there |
| `hooks/useNavigationHistory.js` | `if (currentState)` in `pushHistory` | The index always points at an entry: pushes cut the history at it, and popstate keeps it in range |
| `Card/Card.jsx` | `if (data)` in an effect | Home renders `Card` only with a non-empty list. A test shows that without data, `Card` already fails during render, before the effect |
| `Menu/Menu.jsx` | The ref check in the outside-click listener, now a `useLayoutEffect` (as in Finanz) | React removes a layout effect's listener in the unmount commit, before it detaches the ref |
| `SearchMethod/SearchMethod.jsx` | `if (scrollContainer)` | The container falls back to `document.documentElement`, which always exists |
| `Tab/Tab.jsx` | `getScrollContainer` reduced to `sectionTabRef.current \|\| document.querySelector('.section-tab')`; the guards in the two scroll handlers, in `addSeriesToSelectedList` and in the Top 250 click | Same element. Home hands over its `setOpt` at mount, before any button can be pressed |
| `MyLists/ListManager.jsx` | Guards on delete, drop, remove, load, copy, share and add-all | The UI only offers those actions when their target exists |
| `Admin/AdminPanel.jsx` | 25 `if (setProc)` and 18 `if (setGlobalMessage)` guards, two `if (onEditComplete)`, the repeated create-without-image check, `if (fileInput)` | `Tab` always passes all three props. `#image` is always rendered. The image check already ran a few lines above |
| `Home/Home.jsx` | The guards on `onSeriesDataChange` (9), `setSortOrder` and `onSetOptReady` | `Tab` always passes all three |
| `Home/Home.jsx` | The fallback when restoring the initial history entry without a first catalog (re-read the cache, else clear the list) | `initialDbRef` starts as `initialSeed` (the cache or 10 bundled series, never empty) and is only ever replaced by another catalog |
| `Home/Home.jsx` | `if (!db) return null` in `filteredDb`, `if (source)` and `source ? … : []` on the offline paths, `\|\| db` | `db` is never empty-valued (once the fallback above is gone, nothing sets it to `null`), so the catalog source is always a list |
| `Home/Home.jsx` | Checks in `formatHttpErrMessage` / `resolveAppError` for a missing payload, a missing `err` or another type | Payloads are only set as `{ type: 'i18nKey' }` or `{ type: 'http', err }`, with the API's `err` object, and are resolved only when present |
| `Home/Home.jsx` | `\|\| 'Cerrar'` after `translate('closeAdvancedSearch')`; `maxYear ? … : maxDecade` | The key is translated in both languages. `maxYear` is always a year, never 0 |

## Bugs found during development
Neither bug is fixed here, because fixing them would change behavior. Both were recorded as gaps in the spec. The
owner chose to fix both (P6, P7), and they are fixed in `20261114-animecream-g14-g15.md`:
- **G14, a swipe is lost on a re-render.** `useSwipeableTabs` keeps `startX` in a plain `let` inside the hook,
  so a re-render between touch start and touch end resets it and the swipe does nothing. Finanz's twin hook uses
  `useRef`.
- **G15, an unexpected catalog answer breaks the page.** If the API answers the catalog or a search with
  something that is neither a list nor `{ data: list }`, Home keeps that value as the catalog (and stores it in
  the cache on the initial load), and the page fails to render. `Home.flows.test.jsx` pins this behavior. The
  list-by-ids paths already catch it and show an error.

Notes for whoever writes the next tests:
- `LanguageProvider` writes `document.title` and the description meta. jsdom has neither tag in `<head>`, so it
  rewrites the first ones in the document. The Home suites read the SEO title and description from
  `og:title` / `og:description` instead.
- If `loadByIds` arrives at mount together with a cached catalog, the initial load replaces the list right
  after. `Tab` starts `loadByIds` as `null`, so the app never does this, and the tests send the list after
  mount.
- Several `Tab` components in one document share the radio name and form one group: render one at a time.

## Verification
- `npx vitest run --coverage`: 49 files, 530 tests, green. Coverage is 100% on statements, branches, functions
  and lines, and the gate is 100 on all four.
- `npm run lint` (zero warnings) and `npm run build` pass.
- `npm run test:e2e` (Playwright): **5/5** against a local `module-api` and the local Docker MariaDB
  (`animecream-mariadb`, no real data), email disabled, 2026-11-14. Covers catalog, login, My Lists lifecycle
  and admin create.

## Files
- Modified (production): `src/hooks/useAlive.js`, `src/hooks/useNavigationHistory.js`,
  `src/Components/Card/Card.jsx`, `Menu/Menu.jsx`, `SearchMethod/SearchMethod.jsx`, `Tab/Tab.jsx`,
  `MyLists/ListManager.jsx`, `Admin/AdminPanel.jsx`, `Home/Home.jsx`.
- Modified (config): `vite.config.js` (coverage `include`, `exclude`, thresholds 100).
- Created / modified: the test files listed under Result.

## Release and rollback
Front only, with no API or data change: after the merge, run `npm run bup`. Rollback: revert the PR and deploy.

## Version history
| Date | Change |
|---|---|
| 2026-11-14 | Created: gate at 100% on all four, unreachable branches removed with behavior unchanged, G14 and G15 found |
| 2026-11-14 | Merged (PR #8) and deployed with PR #9: sw.js 3.3.34, production serves bundle `index-feb1b7f3.js` |
