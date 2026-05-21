/** Keys used for offline catalog (retrocompatible with existing localStorage). */
export const STORAGE_KEY = 'storage';
export const STORAGE_INITIAL_KEY = 'storage_initial';

const parseCachedCatalog = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) return parsed;
  } catch {
    return null;
  }
  return null;
};

/** Full catalog for offline bootstrap: prefers immutable snapshot, falls back to legacy `storage`. */
export const getCachedFullCatalog = () => {
  const initial = parseCachedCatalog(localStorage.getItem(STORAGE_INITIAL_KEY));
  if (initial) return initial;
  return parseCachedCatalog(localStorage.getItem(STORAGE_KEY));
};

/** Persist complete server catalog only (initial load, reload, POST {}). */
export const persistFullCatalog = (data) => {
  const json = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, json);
  localStorage.setItem(STORAGE_INITIAL_KEY, json);
};

/** True when POST body is empty — full catalog request. */
export const isFullCatalogRequest = (requestOpt) => {
  if (!requestOpt || Object.keys(requestOpt).length === 0) return true;

  let body = requestOpt.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return true;
    }
  }

  if (!body || typeof body !== 'object') return true;
  return Object.keys(body).length === 0;
};
