import { getCachedFullCatalog, applyCatalogQuery, isFullCatalogRequest, STORAGE_INITIAL_KEY } from '../catalogStorage';

// The offline filter must answer like the API (Animecream SPEC G2): these are its edge cases.
const series = [
  { id: 1, production_name: 'Alpha', production_year: '2001', production_number_chapters: '12', production_ranking_number: '3', demographic_name: 'Shonen', genre_names: 'Action, Drama' },
  { id: 2, production_name: 'Beta', production_year: '2005', production_number_chapters: '24', production_ranking_number: '1', demographic_name: 'Seinen', genre_names: 'Drama' },
  { id: 3, production_name: 'Gamma', production_year: '2005', production_number_chapters: '12', production_ranking_number: '', demographic_name: undefined, genre_names: undefined },
];
const names = (items) => items.map((s) => s.production_name);

describe('catalogStorage, edge cases', () => {
  beforeEach(() => localStorage.clear());

  it('returns a cached catalog stored as a non-empty object', () => {
    localStorage.setItem(STORAGE_INITIAL_KEY, JSON.stringify({ items: [1] }));
    expect(getCachedFullCatalog()).toEqual({ items: [1] });
  });

  it('takes ids as an array, in the order given', () => {
    expect(names(applyCatalogQuery(series, { id: ['2', 1] }))).toEqual(['Beta', 'Alpha']);
  });

  it('matches nothing for an empty id', () => {
    expect(applyCatalogQuery(series, { id: '' })).toEqual([]);
  });

  it('sorts by ranking with unranked series last, both ways round', () => {
    expect(names(applyCatalogQuery(series, {}))).toEqual(['Beta', 'Alpha', 'Gamma']);
    const unrankedFirst = [{ id: 9, production_name: 'Omega' }, ...series];
    expect(names(applyCatalogQuery(unrankedFirst, {})).slice(0, 2)).toEqual(['Beta', 'Alpha']);
  });

  it('ignores a year or chapter filter with no number in it', () => {
    expect(applyCatalogQuery(series, { production_year: 'x' })).toHaveLength(3);
    expect(applyCatalogQuery(series, { production_number_chapters: 'x' })).toHaveLength(3);
  });

  it('filters one year or one chapter count', () => {
    expect(names(applyCatalogQuery(series, { production_year: '2005' }))).toEqual(['Beta', 'Gamma']);
    expect(names(applyCatalogQuery(series, { production_number_chapters: '12' }))).toEqual(['Alpha', 'Gamma']);
  });

  it('skips series with no demographic or no genres', () => {
    expect(names(applyCatalogQuery(series, { demographic_name: 'shonen' }))).toEqual(['Alpha']);
    expect(names(applyCatalogQuery(series, { genre_names: 'drama' }))).toEqual(['Beta', 'Alpha']);
  });

  it('treats a body that is JSON but not an object as a full-catalog request', () => {
    expect(isFullCatalogRequest({ body: 'null' })).toBe(true);
    expect(isFullCatalogRequest({ body: '5' })).toBe(true);
  });
});
