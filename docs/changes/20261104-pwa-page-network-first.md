# Page updates on the first open after a deploy

**Date:** 2026-11-04 · **Branch:** `feature/20261104-pwa-page-network-first` · **Released in:** https://animecream.com, 2026-11-04, sw 3.3.29; offline follow-up sw 3.3.30, same day
**Implements:** no spec change; workspace rule in `module-docs/DEVELOPMENT-PROCESS.md` v2.7, D.1
**Change ID:** `20261104-pwa-page-network-first`

## Summary
Every deploy of animecream needed two opens to show up. The service worker now fetches pages from the
network first, so the first open already shows the new version. Opening offline no longer depends
on the browser's HTTP cache, and a failed file no longer wipes the offline copy.

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

- The worker never cached the built JS: `request.mode !== 'cors'` was added on 2024-05-23 in place of
  a check on the API URL, to keep API responses out of the cache, but Vite loads its JS with
  `crossorigin`, which is also cors mode. Offline opens relied on the browser's HTTP cache (7 days).
- The load-error recovery in `index.html` reacted to any failed script. Analytics lasts 15 minutes
  in the HTTP cache; offline after that it failed, so recovery removed the worker and caches and
  reloaded into "site can't be reached". This is why it hit animecream and not finan.

## Decisions
- `request.mode === 'navigate'` goes network first and refreshes the cached page on a successful
  response; offline it falls back to that copy. Everything else keeps its existing strategy.
- The `cors` exclusion stays, with one exception: same-origin `/assets/`, content-hashed, so never
  stale. Not all same-origin requests: a future same-origin `fetch` of data would be frozen cache-first.
- Recovery runs only when `navigator.onLine` and only for files of this site's own origin.
- `TIMEOUT` fails without a console, giving exit 1 after a good upload. The script now pauses with
  `ping` and returns WinSCP's real exit code.
- `bup` is now bump → build → sync, joined with `&&`, so a failed build no longer deploys.
- `up` is now the FTP sync alone; bumping there and in `bup` would count every deploy twice.
- Version stays a script bump. Bitácora's build-derived hash is sturdier, but with pages on network
  first the version no longer decides whether a change is seen, only when old caches are cleared.

## Files to create / modify
- `public/sw.js` — network-first branch for page requests; built files cached
- `index.html` — recovery limited to online and own files
- `com/db-sync-FTP-both.bat` — pause and exit code
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

Offline against production, isolated browser, before and after:

| Scenario | Before | After |
|---|---|---|
| Everything recently cached | opens | opens |
| Analytics expired (blocked to simulate it) | **site unreachable** | opens |
| Browser HTTP cache cleared | **site unreachable** | opens |

Real build, local: 0 responses from `info.animecream.com` in the cache; recovery still runs when an
own file is missing online, and stays out when only Analytics is blocked. Signed-in API calls were not
observed. The new `.bat` ending was tested alone with simulated results (exit 0 and 3, 5 s pause, no
console); the whole script then ran on this release, exit 0.


## Follow-up: offline still failed after the first release
The owner reported that the app kept failing offline, on and off, right after this change was
released. The first checks had opened only `/`, twice, online, so they missed three causes:

- Pages were cached by exact URL, so `/` and `/?utm_source=homescreen` (the installed app's start
  URL) were different entries, and so was each page URL.
- The first open after a deploy stored files in the outgoing cache, which activation then deleted.
  One online open was not enough, contrary to what was first stated.
- Some successful opens came from the browser's HTTP cache, not from the worker: closing and reopening
  gave mixed results.

Fix, the approach Bitácora already uses: the worker keeps the page and its built files at install time,
in its own cache, reading the file list from the page itself so no build plugin is needed. One cached
copy under `/` serves every URL offline, and only an HTML response may replace it.

Verified on the real build with the HTTP cache cleared before every offline open, and with the previous
worker as a control. It must fail, or the test proves nothing:

| Scenario | Previous worker | This worker |
|---|---|---|
| First open, then offline (`/` or installed app) | 0 of 3 | 3 of 3 |
| Open one way, go offline the other way | 0 of 2 | 2 of 2 |
| Offline on a page URL | 0 of 1 | 1 of 1 |
| Deploy, one online open, offline | 0 of 2 | 2 of 2 |
| Close and reopen 6 times | 4 of 6 | 6 of 6 |

Also verified in production, six flows with the HTTP cache cleared: all open. Not verified on a physical
phone. This makes the app open offline; data from the API may still be missing without a network.
