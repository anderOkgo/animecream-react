import set from './set.json';

// `set.json`'s base_url is hardcoded to production -- this override lets
// local/CI tooling (Playwright E2E in particular) point the app at a local
// module-api instance via `VITE_API_BASE_URL` without editing set.json.
// Falls back to the existing production URL when unset, so this changes
// nothing for a normal dev/build run.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || set.base_url;
