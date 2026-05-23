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

export const isAppOffline = () => typeof navigator !== 'undefined' && !navigator.onLine;

const slugify = (str) =>
  String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');

/** True when `opt` only targets a single year (doble clic en año → mismo camino que el slider). */
export const isYearOnlyOptBody = (body) => {
  if (!body?.production_year || body.production_year === '') return false;
  if (String(body.production_year).includes(',')) return false;
  const filterKeys = [
    'genre_names',
    'demographic_name',
    'production_number_chapters',
    'production_name',
    'production_description',
    'production_description_en',
    'limit',
    'id',
  ];
  return filterKeys.every((key) => body[key] == null || body[key] === '');
};

/** Parse `opt.body` the same way Home does before POST. */
export const parseOptBody = (opt) => {
  if (!opt?.body) return {};
  if (typeof opt.body === 'string') {
    try {
      return JSON.parse(opt.body);
    } catch {
      return {};
    }
  }
  return opt.body;
};

const parseNumericRange = (value) => {
  if (value == null || value === '') return [];
  return String(value)
    .split(',')
    .map((v) => parseInt(v.trim(), 10))
    .filter((n) => !isNaN(n));
};

const sortByRanking = (items, direction = 'ASC') => {
  const desc = direction === 'DESC';
  return [...items].sort((a, b) => {
    const rankA = parseInt(a.production_ranking_number, 10) || 999999;
    const rankB = parseInt(b.production_ranking_number, 10) || 999999;
    return desc ? rankB - rankA : rankA - rankB;
  });
};

/**
 * Local filter/sort mirroring series-read API rules (LIKE, BETWEEN, AND genres, ORDER BY, LIMIT).
 * Used offline with the same `opt.body` shape as POST searches.
 */
export const applyCatalogQuery = (catalog, body = {}) => {
  if (!catalog?.length) return [];

  const criteria = { ...body };
  const rankOrder = criteria.production_ranking_number === 'DESC' ? 'DESC' : 'ASC';
  delete criteria.production_ranking_number;

  const limit =
    criteria.limit != null && criteria.limit !== '' ? parseInt(criteria.limit, 10) : null;
  delete criteria.limit;

  let result = [...catalog];

  if (criteria.id != null) {
    const ids = Array.isArray(criteria.id)
      ? criteria.id.map((id) => Number(id))
      : parseNumericRange(criteria.id);
    const validIds = ids.filter((id) => !isNaN(id) && id > 0);
    const ordered = validIds
      .map((id) => result.find((s) => Number(s.id) === id))
      .filter(Boolean);
    result = ordered.length > 0 ? ordered : result.filter((s) => validIds.includes(Number(s.id)));
    delete criteria.id;
  }

  if (criteria.production_year != null && criteria.production_year !== '') {
    const years = parseNumericRange(criteria.production_year);
    if (years.length >= 2) {
      result = result.filter((item) => {
        const y = parseInt(item.production_year, 10);
        return y >= years[0] && y <= years[1];
      });
    } else if (years.length === 1) {
      result = result.filter((item) => parseInt(item.production_year, 10) === years[0]);
    }
  }

  if (criteria.production_number_chapters != null && criteria.production_number_chapters !== '') {
    const chapters = parseNumericRange(criteria.production_number_chapters);
    if (chapters.length >= 2) {
      result = result.filter((item) => {
        const c = parseInt(item.production_number_chapters, 10);
        return c >= chapters[0] && c <= chapters[1];
      });
    } else if (chapters.length === 1) {
      result = result.filter((item) => parseInt(item.production_number_chapters, 10) === chapters[0]);
    }
  }

  if (criteria.production_name) {
    const term = String(criteria.production_name).toLowerCase();
    result = result.filter((item) => item.production_name?.toLowerCase().includes(term));
  }

  if (criteria.production_description) {
    const term = String(criteria.production_description).toLowerCase();
    result = result.filter((item) => item.production_description?.toLowerCase().includes(term));
  }

  if (criteria.production_description_en) {
    const term = String(criteria.production_description_en).toLowerCase();
    result = result.filter((item) => item.production_description_en?.toLowerCase().includes(term));
  }

  if (criteria.demographic_name) {
    const target = String(criteria.demographic_name);
    result = result.filter(
      (item) =>
        item.demographic_name === target ||
        slugify(item.demographic_name) === slugify(target) ||
        item.demographic_name?.toLowerCase() === target.toLowerCase()
    );
  }

  if (criteria.genre_names) {
    const genres = String(criteria.genre_names)
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
    result = result.filter((item) => {
      const haystack = (item.genre_names || '').toLowerCase();
      return genres.every((g) => haystack.includes(g.toLowerCase()));
    });
  }

  result = sortByRanking(result, rankOrder);

  if (limit > 0) {
    result = result.slice(0, limit);
  }

  return result;
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
