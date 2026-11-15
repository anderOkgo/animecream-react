import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../Home';
import { LanguageProvider } from '../../../hooks/useLanguage';

// The first paint of a genre or demographic page comes from the bundled seed. Every bundled series
// has a genre list and a demographic today, so this suite swaps in a seed with series that lack them.
vi.mock('../../../helpers/initialData', () => ({
  default: [
    { id: 1, production_name: 'Bare', production_year: 2001 },
    { id: 2, production_name: 'Tagged', production_year: 2002, genre_names: 'Drama', demographic_name: 'Seinen' },
  ],
}));
vi.mock('../../Card/Card', () => ({
  default: ({ data }) => <div data-testid="card">{data.map((s) => s.production_name).join('|')}</div>,
}));
vi.mock('../../SearchMethod/SearchMethod', () => ({ default: () => null }));
vi.mock('../../SearchMethod/RangeFilter', () => ({ default: () => null }));
vi.mock('react-helmet-async', () => ({ Helmet: () => null }));
vi.mock('../../../helpers/helpHttp', () => ({
  default: { get: vi.fn(() => new Promise(() => {})), post: vi.fn(() => new Promise(() => {})) },
}));
vi.mock('../../../helpers/catalogStorage', async (importOriginal) => ({
  ...(await importOriginal()),
  getCachedFullCatalog: vi.fn(() => null),
  isAppOffline: vi.fn(() => false),
}));

const props = {
  t: (k) => k,
  language: 'en',
  sortOrder: null,
  setSortOrder: vi.fn(),
  refreshTrigger: 0,
  onSeriesDataChange: vi.fn(),
  onSetOptReady: vi.fn(),
  navigation: { currentState: null, pushHistory: vi.fn() },
};

afterEach(() => window.history.pushState({}, '', '/'));

it('seeds a genre or demographic page, skipping series without either', () => {
  window.history.pushState({}, '', '/seinen');
  const { unmount } = render(
    <LanguageProvider>
      <Home {...props} />
    </LanguageProvider>
  );
  expect(screen.getByTestId('card')).toHaveTextContent(/^Tagged$/);
  unmount();
  window.history.pushState({}, '', '/drama');
  render(
    <LanguageProvider>
      <Home {...props} />
    </LanguageProvider>
  );
  expect(screen.getByTestId('card')).toHaveTextContent(/^Tagged$/);
});
