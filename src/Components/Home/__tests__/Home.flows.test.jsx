import { vi } from 'vitest';
import { StrictMode } from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import Home from '../Home';
import { LanguageProvider } from '../../../hooks/useLanguage';

// Home's flows: the route it reads at mount, the catalog it shows (seed, cache, API, offline), the
// requests it builds (filters, lists, top rankings, slugs), the history restore and the SEO tags.
// Children are stand-ins that record their props, so the suite can drive Home through them.
const kids = vi.hoisted(() => ({ card: null, search: null, ranges: {} }));

vi.mock('../../SearchMethod/SearchMethod', () => ({
  default: (props) => {
    kids.search = props;
    return <div data-testid="search-method" />;
  },
}));
vi.mock('../../SearchMethod/RangeFilter', () => ({
  default: (props) => {
    kids.ranges[props.step ? 'decade' : 'year'] = props;
    return <div data-testid={`range-${props.step ? 'decade' : 'year'}`} data-display={props.displayValue} />;
  },
}));
vi.mock('../../Card/Card', () => ({
  default: (props) => {
    kids.card = props;
    return <div data-testid="card">{props.data.map((s) => s.production_name).join('|')}</div>;
  },
}));
vi.mock('../../Loader/Loader', () => ({
  default: ({ onClick }) => <div data-testid="loader" onClick={onClick} />,
}));
vi.mock('../../Message/Message', () => ({
  default: ({ msg, onDoubleClick }) => (
    <div data-testid="message" onDoubleClick={onDoubleClick}>
      {msg}
    </div>
  ),
}));
// React 18 renders these tags where they stand, so the stand-in keeps them inspectable. The title and
// the description are read from og:title and og:description, which carry the same text:
// LanguageProvider also writes document.title and the description meta, and with no such tags in
// jsdom's <head> it rewrites these ones.
vi.mock('react-helmet-async', () => ({ Helmet: ({ children }) => <div data-testid="helmet">{children}</div> }));

vi.mock('../../../helpers/helpHttp', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
import helpHttp from '../../../helpers/helpHttp';
vi.mock('../../../helpers/catalogStorage', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getCachedFullCatalog: vi.fn(), persistFullCatalog: vi.fn(), isAppOffline: vi.fn() };
});
import { getCachedFullCatalog, persistFullCatalog, isAppOffline } from '../../../helpers/catalogStorage';

const S = (id, name, year, rank, extra = {}) => ({
  id,
  production_name: name,
  production_year: year,
  production_ranking_number: rank,
  production_description: `${name} es`,
  production_description_en: `${name} en`,
  production_image_path: `img/${id}`,
  ...extra,
});
const CAT = [
  S(1, 'Alpha', 2005, 3, { genre_names: 'Acción, Comedia', demographic_name: 'Shōnen' }),
  S(2, 'Beta', 2005, 1, { genre_names: 'Drama,', demographic_name: 'Seinen' }),
  S(3, 'Gamma', 1995, 2, { genre_names: 'Misterio' }),
  S(4, 'Delta', 2008, null),
  S(5, 'Eps', 2008, 3),
];

const nav = (currentState = null) => ({ currentState, pushHistory: vi.fn() });
let setOptFromHome;
const baseProps = () => ({
  t: (k) => k,
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
  loadByIds: null,
  onSeriesDataChange: vi.fn(),
  onSetOptReady: (fn) => (setOptFromHome = fn),
  navigation: nav(),
  onShowListManager: vi.fn(),
});
let props;
const ui = (p) => (
  <LanguageProvider>
    <Home {...p} />
  </LanguageProvider>
);
const renderHome = (extra = {}, path = '/') => {
  window.history.pushState({}, '', path);
  props = { ...baseProps(), ...extra };
  const result = render(ui(props));
  return { ...result, update: (more) => result.rerender(ui((props = { ...props, ...more }))) };
};
const names = () => screen.getByTestId('card').textContent;
const lastBody = () => helpHttp.post.mock.calls.at(-1)[1].body;
const sendOpt = (o) => act(() => setOptFromHome(o));
const head = (sel) => screen.getByTestId('helmet').querySelector(sel);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  kids.card = null;
  kids.ranges = {};
  getCachedFullCatalog.mockReturnValue(null);
  isAppOffline.mockReturnValue(false);
  helpHttp.post.mockResolvedValue(CAT);
  helpHttp.get.mockResolvedValue({ genres: [], demographics: [] });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  window.history.pushState({}, '', '/');
  vi.restoreAllMocks();
});

