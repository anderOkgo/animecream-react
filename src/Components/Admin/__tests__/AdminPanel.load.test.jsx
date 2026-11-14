import { vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminPanel from '../AdminPanel';

// Loading: the genre and demographic options (cache, API, errors) and a series to edit in each
// shape the API or the cards can give, read into both the JSON text and the form.
vi.mock('../../../helpers/helpHttp', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() } }));
import helpHttp from '../../../helpers/helpHttp';
vi.mock('../../../services/auth.service', () => ({ default: { getCurrentUser: vi.fn(() => null) } }));
import AuthService from '../../../services/auth.service';

const GENRES = [{ id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }];
const DEMOS = [{ id: 1, name: 'Shounen' }, { id: 3, name: 'Seinen' }];
const baseProps = {
  t: (k) => k,
  seriesToEdit: null,
  onEditCancel: vi.fn(),
  onEditComplete: vi.fn(),
  setProc: vi.fn(),
  proc: false,
  init: true,
  setGlobalMessage: vi.fn(),
};
const renderAdmin = (props = {}) => render(<AdminPanel {...baseProps} {...props} />);
const api = (series) =>
  helpHttp.get.mockImplementation((url) => {
    if (url.endsWith('genres')) return Promise.resolve({ genres: GENRES });
    if (url.endsWith('demographics')) return Promise.resolve({ demographics: DEMOS });
    return typeof series === 'function' ? series(url) : Promise.resolve(series);
  });
const json = () => JSON.parse(document.getElementById('jsonData').value);
const toJson = () => fireEvent.click(screen.getByLabelText('useJSON'));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  AuthService.getCurrentUser.mockReturnValue(null);
  api({});
});

