import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../Home';
import { LanguageProvider } from '../../../../src/hooks/useLanguage';

// Home's own job is orchestration: initial-load/offline/cached-catalog
// branching, the toolbar's control callbacks, and sort/top250 request
// building. Its children (SearchMethod, Card, Loader, Message, RangeFilter)
// each already have their own test suites, so they're mocked here as thin
// stand-ins -- this suite exercises only Home's own state/effect logic.
vi.mock('../../SearchMethod/SearchMethod', () => ({
  default: () => <div data-testid="search-method" />,
}));
vi.mock('../../SearchMethod/RangeFilter', () => ({
  default: () => <div data-testid="range-filter" />,
}));
vi.mock('../../Card/Card', () => ({
  default: ({ data }) => <div data-testid="card">card:{data.length}</div>,
}));
vi.mock('../../Loader/Loader', () => ({
  default: ({ onClick }) => (
    <div data-testid="loader" onClick={onClick}>
      loading
    </div>
  ),
}));
vi.mock('../../Message/Message', () => ({
  default: ({ msg }) => <div data-testid="message">{msg}</div>,
}));
// react-helmet-async's <Helmet> needs a HelmetProvider ancestor to do
// anything meaningful; SEO tag output isn't part of this pass's scope
// (Home's own state/effect logic is), so it's stubbed out entirely.
vi.mock('react-helmet-async', () => ({
  Helmet: () => null,
}));

vi.mock('../../../helpers/helpHttp', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));
import helpHttp from '../../../helpers/helpHttp';

vi.mock('../../../helpers/catalogStorage', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getCachedFullCatalog: vi.fn(() => null),
    persistFullCatalog: vi.fn(),
    isAppOffline: vi.fn(() => false),
  };
});
import { getCachedFullCatalog, isAppOffline } from '../../../helpers/catalogStorage';

const t = (key) => key;

const baseProps = {
  t,
  toggleLanguage: vi.fn(),
  onLanguageDoubleClick: vi.fn(),
  language: 'en',
  showRealNumbers: false,
  setShowRealNumbers: vi.fn(),
  sortOrder: null,
  setSortOrder: vi.fn(),
  role: null,
  onEditSeries: vi.fn(),
  refreshTrigger: 0,
  isAdvancedSearchVisible: false,
  setIsAdvancedSearchVisible: vi.fn(),
  onAddToList: vi.fn(),
  navigation: null,
};

const renderHome = (props = {}) =>
  render(
    <LanguageProvider>
      <Home {...baseProps} {...props} />
    </LanguageProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  getCachedFullCatalog.mockReturnValue(null);
  isAppOffline.mockReturnValue(false);
  helpHttp.post.mockResolvedValue([]);
  helpHttp.get.mockResolvedValue({ genres: [], demographics: [] });
  window.history.pushState({}, '', '/');
});