describe('Home, the route read at mount', () => {
  it('seeds a year page from the bundled data, then loads the catalog and keeps that year', async () => {
    renderHome({}, '/2005');
    expect(names().split('|').length).toBeGreaterThan(0);
    await waitFor(() => expect(names()).toBe('Beta|Alpha')); // that year only, by ranking
    expect(persistFullCatalog).toHaveBeenCalledWith(CAT);
    expect(head('meta[property="og:title"]').content).toBe('Anime from 2005 | AnimeCream');
    expect(head('meta[property="og:description"]').content).toMatch(/released in 2005/);
  });

  it('falls back to the whole catalog when the year has no series, in Spanish', async () => {
    renderHome({ language: 'es' }, '/1800');
    await waitFor(() => expect(names()).toBe('Beta|Gamma|Eps|Alpha|Delta')); // all of it, by ranking then newest
    expect(head('meta[property="og:title"]').content).toBe('Animes de 1800 | AnimeCream');
    expect(head('meta[property="og:description"]').content).toMatch(/en el año 1800/);
  });

  it('reads a decade in its two- and four-digit forms, by ranking then newest', async () => {
    const { unmount } = renderHome({}, '/2000s');
    await waitFor(() => expect(names()).toBe('Beta|Eps|Alpha|Delta'));
    expect(head('meta[property="og:title"]').content).toBe('Anime from the 2000s | AnimeCream');
    expect(head('meta[property="og:description"]').content).toMatch(/from the 2000s/);
    unmount();
    renderHome({ language: 'es' }, '/90s');
    await waitFor(() => expect(names()).toBe('Gamma'));
    expect(head('meta[property="og:title"]').content).toBe('Animes de la década 1990s | AnimeCream');
    expect(head('meta[property="og:description"]').content).toMatch(/década de los 1990s/);
  });

  it('reads 05s as the 2000s and 1800s as a decade with nothing, which shows everything', async () => {
    const { unmount } = renderHome({}, '/05s');
    await waitFor(() => expect(names()).toBe('Beta|Eps|Alpha|Delta'));
    unmount();
    renderHome({}, '/1800s');
    await waitFor(() => expect(names()).toBe('Beta|Gamma|Eps|Alpha|Delta'));
  });

  it('seeds a genre or demographic page from the bundled data, or all of it when nothing matches', () => {
    const { unmount } = renderHome({}, '/accion');
    expect(names().split('|')).toHaveLength(10);
    unmount();
    const second = renderHome({}, '/shonen');
    expect(names().split('|')).toHaveLength(10);
    second.unmount();
    renderHome({}, '/no-such-genre');
    expect(names().split('|')).toHaveLength(10);
  });

  it('moves a legacy path to its root slug, and an unknown deep path to the root', async () => {
    const { unmount } = renderHome({}, '/producciones/Naruto/');
    expect(window.location.pathname).toBe('/naruto');
    unmount();
    const deep = renderHome({}, '/a/b/c?tipo=2005');
    expect(window.location.pathname + window.location.search).toBe('/'); // the query goes too
    deep.unmount();
    renderHome({}, '/?tipo=%20Top100%20');
    await waitFor(() => expect(lastBody()).toEqual({ limit: 100, production_ranking_number: 'ASC' }));
  });

  it('reads ?tipo= on the root, and nothing without it', async () => {
    const { unmount } = renderHome({}, '/?tipo=2005');
    await waitFor(() => expect(names()).toBe('Beta|Alpha'));
    unmount();
    renderHome({}, '/?other=1');
    await waitFor(() => expect(names()).toBe(CAT.map((s) => s.production_name).join('|')));
    expect(head('meta[property="og:title"]').content).toBe('Alpha | AnimeCream');
  });
});

describe('Home, the initial catalog', () => {
  it('shows a cached catalog for a slug at once, without asking the API for it', async () => {
    getCachedFullCatalog.mockReturnValue(CAT);
    renderHome({}, '/drama');
    expect(props.onSeriesDataChange).toHaveBeenCalledWith(CAT);
    await waitFor(() => expect(names()).toBe('Beta'));
    expect(helpHttp.post).not.toHaveBeenCalled();
  });

  it('keeps a series the user chose while the catalog was still on its way', async () => {
    let answer;
    helpHttp.post.mockReturnValueOnce(new Promise((r) => (answer = r)));
    renderHome();
    sendOpt({ method: 'POST', body: { id: 9 } });
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(names()).toContain('Alpha'));
    await act(async () => answer([S(7, 'Late', 2001, 1)]));
    expect(names()).not.toContain('Late');
  });

  it('shows an API error, a generic one when it has no message, and a failed request', async () => {
    helpHttp.post.mockResolvedValue({ err: { message: 'Not Found' } });
    const { unmount } = renderHome();
    expect(await screen.findByTestId('message')).toHaveTextContent('Error: Not Found');
    unmount();
    helpHttp.post.mockResolvedValue({ err: {} });
    const second = renderHome();
    expect(await screen.findByTestId('message')).toHaveTextContent(/^Error: /);
    second.unmount();
    helpHttp.post.mockRejectedValue(new Error('network'));
    renderHome();
    expect(await screen.findByTestId('message')).toHaveTextContent('Error loading data');
    fireEvent.doubleClick(screen.getByTestId('message'));
    expect(screen.queryByTestId('message')).toBeNull();
  });

  it('reads a { data } answer', async () => {
    helpHttp.post.mockResolvedValue({ data: [S(8, 'Wrapped', 2000, 1)] });
    renderHome();
    await waitFor(() => expect(names()).toBe('Wrapped'));
  });

  it('works out the year limits from the catalog, or the defaults when it has no years', async () => {
    helpHttp.post.mockResolvedValue([S(1, 'NoYear', 'x', 1)]);
    const { unmount } = renderHome();
    await waitFor(() => expect(names()).toBe('NoYear'));
    fireEvent.click(screen.getByTitle('Mostrar Filtros'));
    expect(kids.ranges.year.min).toBe(1968);
    expect(kids.ranges.decade.max).toBe(Math.floor(new Date().getFullYear() / 10) * 10);
    unmount();
    helpHttp.post.mockResolvedValue([]);
    renderHome();
    expect(await screen.findByText('No Data Found')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Mostrar Filtros'));
    expect(kids.ranges.year.min).toBe(1968);
  });
});

