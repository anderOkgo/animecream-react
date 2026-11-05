import { describe, expect, it } from 'vitest';
import { updateSeed } from '../../../scripts/sync-initial-data.mjs';

const seed = `const initialData = [
  {
    production_name: "Remi the Nobody's Boy",
    production_year: 1977,
    production_image_path: '/img/tarjeta/1_old.jpg',
    production_ranking_number: 40,
  },
  {
    production_name: 'Gone Series',
    production_year: 2001,
    production_image_path: '/img/tarjeta/2_old.jpg',
    production_ranking_number: 50,
  },
];
`;
const live = {
  production_name: "Remi the Nobody's Boy",
  production_year: 1977,
  production_image_path: 'https://cdn.example.com/img/tarjeta/1_new.jpg',
  production_ranking_number: 41,
};

describe('updateSeed', () => {
  it('updates the image, without the host, and the ranking of a series matched by name and year', () => {
    const { text, changed } = updateSeed(seed, [live]);
    expect(changed).toEqual(["Remi the Nobody's Boy (1977)"]);
    expect(text).toContain("production_image_path: '/img/tarjeta/1_new.jpg'");
    expect(text).toContain('production_ranking_number: 41');
  });

  it('reports a series the catalog no longer has and leaves it untouched', () => {
    const { text, missing } = updateSeed(seed, [live]);
    expect(missing).toEqual(['Gone Series (2001)']);
    expect(text).toContain("production_image_path: '/img/tarjeta/2_old.jpg'");
  });

  it('does not match the same name in another year', () => {
    const { changed, missing } = updateSeed(seed, [{ ...live, production_year: 1978 }]);
    expect(changed).toEqual([]);
    expect(missing).toHaveLength(2);
  });

  it('changes nothing when the seed is up to date', () => {
    const current = { ...live, production_image_path: '/img/tarjeta/1_old.jpg', production_ranking_number: 40 };
    const { text, changed } = updateSeed(seed, [current]);
    expect(changed).toEqual([]);
    expect(text).toBe(seed);
  });
});
