import { vi } from 'vitest';
import {
  STORAGE_KEY,
  STORAGE_INITIAL_KEY,
  getCachedFullCatalog,
  persistFullCatalog,
  isAppOffline,
  isYearOnlyOptBody,
  parseOptBody,
  applyCatalogQuery,
  isFullCatalogRequest,
} from '../catalogStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('getCachedFullCatalog / persistFullCatalog', () => {
  it('returns null when nothing is cached', () => {
    expect(getCachedFullCatalog()).toBeNull();
  });

  it('persists to both the legacy and immutable-snapshot keys', () => {
    persistFullCatalog([{ id: 1 }]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([{ id: 1 }]);
    expect(JSON.parse(localStorage.getItem(STORAGE_INITIAL_KEY))).toEqual([{ id: 1 }]);
  });

  it('prefers the immutable snapshot over the legacy key when both exist', () => {
    localStorage.setItem(STORAGE_INITIAL_KEY, JSON.stringify([{ id: 'initial' }]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'legacy' }]));
    expect(getCachedFullCatalog()).toEqual([{ id: 'initial' }]);
  });

  it('falls back to the legacy key when no immutable snapshot exists', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'legacy' }]));
    expect(getCachedFullCatalog()).toEqual([{ id: 'legacy' }]);
  });

  it('treats malformed JSON as absent rather than throwing', () => {
    localStorage.setItem(STORAGE_INITIAL_KEY, '{not json');
    expect(() => getCachedFullCatalog()).not.toThrow();
    expect(getCachedFullCatalog()).toBeNull();
  });

  it('treats an empty array/object as absent', () => {
    localStorage.setItem(STORAGE_INITIAL_KEY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    expect(getCachedFullCatalog()).toBeNull();
  });
});

describe('isAppOffline', () => {
  it('reflects navigator.onLine', () => {
    const spy = vi.spyOn(navigator, 'onLine', 'get');
    spy.mockReturnValue(true);
    expect(isAppOffline()).toBe(false);
    spy.mockReturnValue(false);
    expect(isAppOffline()).toBe(true);
    spy.mockRestore();
  });
});

describe('isYearOnlyOptBody', () => {
  it('is false with no year', () => {
    expect(isYearOnlyOptBody({})).toBe(false);
    expect(isYearOnlyOptBody({ production_year: '' })).toBe(false);
  });

  it('is false when the year is a range (comma-separated)', () => {
    expect(isYearOnlyOptBody({ production_year: '2000,2010' })).toBe(false);
  });

  it('is false when any other filter key is also set', () => {
    expect(isYearOnlyOptBody({ production_year: '2005', genre_names: 'Action' })).toBe(false);
  });

  it('is true for a single year with no other filters', () => {
    expect(isYearOnlyOptBody({ production_year: '2005' })).toBe(true);
  });
});

describe('parseOptBody', () => {
  it('returns {} when there is no body', () => {
    expect(parseOptBody({})).toEqual({});
    expect(parseOptBody(undefined)).toEqual({});
  });

  it('parses a JSON-string body', () => {
    expect(parseOptBody({ body: '{"a":1}' })).toEqual({ a: 1 });
  });

  it('returns {} for a malformed JSON-string body instead of throwing', () => {
    expect(() => parseOptBody({ body: '{not json' })).not.toThrow();
    expect(parseOptBody({ body: '{not json' })).toEqual({});
  });

  it('passes an already-object body through unchanged', () => {
    expect(parseOptBody({ body: { a: 1 } })).toEqual({ a: 1 });
  });
});

describe('isFullCatalogRequest', () => {
  it('is true for an empty/undefined request', () => {
    expect(isFullCatalogRequest(undefined)).toBe(true);
    expect(isFullCatalogRequest({})).toBe(true);
  });

  it('is true for a request with an empty object/string body', () => {
    expect(isFullCatalogRequest({ method: 'POST', body: {} })).toBe(true);
    expect(isFullCatalogRequest({ method: 'POST', body: '{}' })).toBe(true);
  });

  it('is false once the body has any filter key', () => {
    expect(isFullCatalogRequest({ method: 'POST', body: { production_year: '2005' } })).toBe(false);
  });

  it('treats a malformed JSON-string body as a full-catalog request', () => {
    expect(isFullCatalogRequest({ method: 'POST', body: '{not json' })).toBe(true);
  });
});

