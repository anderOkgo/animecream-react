# The offline filter answers like the API (G2), and one cache for genres and demographics (G6)

**Date:** 2026-11-15 · **Branch:** `feature/20261115-animecream-gaps` · **Released in:** not yet
**Implements:** `module-docs/apps/animecream/SPEC.md` v0.8 — G2 (P8), G6 (P10)
**Change ID:** `20261115-animecream-gaps` (the same in `module-api` for G3 and in `finan-react` for G9)

## Summary
- **G2:** a parity check, `npm run parity` (`scripts/offline-parity.mjs`), sends the same searches to the local API
  and to the offline filter and compares the ids in order. It found two real differences, now fixed in
  `applyCatalogQuery`: text is compared like the database's `utf8_spanish_ci` (case and accents ignored, ñ its own
  letter), and with no order named the result is newest id first, as the API's `ORDER BY id DESC`.
- **G6:** genres and demographics are cached through one helper, `src/helpers/optionsCache.js`, 24 hours for every
  screen. Before, Admin and Search kept them forever.

## Critical constraints discovered
- **The offline filter also serves online searches.** When the full catalog is cached, Home answers searches with
  `applyCatalogQuery` instead of the API (`Home.jsx`, the cached-catalog branch of the request effect). So the
  accent difference affected every visitor with a cached catalog, not only offline: "accion" found none of the
  189 "Acción" series.
- **Every catalog column is `utf8_spanish_ci`** (local `information_schema`, `view_all_info_produtions` and
  `productions`): á = a and ü = u, but ñ ≠ n. A first fold that turned ñ into n made the parity check fail on a
  description word with ñ; the fold keeps ñ.
- Admin and Search wrote `options_genres` / `options_demographics` with no `_ts`, so Home's 24-hour rule ignored
  their entries and they themselves never refreshed.

## Implementation
- `catalogStorage.js`: `fold()` (NFC, lower case, accents removed, ñ kept) for name, descriptions, genres and the
  demographic; the demographic still also matches by slug (URL routes); `sortByIdDesc` when no
  `production_ranking_number` is sent. Every body the app sends today names an order, so what users see is the
  accent fix.
- `optionsCache.js` (new): `readOptions(kind, { fresh })`, `writeOptions`, `loadOptions(kind, { token })`. A list
  with no date counts as old; when the API fails, the old list is still returned.
- `Home.jsx`, `SearchMethod.jsx`, `AdminPanel.jsx`, `CardRow.jsx` use it. Search and Admin show any cached list at
  once and refresh an old one. Admin applies the cached lists before its first `await`, so a series loading at the
  same time still maps its demographic by name (a unit test caught that order).
- Behavior change: on a genre or demographic URL (`/drama`) with an old cached list and a failing API, Home now
  resolves the slug with the old list instead of falling back to the ranking.
- `package.json`: `npm run parity`. `public/sw.js` 3.3.34 → 3.3.35 in this PR.

## Verification
- `npm run test:cov`: 50 files, 545 tests, **100%** statements, branches, functions and lines. `npm run lint`,
  `npm run build` pass.
- `npm run parity` against the local module-api and Docker database (511 series): **every case matches**
  (30 cases: order both ways, top 100/250, name, year, chapters, genres, demographic, ids, descriptions, accents,
  ñ, spaces, no order).
- **Negative control:** with the old `catalogStorage.js`, the same run reports 4 differences (name and genre
  without accent, two "no order" cases).
- Playwright against the local API: **5/5** (catalog, login, My Lists, admin create).

## Release and rollback
animecream-react only: merge, then `npm run bup` from `main` would bump `sw.js` again, so run
`npm run seed && npm run build && npm run up` instead (the bump is in the PR); confirm `sw.js` 3.3.35 and the
bundle. Rollback: revert the PR and deploy.

## Post-deploy checklist
- Search "accion" (no accent) by genre or name: the "Acción" series show.
- Admin: the genre list matches the API's.

## Version history
| Date | Change |
|---|---|
| 2026-11-15 | Created; unit 100% (545), parity 30/30 local with its negative control, Playwright 5/5 |
