# Page updates on the first open after a deploy

**Date:** 2026-11-04 · **Branch:** `feature/20261104-pwa-page-network-first` · **Released in:** not released
**Implements:** no spec change; workspace rule in `module-docs/DEVELOPMENT-PROCESS.md` v2.7, D.1
**Change ID:** `20261104-pwa-page-network-first`

## Summary
Every deploy of animecream needed two opens to show up. The service worker now fetches pages from the
network first, so the first open already shows the new version. Offline behavior is kept.

## Context
The owner noticed that Bitácora updates on the first open while finan and animecream need a second
reload. The difference was how each service worker serves `index.html`: Bitácora goes network first,
these two went cache first.

## Critical constraints discovered
- A cached page points at the old JS/CSS, also cached. The new worker installs about a second after
  load and clears the cache, too late for the page already open. Reopening before that shows the old
  version again.
- The build copies `public/sw.js` to `dist/`, and `bup` used to bump the version after the build:
  `dist/sw.js` ran one version behind `public/sw.js`.

## Decisions
- `request.mode === 'navigate'` goes network first and refreshes the cached page on a successful
  response; offline it falls back to that copy. Everything else keeps its existing strategy.
- `bup` is now bump → build → sync, joined with `&&`, so a failed build no longer deploys.
- `up` is now the FTP sync alone; bumping there and in `bup` would count every deploy twice.
- Version stays a script bump. Bitácora's build-derived hash is sturdier, but with pages on network
  first the version no longer decides whether a change is seen, only when old caches are cleared.

## Files to create / modify
- `public/sw.js` — network-first branch for page requests
- `package.json` — `up` and `bup` scripts
- `README.md` — deploy commands

## Release and rollback
Release with `npm run bup`, then `npm run smoke`. **The deploy that ships this still needs the second
open**, because the old worker serves it; the following ones update on the first open. Rollback:
revert and deploy; the version bump replaces the worker.

## Verification
Chromium, real `public/sw.js` before and after this change, on a local server simulating a deploy:

| Worker | 1st open after deploy | 2nd open | Server down |
|---|---|---|---|
| Before | old page | new page | opens |
| After | **new page** | new page | opens |