describe('applyCatalogQuery', () => {
  const catalog = [
    { id: 1, production_name: 'Naruto', production_year: 2002, production_number_chapters: 220, genre_names: 'Action,Adventure', demographic_name: 'Shounen', production_ranking_number: 3, production_description: 'A ninja story', production_description_en: 'A ninja tale' },
    { id: 2, production_name: 'Death Note', production_year: 2006, production_number_chapters: 37, genre_names: 'Thriller,Psychological', demographic_name: 'Seinen', production_ranking_number: 1, production_description: 'A death god', production_description_en: 'A death god notebook' },
    { id: 3, production_name: 'Sailor Moon', production_year: 1992, production_number_chapters: 46, genre_names: 'Magic,Romance', demographic_name: 'Shoujo', production_ranking_number: 2, production_description: 'Magical girl', production_description_en: 'Magical girl' },
  ];

  it('returns [] for an empty catalog', () => {
    expect(applyCatalogQuery([], {})).toEqual([]);
    expect(applyCatalogQuery(undefined, {})).toEqual([]);
  });

  it('defaults to ranking-ASC order when no criteria are given', () => {
    const result = applyCatalogQuery(catalog);
    expect(result.map((i) => i.id)).toEqual([2, 3, 1]);
  });

  it('sorts DESC when requested', () => {
    const result = applyCatalogQuery(catalog, { production_ranking_number: 'DESC' });
    expect(result.map((i) => i.id)).toEqual([1, 3, 2]);
  });

  it('filters by a single year', () => {
    const result = applyCatalogQuery(catalog, { production_year: '2006' });
    expect(result.map((i) => i.id)).toEqual([2]);
  });

  it('filters by a year range', () => {
    const result = applyCatalogQuery(catalog, { production_year: '2000,2005' });
    expect(result.map((i) => i.id)).toEqual([1]);
  });

  it('filters by a single chapter count and by a chapter range', () => {
    expect(applyCatalogQuery(catalog, { production_number_chapters: '37' }).map((i) => i.id)).toEqual([2]);
    expect(
      applyCatalogQuery(catalog, { production_number_chapters: '40,250' }).map((i) => i.id).sort()
    ).toEqual([1, 3]);
  });

  it('filters by name/description/description_en substrings, case-insensitively', () => {
    expect(applyCatalogQuery(catalog, { production_name: 'naruto' }).map((i) => i.id)).toEqual([1]);
    expect(applyCatalogQuery(catalog, { production_description: 'death god' }).map((i) => i.id)).toEqual([2]);
    expect(applyCatalogQuery(catalog, { production_description_en: 'notebook' }).map((i) => i.id)).toEqual([2]);
  });

  it('filters by demographic, matching exact/case-insensitive/slugified forms', () => {
    expect(applyCatalogQuery(catalog, { demographic_name: 'Shounen' }).map((i) => i.id)).toEqual([1]);
    expect(applyCatalogQuery(catalog, { demographic_name: 'shounen' }).map((i) => i.id)).toEqual([1]);
  });

  it('filters by genre with AND semantics across a comma-separated list', () => {
    expect(applyCatalogQuery(catalog, { genre_names: 'Action' }).map((i) => i.id)).toEqual([1]);
    expect(applyCatalogQuery(catalog, { genre_names: 'Action,Romance' })).toEqual([]);
  });

  it('orders by the given id list and skips ranking sort when ids resolve', () => {
    const result = applyCatalogQuery(catalog, { id: '3,1' });
    expect(result.map((i) => i.id)).toEqual([3, 1]);
  });

  it('falls back to a plain id-membership filter (then ranking sort) when no id resolves in order', () => {
    const result = applyCatalogQuery(catalog, { id: '999' });
    expect(result).toEqual([]);
  });

  it('applies limit after filtering/sorting', () => {
    const result = applyCatalogQuery(catalog, { limit: '2' });
    expect(result).toHaveLength(2);
  });

  it('combines multiple criteria (AND across filters)', () => {
    const result = applyCatalogQuery(catalog, { production_year: '2002', genre_names: 'Action' });
    expect(result.map((i) => i.id)).toEqual([1]);
  });
});
