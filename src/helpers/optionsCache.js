import helpHttp from './helpHttp';
import { API_BASE_URL } from './apiConfig';

/**
 * The genres and demographics lists, cached on the device for 24 hours (SPEC v0.8, G6). Home, Search, Admin and
 * CardRow all read and write them here: before, Search and Admin kept them forever, so a new genre did not show
 * there until the cache was cleared. Keys are the ones the app already used: `options_<kind>` and `options_<kind>_ts`.
 */
export const OPTIONS_TTL_MS = 24 * 60 * 60 * 1000;

const listKey = (kind) => `options_${kind}`;
const timeKey = (kind) => `options_${kind}_ts`;

/**
 * The cached list of a kind (`genres` or `demographics`), or null when there is none.
 * With `fresh` (the default) it is null too when older than 24 hours or of unknown age.
 */
export const readOptions = (kind, { fresh = true, now = Date.now() } = {}) => {
  let list;
  try {
    list = JSON.parse(localStorage.getItem(listKey(kind)));
  } catch {
    return null;
  }
  if (!Array.isArray(list) || list.length === 0) return null;
  if (!fresh) return list;
  const savedAt = parseInt(localStorage.getItem(timeKey(kind)) || '0', 10);
  return savedAt && now - savedAt < OPTIONS_TTL_MS ? list : null;
};

/** Caches a list with the time it was fetched. */
export const writeOptions = (kind, list, now = Date.now()) => {
  localStorage.setItem(listKey(kind), JSON.stringify(list));
  localStorage.setItem(timeKey(kind), String(now));
};

/**
 * The list of a kind: the cached one while fresh, else `GET api/series/<kind>` (cached when it brings a list).
 * When the API fails or brings nothing, the older cached list if any, else [].
 */
export const loadOptions = async (kind, { token } = {}) => {
  const cached = readOptions(kind);
  if (cached) return cached;
  const url = `${API_BASE_URL}api/series/${kind}`;
  // Admin sends its token (maybe empty); the public screens send none
  const res = await (token === undefined ? helpHttp.get(url) : helpHttp.get(url, { token }));
  const list = res && !res.err ? res[kind] || res.data || [] : [];
  if (Array.isArray(list) && list.length > 0) {
    writeOptions(kind, list);
    return list;
  }
  return readOptions(kind, { fresh: false }) || [];
};
