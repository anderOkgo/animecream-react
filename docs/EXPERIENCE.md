# What this repo has learned

Lessons from building and running `animecream-react`, gathered on 2026-11-05 from code comments, commit
messages (2021–2026) and `docs/specification-roadmap.md`. The global view of the app is in
`module-docs/apps/animecream/SPEC.md`; this file keeps what only matters here.

Each lesson says what happened, why, and what to do. Add a lesson when a change teaches one.

## React and hooks

- **A dependency array runs on every render, before any guard in the effect.** `navigation.currentState`
  crashed `Home.jsx`, `Tab.jsx` and `TablePagination.jsx`, three times, although each effect checked for it.
  Use optional chaining in the array too.
- **Depend on `navigation`'s fields, not on the object.** It is new on each render.
- **Copied files keep their history.** `data.service.js` came from Finanz and pointed at `api/finan/...`, routes
  this app never had; only `.boot()` was real. Delete what a copy doesn't use.
- **A dead-looking handler may mean a missing button.** `_handleTop100Click` stayed named that way to flag it,
  instead of guessing.

## Catalog and offline

- **Keep an immutable first snapshot.** `storage_initial` survives a filtered response overwriting `storage`, so a
  cold start offline still has the full catalog.
- **The offline filter must behave like the API.** `applyCatalogQuery` mirrors its `LIKE`, `BETWEEN`, genre `AND` and
  order. A change in the API's filters must change it too.
- **When the catalog is cached, use it.** Genres and demographics come from it with no network call; the API is the
  slow path.
- **A malformed cache entry falls through to the network.** Never let `JSON.parse` of old data break a screen.
- **Bad credentials are not an offline server.** Login must not call `setInit(false)` on a rejected password.

## Data seen from the front

- **A view can hide rows silently.** `view_all_info_produtions` used inner joins, so a series with no genres
  vanished from every read, with no error. It took an E2E of the admin flow to see it: test what a user just created.
- **A `Boolean('false')` is `true`.** The admin form sends back what `GET` returned, so `visible` must round-trip as
  a real boolean, or an unrelated edit hides a series.
- **Don't test "field provided" with truthiness.** A real `0` for chapters was dropped.

## Install and PWA

- **iOS Safari has no `beforeinstallprompt`.** It needs manual instructions; other iOS browsers run on its engine but
  have their own share menu.
- **Theme tokens can flip.** The install banner needed `--color-accent-green`, because `--text-invert` turned it
  unreadable in dark mode.
- **Navigation is network first; only hashed files are cache first.**
  `docs/changes/20261104-pwa-page-network-first.md` has the full story.
- **Bump the service worker before the build**, or `dist/sw.js` ships one version behind.

## SEO

- **Seed data goes stale.** 13 series in `initialData.js` pointed at old images after covers changed (2026-07-22).
  Treat it as derived data.
- **`set.json`'s `base_url` is the API, not this site.** The smoke check's first default was wrong because of it.

## Tests and CI

- **CI runners are slower.** Three `user-event` tests passed on a dev machine and timed out in Actions. Reproduce
  with a capped container (`--cpus=2 --memory=7g`), then raise the timeout to 15 s.
- **Don't cache npm in CI.** The cache restored native binaries for the wrong platform.
- **jsdom ignores a file input's value after `user.upload()`.** A required file blocks the click, so use
  `fireEvent.submit()`.
- **Mock children that have their own suite** when testing orchestrators like `Tab.jsx`.

## Open items

Known gaps are in `module-docs/apps/animecream/SPEC.md` §Gaps, not here.

**Last verified against source:** 2026-11-05
