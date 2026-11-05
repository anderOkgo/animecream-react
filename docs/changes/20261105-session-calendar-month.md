# The session survives the change of date

**Date:** 2026-11-05 · **Branch:** `fix/20261105-session-calendar-month`
**Implements:** `module-docs/apps/auth/SPEC.md` v0.3, §2, backlog B2
**Change ID:** `20261105-session-calendar-month`

## Summary
The session's `localStorage` key included the date, so it could not be found the next day, although the token was
still valid: the app logged out every day. The key is now fixed, and the session lasts as long as its token, one
calendar month.

## Notes
- Everyone logs in once after this release: sessions stored under the old key are not moved.
- An expired token is not checked here: the API answers 401, and offline use keeps working until then.

## Release and rollback
`npm run bup`, after the API. Rollback: revert and deploy.

## Version history
| Date | Change |
|---|---|
| 2026-11-05 | Created |
