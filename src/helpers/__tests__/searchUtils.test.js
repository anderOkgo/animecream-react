import { filterDataset, generateSuggestions } from '../searchUtils';

const dataset = [
  { production_name: 'Naruto', genre_names: 'Action,Adventure', demographic_name: 'Shounen', production_year: 2002, production_image_path: '/naruto.jpg' },
  { production_name: 'Death Note', genre_names: 'Thriller,Psychological', demographic_name: 'Seinen', production_year: 2006, production_image_path: '/deathnote.jpg' },
  { production_name: 'Sailor Moon', genre_names: 'Magic,Romance', demographic_name: 'Shoujo', production_year: 1992, title_names: 'Pretty Guardian' },
];

describe('filterDataset', () => {
  it('returns the full dataset when the search term is empty or whitespace', () => {
    expect(filterDataset(dataset, '')).toBe(dataset);
    expect(filterDataset(dataset, '   ')).toBe(dataset);
  });

  it('AND-searches comma-separated terms (every term must match)', () => {
    const result = filterDataset(dataset, 'shounen,naruto');
    expect(result).toHaveLength(1);
    expect(result[0].production_name).toBe('Naruto');
  });

  it('AND-search returns nothing when one of the terms matches no item', () => {
    expect(filterDataset(dataset, 'naruto,nonexistent')).toHaveLength(0);
  });

  it('OR-searches plus-separated terms (any term may match)', () => {
    const result = filterDataset(dataset, 'naruto+sailor moon');
    expect(result.map((i) => i.production_name).sort()).toEqual(['Naruto', 'Sailor Moon']);
  });

  it('matches case-insensitively and trims whitespace around terms', () => {
    const result = filterDataset(dataset, '  DEATH NOTE  ');
    expect(result).toHaveLength(1);
    expect(result[0].production_name).toBe('Death Note');
  });

  it('excludes production_image_path from the searchable text', () => {
    // Every fixture's image path is unique-ish; searching for a path
    // fragment must not match, proving the excluded field is honored.
    expect(filterDataset(dataset, 'naruto.jpg')).toHaveLength(0);
  });

  it('ignores null/undefined fields without throwing', () => {
    const withNulls = [{ production_name: 'X', genre_names: null, demographic_name: undefined }];
    expect(() => filterDataset(withNulls, 'x')).not.toThrow();
    expect(filterDataset(withNulls, 'x')).toHaveLength(1);
  });
});

describe('generateSuggestions', () => {
  it('returns no suggestions for an empty or too-short search term', () => {
    expect(generateSuggestions(dataset, '')).toEqual([]);
    expect(generateSuggestions(dataset, 'a')).toEqual([]);
  });

  it('suggests matching production names', () => {
    expect(generateSuggestions(dataset, 'naru')).toContain('Naruto');
  });

  it('suggests matching individual genres out of a comma-separated field', () => {
    const suggestions = generateSuggestions(dataset, 'psych');
    expect(suggestions).toContain('Psychological');
  });

  it('suggests matching alternative titles', () => {
    expect(generateSuggestions(dataset, 'guardian')).toContain('Pretty Guardian');
  });

  it('suggests matching demographics and years', () => {
    expect(generateSuggestions(dataset, 'shoujo')).toContain('Shoujo');
    expect(generateSuggestions(dataset, '2006')).toContain('2006');
  });

  it('deduplicates and caps results at maxSuggestions', () => {
    const repeated = Array.from({ length: 20 }, () => ({ production_name: 'Repeated Show' }));
    const suggestions = generateSuggestions(repeated, 'repeated', 5);
    expect(suggestions).toEqual(['Repeated Show']);
  });
});