describe('Home, the year and decade sliders', () => {
  const open = async () => {
    renderHome();
    await waitFor(() => expect(names()).toBe(CAT.map((s) => s.production_name).join('|')));
    fireEvent.click(screen.getByTitle('Mostrar Filtros'));
  };

  it('filters by year or decade, sorted by ranking then newest, and resets', async () => {
    await open();
    act(() => kids.ranges.year.onChange(2005));
    expect(names()).toBe('Beta|Alpha');
    expect(screen.getByTestId('range-decade').dataset.display).toBe('All');
    act(() => kids.ranges.decade.onChange(2000));
    expect(names()).toBe('Beta|Eps|Alpha|Delta');
    expect(screen.getByTestId('range-decade').dataset.display).toBe('2000s');
    act(() => kids.ranges.year.onReset());
    expect(names()).toBe(CAT.map((s) => s.production_name).join('|'));
    act(() => kids.ranges.decade.onReset());
    fireEvent.click(screen.getByTitle('Ocultar Filtros'));
    expect(screen.queryByTestId('range-year')).toBeNull();
  });

  it('sorts unranked series of a year 0 last', async () => {
    helpHttp.post.mockResolvedValue([S(1, 'Zero', 0, null), S(2, 'Five', 5, null), S(3, 'Four', 4, null)]);
    renderHome();
    await waitFor(() => expect(names()).toBe('Zero|Five|Four'));
    fireEvent.click(screen.getByTitle('Mostrar Filtros'));
    act(() => kids.ranges.decade.onChange(0));
    expect(names()).toBe('Five|Four|Zero');
  });

  it('follows the year of a request: one year, a decade list, a range string, or none', async () => {
    await open();
    await sendOpt({ method: 'POST', body: { production_year: 2005 } });
    expect(kids.ranges.year.value).toBe(2005);
    await sendOpt({ method: 'POST', body: JSON.stringify({ production_year: [1990, 1999] }) });
    expect(kids.ranges.decade.value).toBe(1990);
    await sendOpt({ method: 'POST', body: { production_year: '2000,2005' } });
    expect(kids.ranges.year.displayValue).toBe('All');
    await sendOpt({ method: 'POST', body: { production_year: 1900 } });
    expect(kids.ranges.year.value).toBe(kids.ranges.year.min); // below the slider: pinned to "all"
    expect(kids.ranges.year.displayValue).toBe('All');
    await sendOpt({ method: 'POST', body: { production_year: [1900, 1909] } });
    expect(kids.ranges.decade.value).toBe(kids.ranges.decade.min);
    await sendOpt({ method: 'POST' });
    expect(kids.ranges.decade.displayValue).toBe('All');
  });

  it('survives a request body that is not JSON, and an empty request', async () => {
    await open();
    await sendOpt({ method: 'POST', body: '{bad' });
    expect(console.warn).toHaveBeenCalledWith('Error syncing sliders with opt:', expect.any(SyntaxError));
    await waitFor(() => expect(console.warn).toHaveBeenCalledWith('Error parsing opt.body:', expect.any(SyntaxError)));
    expect(helpHttp.post.mock.calls.at(-1)[1]).toEqual({ method: 'POST' });
    await sendOpt(null);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });
});