describe('Home', () => {
  it('renders instantly from the initialData seed, then swaps in the real API results', async () => {
    // `setLoading(true)` is never called by the silent background initial
    // fetch (only by the user-triggered opt-change/refreshTrigger effect,
    // see Home.jsx's own "no loader to dismiss; App Loader (proc) covers
    // initial load" comment) -- so there's no Loader here at all. `db`
    // starts seeded from 10 random `initialData` items instead, for an
    // instant, SEO-friendly first paint ahead of the API response.
    let resolvePost;
    helpHttp.post.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );

    renderHome();
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    expect(screen.getByTestId('card')).toHaveTextContent('card:10');

    resolvePost([{ production_ranking_number: 1, production_name: 'A' }]);

    await waitFor(() => expect(screen.getByTestId('card')).toHaveTextContent('card:1'));
  });

  it('renders the noDataFound empty state when the API returns no results', async () => {
    helpHttp.post.mockResolvedValue([]);
    renderHome();

    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    // The empty-state message uses useLanguage()'s real `translate`, not the
    // mocked `t` prop -- "No Data Found" is the real English copy for the
    // `noDataFound` key.
    expect(screen.getByText('No Data Found')).toBeInTheDocument();
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('shows an error Message when the API responds with err', async () => {
    helpHttp.post.mockResolvedValue({ err: { message: 'errorGeneric' } });
    renderHome();

    await waitFor(() => expect(screen.getByTestId('message')).toBeInTheDocument());
  });

  it('renders instantly from a cached catalog, ahead of the still-in-flight API refresh', async () => {
    // A cached catalog is shown immediately (no loader), but per the
    // "Siempre hacer carga inicial completa del API al recargar" comment in
    // Home.jsx, a background API refresh always runs too (stale-while-
    // revalidate, not cache-instead-of-network) -- so helpHttp.post is
    // still expected to fire once, just not blocking the initial render.
    getCachedFullCatalog.mockReturnValue([
      { production_ranking_number: 1, production_name: 'Cached A' },
      { production_ranking_number: 2, production_name: 'Cached B' },
    ]);

    renderHome();

    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    expect(screen.getByTestId('card')).toHaveTextContent('card:2');
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
  });

  it('does not call the API when offline, even without a cached catalog', async () => {
    isAppOffline.mockReturnValue(true);
    renderHome();

    // Nothing to show and no network call attempted.
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());
    expect(helpHttp.post).not.toHaveBeenCalled();
  });

  it('calls toggleLanguage when the language toolbar button is clicked', async () => {
    // Toolbar titles come from useLanguage()'s real `translate`, not the
    // mocked `t` prop -- rendered under a real LanguageProvider, so the
    // actual English copy ("ESP"/"Index"/"Ranking Order") is what's queried.
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    const toggleLanguage = vi.fn();
    renderHome({ toggleLanguage });

    await user.click(screen.getByTitle('ESP'));
    expect(toggleLanguage).toHaveBeenCalledTimes(1);
  });

  it('toggles showRealNumbers when the IX button is clicked', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    const setShowRealNumbers = vi.fn();
    renderHome({ showRealNumbers: false, setShowRealNumbers });

    await user.click(screen.getByTitle('Index'));
    expect(setShowRealNumbers).toHaveBeenCalledWith(true);
  });

  it('cycles sortOrder null -> asc -> desc -> null on repeated clicks', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    const setSortOrder = vi.fn();

    const { rerender } = render(
      <LanguageProvider>
        <Home {...baseProps} sortOrder={null} setSortOrder={setSortOrder} />
      </LanguageProvider>
    );
    await user.click(screen.getByTitle('Ranking Order'));
    expect(setSortOrder).toHaveBeenLastCalledWith('asc');

    rerender(
      <LanguageProvider>
        <Home {...baseProps} sortOrder="asc" setSortOrder={setSortOrder} />
      </LanguageProvider>
    );
    await user.click(screen.getByTitle('Ranking Order'));
    expect(setSortOrder).toHaveBeenLastCalledWith('desc');

    rerender(
      <LanguageProvider>
        <Home {...baseProps} sortOrder="desc" setSortOrder={setSortOrder} />
      </LanguageProvider>
    );
    await user.click(screen.getByTitle('Ranking Order'));
    expect(setSortOrder).toHaveBeenLastCalledWith(null);
  });

  it('requests the top-250 ranking when the Top 250 button is clicked', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    helpHttp.post.mockResolvedValue([]);
    renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));

    await user.click(screen.getByTitle('Top 250'));

    // `_reverse` is a client-side-only flag: handleTop250's requestData sets
    // it, but the opt-driven fetch effect strips it from the body actually
    // sent to the API (it's consumed after the response comes back, to
    // decide whether to .reverse() the results locally) -- so it must NOT
    // appear in the outgoing request.
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(2));
    const [, secondCallOptions] = helpHttp.post.mock.calls[1];
    expect(secondCallOptions.body).toEqual({
      limit: 250,
      production_ranking_number: 'ASC',
    });
  });
});
