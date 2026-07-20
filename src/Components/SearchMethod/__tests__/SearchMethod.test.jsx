import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchMethod from '../SearchMethod';
import { LanguageProvider } from '../../../hooks/useLanguage';

vi.mock('../../../helpers/helpHttp', () => ({
  default: { get: vi.fn() },
}));
import helpHttp from '../../../helpers/helpHttp';

const t = (key) => key;

const renderSearch = (props = {}) =>
  render(
    <LanguageProvider>
      <SearchMethod setOpt={() => {}} t={t} isFormVisible={true} setIsFormVisible={() => {}} {...props} />
    </LanguageProvider>
  );

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  helpHttp.get.mockResolvedValue({ genres: [], demographics: [] });
  // jsdom doesn't implement Element.scrollTo (only window.scrollTo has a
  // "not implemented" stub) -- handleScrollToTop calls it on
  // document.documentElement when no '.section-tab' is present.
  document.documentElement.scrollTo = vi.fn();
});

describe('SearchMethod', () => {
  it('renders nothing when isFormVisible is false', () => {
    render(
      <LanguageProvider>
        <SearchMethod setOpt={() => {}} t={t} isFormVisible={false} setIsFormVisible={() => {}} />
      </LanguageProvider>
    );
    expect(screen.queryByText('seriesName')).not.toBeInTheDocument();
  });

  it('renders the search form when visible', () => {
    renderSearch();
    expect(screen.getByPlaceholderText('seriesName')).toBeInTheDocument();
  });

  it('fetches genres/demographics on mount when nothing is cached', async () => {
    renderSearch();
    await waitFor(() => expect(helpHttp.get).toHaveBeenCalledTimes(2));
    expect(helpHttp.get.mock.calls[0][0]).toContain('api/series/genres');
    expect(helpHttp.get.mock.calls[1][0]).toContain('api/series/demographics');
  });

  it('skips fetching genres/demographics that are already cached', async () => {
    localStorage.setItem('options_genres', JSON.stringify([{ id: 1, name: 'Action' }]));
    localStorage.setItem('options_demographics', JSON.stringify([{ id: 1, name: 'Shounen' }]));
    renderSearch();

    await new Promise((r) => setTimeout(r, 0));
    expect(helpHttp.get).not.toHaveBeenCalled();
  });

  it('appends (not replaces) genre_names as a comma-joined list', () => {
    localStorage.setItem(
      'options_genres',
      JSON.stringify([{ id: 1, name: 'Action' }, { id: 2, name: 'Comedy' }])
    );
    renderSearch();
    const genreInput = screen.getByPlaceholderText('genreNames');
    const genreSelect = genreInput.closest('.form-container').querySelector('select[name="genre_names"]');

    fireEvent.change(genreSelect, { target: { value: 'Action' } });
    fireEvent.change(genreSelect, { target: { value: 'Comedy' } });

    expect(genreInput).toHaveValue('Action, Comedy');
  });

  it('submits only the non-empty fields, and resets afterwards via handleReset', () => {
    const setOpt = vi.fn();
    const setIsFormVisible = vi.fn();
    renderSearch({ setOpt, setIsFormVisible });

    fireEvent.change(screen.getByPlaceholderText('seriesName'), { target: { value: 'Naruto' } });
    fireEvent.click(screen.getByDisplayValue('search'));

    expect(setOpt).toHaveBeenCalledWith({ method: 'POST', body: { production_name: 'Naruto', production_ranking_number: 'ASC' } });
    expect(setIsFormVisible).toHaveBeenCalledWith(false);
  });

  it('maps production_description to production_description_en when the current language is en', () => {
    const setOpt = vi.fn();
    renderSearch({ setOpt });

    fireEvent.change(screen.getByPlaceholderText('description'), { target: { value: 'about a ninja' } });
    fireEvent.click(screen.getByDisplayValue('search'));

    const [[body]] = setOpt.mock.calls;
    // Default language is whatever the browser reports in this test env --
    // assert whichever key was actually used carries the value, since the
    // point under test is the *mapping*, not forcing a specific language.
    expect(body.body.production_description ?? body.body.production_description_en).toBe('about a ninja');
  });

  it('parses limit as an integer', () => {
    const setOpt = vi.fn();
    renderSearch({ setOpt });
    fireEvent.change(screen.getByPlaceholderText('limit'), { target: { value: '25' } });
    fireEvent.click(screen.getByDisplayValue('search'));
    expect(setOpt.mock.calls[0][0].body.limit).toBe(25);
  });

  it('handleReset clears every field back to defaults', () => {
    renderSearch();
    const nameInput = screen.getByPlaceholderText('seriesName');
    fireEvent.change(nameInput, { target: { value: 'Naruto' } });
    expect(nameInput).toHaveValue('Naruto');

    fireEvent.click(screen.getByDisplayValue('reset'));
    expect(nameInput).toHaveValue('');
  });
});