describe('Home, requests', () => {
  it('sends a request through the API, records it in the history, and resets the sort', async () => {
    renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    helpHttp.post.mockResolvedValue([S(9, 'Found', 2001, 1)]);
    act(() => kids.search.setOpt({ method: 'POST', body: { production_name: 'f' } }));
    await waitFor(() => expect(names()).toBe('Found'));
    expect(props.navigation.pushHistory).toHaveBeenCalledWith('request', {
      type: 'filter',
      data: { method: 'POST', body: { production_name: 'f' } },
    });
    expect(props.setSortOrder).toHaveBeenCalledWith(null);
    expect(screen.queryByTestId('loader')).toBeNull();
  });

  it('stores the catalog again when the request asks for all of it, and reverses on _reverse', async () => {
    renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    await sendOpt({ method: 'POST', body: { _reverse: true } });
    await waitFor(() => expect(names()).toBe('Eps|Delta|Gamma|Beta|Alpha'));
    expect(persistFullCatalog).toHaveBeenCalledTimes(2);
    expect(lastBody()).toEqual({});
  });

  it('keeps the shown series when a request fails', async () => {
    renderHome();
    await waitFor(() => expect(names()).toContain('Alpha'));
    helpHttp.post.mockResolvedValue({ err: { message: 'Bad' } });
    await sendOpt({ method: 'POST', body: { id: 1 } });
    expect(await screen.findByTestId('message')).toHaveTextContent('Bad');
    expect(names()).toContain('Alpha');
  });

  it('drops an answer that arrives after a newer request', async () => {
    renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    let first;
    helpHttp.post.mockReturnValueOnce(new Promise((r) => (first = r))).mockResolvedValueOnce([S(2, 'Second', 2000, 1)]);
    await sendOpt({ method: 'POST', body: { id: 1 } });
    await sendOpt({ method: 'POST', body: { id: 2 } });
    await waitFor(() => expect(names()).toBe('Second'));
    await act(async () => first([S(1, 'First', 2000, 1)]));
    expect(names()).toBe('Second');
  });

  it('answers from the cached catalog: a filter, all of it, or all of it reversed', async () => {
    getCachedFullCatalog.mockReturnValue(CAT);
    renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    await sendOpt({ method: 'POST', body: { production_name: 'beta' } });
    expect(names()).toBe('Beta');
    await sendOpt({ method: 'POST', body: {} });
    expect(names()).toBe('Alpha|Beta|Gamma|Delta|Eps');
    await sendOpt({ method: 'POST', body: { _reverse: true } });
    expect(names()).toBe('Eps|Delta|Gamma|Beta|Alpha');
    expect(helpHttp.post).toHaveBeenCalledTimes(1);
  });

  it('asks the API again for the last request when the refresh trigger changes', async () => {
    getCachedFullCatalog.mockReturnValue(CAT);
    const { update } = renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    update({ refreshTrigger: 1 }); // nothing asked yet: the whole catalog
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(2));
    expect(helpHttp.post.mock.calls[1][1]).toEqual({});
    await sendOpt({ method: 'POST', body: { id: 2 } });
    await sendOpt({});
    update({ refreshTrigger: 2 });
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(3));
    expect(lastBody()).toEqual({ id: 2 });
  });

  it('copies the top-ranking links when it can, and requests the top 250 or 100', async () => {
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByTitle('Top 100'));
    await waitFor(() => expect(lastBody()).toEqual({ limit: 100, production_ranking_number: 'ASC' }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/top100`);
    delete navigator.clipboard;
    fireEvent.click(screen.getByTitle('Top 250'));
    await waitFor(() => expect(lastBody()).toEqual({ limit: 250, production_ranking_number: 'ASC' }));
    fireEvent.click(screen.getByTitle('Top 100'));
    await waitFor(() => expect(lastBody()).toEqual({ limit: 100, production_ranking_number: 'ASC' }));
  });

  it('loads the top 250 or top 100 from their routes, with their SEO texts', async () => {
    const { unmount } = renderHome({}, '/top250');
    await waitFor(() => expect(lastBody()).toEqual({ limit: 250, production_ranking_number: 'ASC' }));
    expect(head('meta[property="og:title"]').content).toBe('Top 250 Anime | AnimeCream');
    expect(head('meta[property="og:description"]').content).toMatch(/^Discover the 250/);
    unmount();
    const es = renderHome({ language: 'es' }, '/top250');
    expect(head('meta[property="og:title"]').content).toBe('Top 250 Animes | AnimeCream');
    expect(head('meta[property="og:description"]').content).toMatch(/^Descubre los 250/);
    es.unmount();
    const hundred = renderHome({}, '/top100');
    await waitFor(() => expect(lastBody()).toEqual({ limit: 100, production_ranking_number: 'ASC' }));
    expect(head('meta[property="og:title"]').content).toBe('Top 100 Anime | AnimeCream');
    expect(head('meta[property="og:description"]').content).toMatch(/^Discover the 100/);
    hundred.unmount();
    renderHome({ language: 'es' }, '/top100');
    expect(head('meta[property="og:title"]').content).toBe('Top 100 Animes | AnimeCream');
    expect(head('meta[property="og:description"]').content).toMatch(/^Descubre los 100/);
  });
});

describe('Home, offline', () => {
  it('shows the full catalog source and filters it locally, with nothing sent', async () => {
    isAppOffline.mockReturnValue(true);
    getCachedFullCatalog.mockReturnValue(CAT);
    renderHome();
    expect(names()).toBe('Alpha|Beta|Gamma|Delta|Eps');
    getCachedFullCatalog.mockReturnValue(null); // the request effect falls back to the source in memory
    await sendOpt({ method: 'POST', body: { production_name: 'gam' } });
    expect(names()).toBe('Gamma');
    await sendOpt({ method: 'POST', body: { _reverse: true } });
    expect(names()).toBe('Delta|Eps|Alpha|Gamma|Beta');
    await sendOpt({ method: 'POST', body: { production_year: 2005 } }); // the slider path
    expect(names()).toBe('Beta|Alpha');
    expect(helpHttp.post).not.toHaveBeenCalled();
  });

  it('keeps the bundled seed when nothing is cached, and filters it', async () => {
    isAppOffline.mockReturnValue(true);
    renderHome({}, '/2005');
    const seed = names();
    expect(seed.length).toBeGreaterThan(0);
    await sendOpt({ method: 'POST', body: { _reverse: true, production_name: 'zzz-none' } });
    expect(screen.getByText('No Data Found')).toBeInTheDocument();
    await sendOpt({ method: 'POST', body: {} });
    expect(names().split('|')).toHaveLength(seed.split('|').length);
  });

  it('falls back to the cache, then to what is shown, when the catalog in memory is empty', async () => {
    helpHttp.post.mockResolvedValue([]);
    const { update } = renderHome();
    expect(await screen.findByText('No Data Found')).toBeInTheDocument();
    isAppOffline.mockReturnValue(true);
    getCachedFullCatalog.mockReturnValue(CAT);
    update({ refreshTrigger: 1 });
    await waitFor(() => expect(names()).toBe('Alpha|Beta|Gamma|Delta|Eps'));
    getCachedFullCatalog.mockReturnValue(null);
    await sendOpt({ method: 'POST', body: { production_name: 'alp' } });
    expect(names()).toBe('Alpha');
  });
});

describe('Home, loading a list by ids', () => {
  it('loads the ids in their order, from a { data } answer, skipping invalid ones', async () => {
    helpHttp.post.mockImplementation((url, opt) =>
      Promise.resolve(opt.body?.id ? { data: [CAT[0], { production_ranking_number: 3, production_name: 'ByRank' }, {}] } : CAT)
    );
    renderHome({ loadByIds: ['3', 1, null, 'x', -2] });
    await waitFor(() => expect(names()).toBe('ByRank|Alpha'));
    expect(helpHttp.post).toHaveBeenCalledWith(expect.any(String), { body: { id: [3, 1] } });
    expect(props.onSeriesDataChange).toHaveBeenCalledWith([{ production_ranking_number: 3, production_name: 'ByRank' }, CAT[0]]);
  });

  it('shows the whole answer when none of it matches, and keeps the list away from the route filter', async () => {
    helpHttp.post.mockImplementation((url, opt) => Promise.resolve(opt.body?.id ? [S(50, 'Other', 1990, 1)] : CAT));
    renderHome({ loadByIds: [7] }, '/2005');
    await waitFor(() => expect(names()).toBe('Other'));
  });

  it('answers from the cached catalog when there is one', async () => {
    getCachedFullCatalog.mockReturnValue(CAT);
    const { update } = renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    update({ loadByIds: [2, 1] });
    await waitFor(() => expect(names()).toBe('Beta|Alpha'));
    expect(helpHttp.post).not.toHaveBeenCalledWith(expect.any(String), { body: { id: [2, 1] } });
  });

  it('says so when no id is valid, or the API fails or errs, and loads a later list', async () => {
    const { update } = renderHome({ loadByIds: ['x'] });
    expect(await screen.findByTestId('message')).toHaveTextContent('Error loading series by IDs');
    helpHttp.post.mockResolvedValue({ err: { message: 'Nope' } });
    update({ loadByIds: [1] });
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('Nope'));
    helpHttp.post.mockResolvedValue(CAT);
    update({ loadByIds: [] });
    update({ loadByIds: [2] });
    await waitFor(() => expect(names()).toBe('Beta'));
  });

  it('ignores a new list while one is loading, and loads once under StrictMode', async () => {
    let answer;
    helpHttp.post.mockImplementation((url, opt) => (opt.body?.id ? new Promise((r) => (answer = r)) : Promise.resolve(CAT)));
    window.history.pushState({}, '', '/');
    props = { ...baseProps(), loadByIds: [1] };
    const { rerender } = render(<StrictMode>{ui(props)}</StrictMode>);
    await waitFor(() => expect(answer).toBeDefined());
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    rerender(<StrictMode>{ui({ ...props, loadByIds: [2] })}</StrictMode>);
    sendOpt({ method: 'POST', body: { id: 5 } }); // waits for the list
    await act(async () => answer([CAT[0]]));
    await waitFor(() => expect(names()).toBe('Alpha'));
    expect(helpHttp.post.mock.calls.filter(([, o]) => o.body?.id)).toHaveLength(1);
  });

  it('closes the loader on a click', async () => {
    helpHttp.post.mockImplementation((url, opt) => (opt.body?.id ? new Promise(() => {}) : Promise.resolve(CAT)));
    renderHome({ loadByIds: [1] });
    fireEvent.click(await screen.findByTestId('loader'));
    expect(screen.queryByTestId('loader')).toBeNull();
  });
});

describe('Home, a shared list route', () => {
  it('loads the ids in the order of the link, with noindex and its canonical link', async () => {
    helpHttp.post.mockImplementation((url, opt) => Promise.resolve(opt.body?.id ? { data: [CAT[0], CAT[1]] } : CAT));
    renderHome({}, '/list/2,1,0,x');
    await waitFor(() => expect(names()).toBe('Beta|Alpha'));
    expect(helpHttp.post).toHaveBeenCalledWith(expect.any(String), { body: { id: [2, 1] } });
    expect(head('meta[name="robots"]').content).toBe('noindex, nofollow');
    expect(head('link[rel="canonical"]').href).toBe('https://animecream.com/list/2,1');
  });

  it('shows the whole answer when the ids are not in it, and reads a plain list', async () => {
    helpHttp.post.mockImplementation((url, opt) => Promise.resolve(opt.body?.id ? [CAT[2]] : CAT));
    renderHome({}, '/list/9');
    await waitFor(() => expect(names()).toBe('Gamma'));
  });

  it('shows an API error or a failed request', async () => {
    helpHttp.post.mockImplementation((url, opt) => Promise.resolve(opt.body?.id ? { err: { message: 'Gone' } } : CAT));
    const { unmount } = renderHome({}, '/list/1');
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('Gone'));
    unmount();
    helpHttp.post.mockImplementation((url, opt) => (opt.body?.id ? Promise.reject(new Error('x')) : Promise.resolve(CAT)));
    renderHome({}, '/list/1');
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('Error loading data'));
  });

  it('reads the list from the catalog in memory when offline', async () => {
    isAppOffline.mockReturnValue(true);
    getCachedFullCatalog.mockReturnValue(CAT);
    renderHome({}, '/list/3,1');
    await waitFor(() => expect(names()).toBe('Gamma|Alpha'));
  });

  it('is not a list without valid ids', async () => {
    renderHome({}, '/list/x,0');
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalled());
    expect(head('meta[name="robots"]')).toBeNull();
  });
});

describe('Home, a genre or demographic slug', () => {
  it('finds a genre in the cached catalog, by its Spanish or English name, with both alternates', async () => {
    getCachedFullCatalog.mockReturnValue(CAT);
    const { unmount } = renderHome({}, '/action');
    await waitFor(() => expect(names()).toBe('Alpha'));
    expect(head('link[hreflang="es"]').href).toBe('https://animecream.com/accion');
    expect(head('link[hreflang="en"]').href).toBe('https://animecream.com/action');
    expect(head('link[hreflang="x-default"]').href).toBe('https://animecream.com/action');
    expect(head('meta[property="og:title"]').content).toBe('Action Anime | AnimeCream');
    unmount();
    renderHome({ language: 'es' }, '/comedia');
    await waitFor(() => expect(names()).toBe('Alpha'));
    expect(head('meta[property="og:title"]').content).toBe('Animes de Comedia | AnimeCream');
  });

  it('finds a demographic in the cached catalog, and keeps one canonical when the names agree', async () => {
    getCachedFullCatalog.mockReturnValue(CAT);
    const { unmount } = renderHome({}, '/shonen');
    await waitFor(() => expect(names()).toBe('Alpha'));
    unmount();
    renderHome({}, '/seinen');
    await waitFor(() => expect(names()).toBe('Beta'));
    expect(head('link[hreflang="es"]').href).toBe('https://animecream.com/seinen');
  });

  it('asks the API for the options when the catalog is not cached, and stores them', async () => {
    helpHttp.get.mockImplementation((url) =>
      Promise.resolve(url.endsWith('genres') ? { genres: [{ name: 'Drama' }] } : { data: [{ name: 'Seinen' }] })
    );
    const { unmount } = renderHome({}, '/drama');
    await waitFor(() => expect(lastBody()).toEqual({ genre_names: 'Drama', production_ranking_number: 'ASC' }));
    expect(JSON.parse(localStorage.getItem('options_genres'))).toEqual([{ name: 'Drama' }]);
    expect(localStorage.getItem('options_demographics_ts')).not.toBeNull();
    unmount();
    renderHome({}, '/seinen'); // now from the stored options
    await waitFor(() => expect(lastBody()).toEqual({ demographic_name: 'Seinen', production_ranking_number: 'ASC' }));
    expect(helpHttp.get).toHaveBeenCalledTimes(2);
  });

  it('asks again when the stored options are old, unreadable or answered with an error', async () => {
    const old = String(Date.now() - 25 * 60 * 60 * 1000);
    localStorage.setItem('options_genres', '[{"name":"Drama"}]');
    localStorage.setItem('options_genres_ts', old);
    localStorage.setItem('options_demographics', '{bad');
    localStorage.setItem('options_demographics_ts', String(Date.now()));
    helpHttp.get.mockImplementation((url) => Promise.resolve(url.endsWith('genres') ? { err: {} } : {}));
    const { unmount } = renderHome({}, '/drama');
    await waitFor(() => expect(lastBody()).toEqual({ production_ranking_number: 'ASC' }));
    expect(localStorage.getItem('options_genres_ts')).toBe(old);
    unmount();
    localStorage.clear();
    helpHttp.get.mockImplementation((url) => Promise.resolve(url.endsWith('genres') ? {} : { err: {} }));
    renderHome({}, '/drama');
    await waitFor(() => expect(helpHttp.get).toHaveBeenCalledTimes(4));
  });

  it('falls back to the ranking when the cached catalog has no such slug, or is empty', async () => {
    getCachedFullCatalog.mockReturnValue(CAT);
    const { unmount } = renderHome({}, '/nothing-here');
    await waitFor(() => expect(props.navigation.pushHistory).toHaveBeenCalledWith('request', { type: 'filter', data: { method: 'POST', body: { production_ranking_number: 'ASC' } } }));
    unmount();
    getCachedFullCatalog.mockReturnValue([]);
    renderHome({}, '/nothing-here');
    await waitFor(() => expect(helpHttp.get).toHaveBeenCalled());
  });
});

describe('Home, the history', () => {
  it('restores an earlier request without recording it again', async () => {
    const { update } = renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    vi.useFakeTimers({ shouldAdvanceTime: true });
    update({ navigation: { ...props.navigation, currentState: { type: 'request', data: { data: { method: 'POST', body: { id: 3 } } } } } });
    act(() => kids.search.setOpt({ method: 'POST', body: { id: 4 } })); // while restoring: not recorded
    expect(props.navigation.pushHistory).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(60));
    act(() => kids.search.setOpt({ method: 'POST', body: { id: 5 } }));
    expect(props.navigation.pushHistory).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('goes back to the first catalog on the initial entry, and ignores other entries', async () => {
    const { update } = renderHome();
    await waitFor(() => expect(names()).toBe('Alpha|Beta|Gamma|Delta|Eps'));
    helpHttp.post.mockResolvedValue([S(9, 'Found', 2001, 1)]);
    await sendOpt({ method: 'POST', body: { id: 9 } });
    await waitFor(() => expect(names()).toBe('Found'));
    vi.useFakeTimers({ shouldAdvanceTime: true });
    update({ navigation: { ...props.navigation, currentState: { type: 'initial', data: null } } });
    expect(names()).toBe('Alpha|Beta|Gamma|Delta|Eps');
    act(() => vi.advanceTimersByTime(100));
    vi.useRealTimers();
    update({ navigation: { ...props.navigation, currentState: { type: 'request', data: null } } });
    update({ navigation: { ...props.navigation, currentState: { type: 'other' } } });
    expect(names()).toBe('Alpha|Beta|Gamma|Delta|Eps');
  });
});

describe('Home, the toolbar', () => {
  it('opens the advanced search scrolled to the top, of the tab or the window, and closes it', () => {
    window.scrollTo = vi.fn();
    const { update } = renderHome();
    fireEvent.click(screen.getByTitle('Search'));
    expect(props.setIsAdvancedSearchVisible).toHaveBeenCalledWith(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    const tab = document.createElement('div');
    tab.className = 'section-tab';
    tab.scrollTo = vi.fn();
    document.body.appendChild(tab);
    fireEvent.click(screen.getByTitle('Search'));
    expect(tab.scrollTo).toHaveBeenCalled();
    tab.remove();
    update({ isAdvancedSearchVisible: true });
    fireEvent.click(screen.getByTitle('🔍 Close Advanced Search'));
    expect(props.setIsAdvancedSearchVisible).toHaveBeenLastCalledWith(false);
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('shows the language and sort state, and opens the lists', () => {
    const { update } = renderHome({ language: 'es', sortOrder: 'asc' });
    expect(screen.getByTitle('ENG')).toHaveTextContent('ES');
    expect(screen.getByTitle('Ranking Order')).toHaveTextContent('▲');
    update({ sortOrder: 'desc' });
    expect(screen.getByTitle('Ranking Order')).toHaveTextContent('▼');
    fireEvent.doubleClick(screen.getByTitle('ENG'));
    expect(props.onLanguageDoubleClick).toHaveBeenCalled();
    fireEvent.click(screen.getByTitle('My Lists'));
    expect(props.onShowListManager).toHaveBeenCalled();
  });

  it('hides itself after five quick clicks, and counts again after a pause', () => {
    vi.useFakeTimers();
    renderHome();
    const bar = document.querySelector('.home-toolbar');
    for (let i = 0; i < 4; i++) fireEvent.click(bar);
    act(() => vi.advanceTimersByTime(1000));
    for (let i = 0; i < 4; i++) fireEvent.click(bar);
    expect(document.querySelector('.home-toolbar')).not.toBeNull();
    fireEvent.click(bar);
    expect(document.querySelector('.home-toolbar')).toBeNull();
    vi.useRealTimers();
  });

  it('hands the cards the shown series and lets them send a request', async () => {
    renderHome();
    await waitFor(() => expect(kids.card.data).toEqual(CAT));
    expect(kids.card.onFilteredDataChange).toBe(props.onSeriesDataChange);
    expect(head('meta[property="og:image"]').content).toBe('img/1');
    expect(head('meta[name="twitter:image"]').content).toBe('img/1');
    expect(head('meta[property="og:locale"]').content).toBe('en_US');
    act(() => kids.card.onFilterChange({ method: 'POST', body: { id: 2 } }));
    await waitFor(() => expect(lastBody()).toEqual({ id: 2 }));
  });

  it('uses the default SEO texts and image when nothing is shown', async () => {
    helpHttp.post.mockResolvedValue([]);
    const { update } = renderHome({ language: 'es' });
    expect(await screen.findByText('No Data Found')).toBeInTheDocument();
    expect(head('meta[property="og:title"]').content).toBe('AnimeCream');
    expect(head('meta[property="og:description"]').content).toMatch(/^Explora las mejores/);
    expect(head('meta[property="og:image"]').content).toMatch(/AnimecreamTargetaSEO\.png$/);
    expect(head('meta[property="og:locale"]').content).toBe('es_ES');
    expect(head('link[rel="canonical"]').href).toBe('https://animecream.com/');
    update({ language: 'en' });
    expect(head('meta[property="og:description"]').content).toMatch(/^Explore the best/);
  });

  it('describes the first series shown, in Spanish', async () => {
    renderHome({ language: 'es' });
    await waitFor(() => expect(head('meta[property="og:description"]').content).toBe('Alpha es'));
  });
});

describe('Home, unusual answers and data', () => {
  // G15: only a list or { data: list } is a series answer. Anything else is a load error: the series
  // shown stay, the error message appears and nothing is cached.
  const UNEXPECTED = [{ unexpected: true }, { data: null }, { data: 'x' }, null, 'text'];

  it('keeps the bundled seed and caches nothing when the catalog answer is not a list', async () => {
    for (const answer of UNEXPECTED) {
      helpHttp.post.mockResolvedValue(answer);
      const { unmount } = renderHome();
      const seed = names();
      expect(await screen.findByTestId('message')).toHaveTextContent('Error loading data');
      expect(names()).toBe(seed);
      unmount();
    }
    expect(persistFullCatalog).not.toHaveBeenCalled();
  });

  it('reads a { data } answer to a request', async () => {
    renderHome();
    await waitFor(() => expect(helpHttp.post).toHaveBeenCalledTimes(1));
    helpHttp.post.mockResolvedValue({ data: [S(6, 'Inside', 2001, 1)] });
    await sendOpt({ method: 'POST', body: { id: 6 } });
    await waitFor(() => expect(names()).toBe('Inside'));
  });

  it('keeps the series shown and caches nothing when a request answer is not a list', async () => {
    renderHome();
    await waitFor(() => expect(names()).toBe('Alpha|Beta|Gamma|Delta|Eps'));
    for (const [i, answer] of UNEXPECTED.entries()) {
      helpHttp.post.mockResolvedValue(answer);
      await sendOpt({ method: 'POST', body: i % 2 ? {} : { id: i + 1 } }); // the full catalog too
      expect(await screen.findByTestId('message')).toHaveTextContent('Error loading data');
      expect(names()).toBe('Alpha|Beta|Gamma|Delta|Eps');
      expect(screen.queryByTestId('loader')).toBeNull();
      fireEvent.doubleClick(screen.getByTestId('message'));
    }
    expect(persistFullCatalog).toHaveBeenCalledTimes(1); // the first, valid load only
  });

  it('says a list could not be loaded when its answer is not a list', async () => {
    for (const answer of UNEXPECTED) {
      helpHttp.post.mockImplementation((url, opt) => Promise.resolve(opt.body?.id ? answer : CAT));
      const { unmount } = renderHome({ loadByIds: [1] });
      expect(await screen.findByTestId('message')).toHaveTextContent('Error loading series by IDs');
      unmount();
      const route = renderHome({}, '/list/1');
      expect(await screen.findByTestId('message')).toHaveTextContent('Error loading data');
      route.unmount();
    }
  });

  it('sorts unranked series and series without a valid year on a route, ranked first', async () => {
    helpHttp.post.mockResolvedValue([S(1, 'U1', 2001, null), S(2, 'U2', 2002, null), S(3, 'R', 2003, 1), S(4, 'U3', 2004, null)]);
    const { unmount } = renderHome({}, '/2000s');
    await waitFor(() => expect(names()).toBe('R|U3|U2|U1'));
    unmount();
    helpHttp.post.mockResolvedValue([S(1, 'X1', 'x', 2), S(2, 'X2', 'y', 2), S(3, 'Y', 2001, 2), S(4, 'X3', '', 2)]);
    renderHome({}, '/1800');
    await waitFor(() => expect(names().split('|')[0]).toBe('Y')); // the only valid year is the newest
  });

  it('sorts series of a year 0 within the first decade', async () => {
    helpHttp.post.mockResolvedValue([S(1, 'Z1', 0, 1), S(2, 'Five', 5, 1), S(3, 'Z2', 0, 1), S(4, 'Four', 4, 1)]);
    renderHome();
    await waitFor(() => expect(names()).toBe('Z1|Five|Z2|Four'));
    fireEvent.click(screen.getByTitle('Mostrar Filtros'));
    act(() => kids.ranges.decade.onChange(0));
    expect(names()).toBe('Five|Four|Z1|Z2');
  });

  it('asks for the options when only their date was stored, and tries each demographic by both names', async () => {
    localStorage.setItem('options_genres_ts', String(Date.now()));
    localStorage.setItem('options_demographics_ts', String(Date.now()));
    helpHttp.get.mockImplementation((url) =>
      Promise.resolve(url.endsWith('genres') ? { genres: [{ name: 'Drama' }] } : { demographics: [{ name: 'Josei' }, { name: 'Shōnen' }] })
    );
    renderHome({}, '/shounen-like');
    await waitFor(() => expect(helpHttp.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(props.navigation.pushHistory).toHaveBeenCalledWith('request', { type: 'filter', data: { method: 'POST', body: { production_ranking_number: 'ASC' } } }));
  });
});
