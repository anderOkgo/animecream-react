# version.json: the commit a build was made from

**Date:** 2026-11-14 · **Branch:** `feature/20261114-front-version-json` · **Released in:** production 2026-11-14, from `main` at `4e06de0`
**Implements:** `module-docs/DEVELOPMENT-PROCESS.md` v2.11 — D.1 Release, E.4 (no app spec section: nothing a user sees changes)
**Change ID:** `20261114-front-version-json` (the same in `bitacora-react`, `finan-react` and `animecream-react`)

## Summary
Every build now writes `dist/version.json` with the commit, the branch, whether the tree had
uncommitted changes, and the build time. "What does production run" becomes one request, where
before it meant finding a bundle name inside the page. Build tooling only: no source under `src/`
changed.

## Context
Playbook v2.11 (approved by the owner on 2026-11-14) lets a front be deployed from its branch for
the owner's phone test, and asks the change doc to record what production serves. The three fronts
are deployed by FTP from a local build, so nothing on the site said which commit it came from.

## Critical constraints discovered
1. The deploy is a local build uploaded by FTP (`com/db-sync-FTP-both.bat`): the commit can only be
   stamped at build time, on the machine that builds.
2. CI builds from a detached checkout: `branch` is `HEAD` there. Only the commit is reliable in CI.
3. The service worker (`public/sw.js`). A navigation to `/version.json` is fetched from the network and does not replace the shell (the handler stores HTML only). A `fetch` from the page would be answered cache-first after the first time. So: check the file with `curl`.

## Decisions
### D1 — A Vite plugin, not a script in `bup`
`scripts/version-json.mjs`, added to `vite.config.js` with `apply: 'build'`: every build gets the
file, whichever command ran it, and tests and the dev server are untouched.

### D2 — Fields
`commit` (full hash), `branch`, `dirty` (uncommitted changes at build time) and `builtAt` (UTC).
Where git is not available each git field is `null`; the build never fails because of this file.

### D3 — The same file in the three fronts
One plugin, copied. The repos share no package, and 40 lines do not justify one.

## Discarded alternatives
- Showing the version inside the app — a visible change that needs a spec round; the owner asked for
  a way to check, not a screen.
- Reading the commit in CI and deploying from CI — the deploy is local by design (FTP credentials
  stay on the owner's machine).

## Verification
- `npm run build` writes `dist/version.json` with this branch's commit (checked on 2026-11-14).
- Lint clean; unit 532 at 100 % (no test changed: the plugin runs only in a build).

## Files created / modified
| File | Change |
|---|---|
| `scripts/version-json.mjs` | New: the plugin |
| `vite.config.js` | Uses it |

## Release and rollback
Goes out with the next deploy: `npm run bup` (seed and `public/sw.js` bump first, so `dirty` is `true` in a deploy made before the bump is committed). Check:
`curl https://<site>/version.json` shows the deployed commit. Rollback: remove the plugin from
`vite.config.js`; the file is not read by the app.

## Pending / out of scope
Nothing.

## Version history
| Date | Version | Change |
|---|---|---|
| 2026-11-14 | 0.1 | Built and verified locally; PR open, not deployed |
| 2026-11-14 | 1.0 | Merged with the owner's authorization (PR #11, `f8ddf6d`, CI green), branch deleted. Not deployed: the file appears on the site with the next deploy of this front |
| 2026-11-14 | 1.1 | **Deployed** at the owner's request (`npm run build && npm run up` from `main` at `4e06de0`). `curl https://animecream.com/version.json` answers with that commit, `branch: main`, `dirty: false`. The app itself is unchanged: same bundle `index-feb1b7f3.js` and `sw.js` 3.3.34 as before. Deployed without the `sw.js` bump or the seed: the build was first compared with production and the app files were identical, so there was nothing for clients to refresh and `main` stayed clean. `npm run smoke` 7/7. |