describe('AdminPanel, options', () => {
  it('uses cached options and asks the API for nothing', async () => {
    localStorage.setItem('options_genres', JSON.stringify(GENRES));
    localStorage.setItem('options_demographics', JSON.stringify(DEMOS));
    renderAdmin();
    fireEvent.click(screen.getByLabelText('useForm'));
    expect(await screen.findByRole('option', { name: 'Seinen' })).toBeInTheDocument();
    expect(helpHttp.get).not.toHaveBeenCalled();
  });

  it('asks only for what is not cached, with the token, accepting a `data` list', async () => {
    localStorage.setItem('options_genres', JSON.stringify(GENRES));
    AuthService.getCurrentUser.mockReturnValue({ token: 'tok' });
    helpHttp.get.mockResolvedValue({ data: DEMOS });
    renderAdmin();
    await waitFor(() => expect(localStorage.getItem('options_demographics')).not.toBeNull());
    expect(helpHttp.get).toHaveBeenCalledTimes(1);
    expect(helpHttp.get).toHaveBeenCalledWith(expect.stringMatching(/demographics$/), { token: 'Bearer tok' });
  });

  it('keeps going on an unreadable cache, errors, empty lists or a failed request', async () => {
    localStorage.setItem('options_genres', '{bad');
    helpHttp.get.mockImplementation((url) =>
      Promise.resolve(url.endsWith('genres') ? { err: { message: 'down' } } : { demographics: [] })
    );
    const { unmount } = renderAdmin();
    await waitFor(() => expect(helpHttp.get).toHaveBeenCalledTimes(2));
    unmount();
    helpHttp.get.mockImplementation((url) => Promise.resolve(url.endsWith('genres') ? { data: [] } : { err: {} }));
    const second = renderAdmin();
    await waitFor(() => expect(helpHttp.get).toHaveBeenCalledTimes(4));
    second.unmount();
    helpHttp.get.mockImplementation((url) => Promise.resolve(url.endsWith('genres') ? {} : {}));
    const third = renderAdmin();
    await waitFor(() => expect(helpHttp.get).toHaveBeenCalledTimes(6));
    third.unmount();
    helpHttp.get.mockRejectedValue(new Error('network'));
    renderAdmin();
    await waitFor(() => expect(helpHttp.get).toHaveBeenCalledTimes(8));
    expect(localStorage.getItem('options_demographics')).toBeNull();
  });

  it('shows Loading for the genres while the options load', () => {
    helpHttp.get.mockReturnValue(new Promise(() => {}));
    renderAdmin({ t: () => '' });
    fireEvent.click(screen.getByLabelText('Use Form'));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('AdminPanel, the series to edit', () => {
  it('reads a series from the API, with nested data and every field', async () => {
    api({
      data: {
        id: 42,
        production_name: 'Naruto',
        production_year: 2002,
        production_number_chapters: 220,
        production_description: 'ES',
        production_description_en: 'EN',
        qualification: 9,
        demography_id: 3,
        visible: false,
        genres: [{ id: 1 }, 2, 'x'],
        titles: [{ id: 5, name: 'Naruto Uzumaki' }, { name: 'No id' }, 'Plain', '', 7],
      },
    });
    renderAdmin({ seriesToEdit: { id: 42 } });
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('Naruto'));
    expect(screen.getByLabelText(/chapters/)).toHaveValue(220);
    expect(screen.getByLabelText(/demographic/)).toHaveValue('3');
    expect(screen.getAllByPlaceholderText('alternativeTitle').map((i) => i.value)).toEqual(['Naruto Uzumaki', 'No id', 'Plain']);
    toJson();
    expect(json()).toMatchObject({ name: 'Naruto', year: 2002, visible: false, genres: [1, 2], titles: ['Naruto Uzumaki', 'No id', 'Plain'] });
  });

  it('reads the other field names, visible_flag, and the demographic by name', async () => {
    localStorage.setItem('options_genres', JSON.stringify(GENRES));
    localStorage.setItem('options_demographics', JSON.stringify(DEMOS));
    api({
      name: 'Alt',
      year: 1999,
      chapterNumber: 12,
      description: 'd',
      descriptionEn: 'de',
      qualification_number: 4,
      demographic_name: 'seinen',
      visible_flag: false,
    });
    // As in the app: AdminPanel is mounted (and has its options) before a series is sent to edit
    const { rerender } = renderAdmin();
    rerender(<AdminPanel {...baseProps} seriesToEdit={{ id: 7 }} />);
    fireEvent.click(screen.getByLabelText('useForm')); // mounted without a series: JSON mode
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('Alt'));
    expect(screen.getByLabelText(/demographic/)).toHaveValue('3');
    expect(screen.getAllByPlaceholderText('alternativeTitle')).toHaveLength(1); // one empty title field
    toJson();
    expect(json()).toMatchObject({ name: 'Alt', chapter_number: 12, description_en: 'de', qualification: 4, visible: false });
  });

  it('falls back to defaults: no name, demography 1, visible, an unknown demographic name', async () => {
    localStorage.setItem('options_genres', JSON.stringify(GENRES));
    localStorage.setItem('options_demographics', JSON.stringify(DEMOS));
    api({ id: 8, demography: { id: 3 }, chapter_number: 5, description_en: 'x', demographic_name: 'Nope' });
    const { rerender } = renderAdmin();
    rerender(<AdminPanel {...baseProps} seriesToEdit={{ id: 8 }} />);
    fireEvent.click(screen.getByLabelText('useForm'));
    await waitFor(() => expect(screen.getByLabelText(/demographic/)).toHaveValue('1'));
    toJson();
    expect(json()).toMatchObject({ name: '', year: '', chapter_number: 5, demography_id: 3, visible: true, genres: [], titles: [] });
  });

  it('uses the card itself when it has no id, or when the API fails or answers an error', async () => {
    const card = { production_name: 'Card only', genres: 'not a list', titles: 'not a list' };
    const { unmount } = renderAdmin({ seriesToEdit: card });
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('Card only'));
    unmount();

    api(() => Promise.resolve({ err: { message: 'Not found' } }));
    const second = renderAdmin({ seriesToEdit: { id: 9, production_name: 'From card' } });
    await waitFor(() => expect(baseProps.setGlobalMessage).toHaveBeenCalledWith({ type: 'warning', error: 'Not found', fallbackKey: 'errorLoadingData' }));
    expect(screen.getByLabelText(/seriesName/)).toHaveValue('From card');
    second.unmount();

    api(() => Promise.reject(new Error('network')));
    renderAdmin({ seriesToEdit: { id: 10, production_name: 'Offline card' } });
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('Offline card'));
    expect(baseProps.setProc).toHaveBeenCalledWith(false);
  });

  it('keeps the series whose id the API does not echo', async () => {
    api({ production_name: 'No id back' });
    renderAdmin({ seriesToEdit: { id: 11 } });
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('No id back'));
  });

  it('ignores an answer that arrives after the edit moved on to another series', async () => {
    localStorage.setItem('options_genres', JSON.stringify(GENRES));
    localStorage.setItem('options_demographics', JSON.stringify(DEMOS));
    const pending = {};
    api((url) => new Promise((resolve, reject) => (pending[url.match(/\d+$/)[0]] = { resolve, reject })));
    const { rerender } = renderAdmin({ seriesToEdit: { id: 1 } });
    await waitFor(() => expect(pending[1]).toBeDefined());
    rerender(<AdminPanel {...baseProps} seriesToEdit={{ id: 2 }} />);
    await waitFor(() => expect(pending[2]).toBeDefined());
    pending[1].resolve({ production_name: 'Old' });
    pending[2].resolve({ production_name: 'New' });
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('New'));

    rerender(<AdminPanel {...baseProps} seriesToEdit={{ id: 3 }} />);
    await waitFor(() => expect(pending[3]).toBeDefined());
    rerender(<AdminPanel {...baseProps} seriesToEdit={{ id: 4 }} />);
    pending[3].reject(new Error('late failure'));
    await waitFor(() => expect(pending[4]).toBeDefined());
    pending[4].resolve({ production_name: 'Latest' });
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('Latest'));
  });

  it('stops loading a series when the edit moved on while its options were still loading', async () => {
    const optionAnswers = [];
    helpHttp.get.mockImplementation((url) => {
      if (url.endsWith('genres')) return new Promise((r) => optionAnswers.push(() => r({ genres: GENRES })));
      if (url.endsWith('demographics')) return new Promise((r) => optionAnswers.push(() => r({ demographics: DEMOS })));
      return Promise.resolve({ production_name: `Series ${url.match(/\d+$/)[0]}` });
    });
    const { rerender } = renderAdmin({ seriesToEdit: { id: 1 } });
    rerender(<AdminPanel {...baseProps} seriesToEdit={{ id: 2 }} />);
    optionAnswers.forEach((answer) => answer());
    await waitFor(() => expect(screen.getByLabelText(/seriesName/)).toHaveValue('Series 2'));
    expect(helpHttp.get).not.toHaveBeenCalledWith(expect.stringMatching(/1$/), expect.anything());
  });
});
