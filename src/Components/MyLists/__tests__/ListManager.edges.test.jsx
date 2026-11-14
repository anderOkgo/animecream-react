import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListManager from '../ListManager';

// Edge cases: clipboard failures (and the execCommand fallback), untranslated labels, lists with
// missing fields, a selected list deleted elsewhere, and calls without the optional callbacks.
let translate = (key) => key;
vi.mock('../../../hooks/useLanguage', () => ({ useLanguage: () => ({ t: (key) => translate(key) }) }));

const setList = (id, data) => localStorage.setItem(id, JSON.stringify(data));
const select = (id) => fireEvent.change(document.querySelector('.list-select'), { target: { value: id } });

beforeEach(() => {
  translate = (key) => key;
  localStorage.clear();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  navigator.clipboard = { writeText: vi.fn().mockRejectedValue(new Error('denied')) };
  document.execCommand = vi.fn(() => true);
});
afterEach(() => vi.restoreAllMocks());

describe('ListManager, clipboard fallbacks', () => {
  beforeEach(() => setList('list_1', { name: 'Favs', items: [{ id: 1, name: 'Naruto' }, { name: 'No id' }] }));

  it('copies with execCommand when the clipboard API fails, numbering when asked', async () => {
    render(<ListManager onClose={() => {}} />);
    select('list_1');
    fireEvent.click(document.querySelector('.btn-recalculate-index'));
    fireEvent.click(document.querySelector('.btn-copy-list'));
    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith('copy'));
    expect(window.alert).toHaveBeenCalledWith('listCopied');
    expect(document.querySelector('textarea')).toBeNull(); // the helper textarea is removed
  });

  it('says it could not copy when execCommand fails too', async () => {
    document.execCommand = vi.fn(() => {
      throw new Error('no');
    });
    render(<ListManager onClose={() => {}} />);
    select('list_1');
    fireEvent.click(document.querySelector('.btn-copy-list'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('copyError'));
    fireEvent.click(document.querySelector('.btn-share-list'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledTimes(2));
  });

  it('shares with execCommand when the clipboard API fails', async () => {
    render(<ListManager onClose={() => {}} />);
    select('list_1');
    fireEvent.click(document.querySelector('.btn-share-list'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('linkCopied'));
  });

  it('uses built-in texts when the keys are not translated', async () => {
    translate = () => '';
    render(<ListManager onClose={() => {}} />);
    expect(screen.getByText('My Lists')).toBeInTheDocument();
    select('list_1');
    fireEvent.click(document.querySelector('.btn-copy-list'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('List copied to clipboard!'));
    fireEvent.click(document.querySelector('.btn-share-list'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Copiado al portapapeles'));
    document.execCommand = vi.fn(() => {
      throw new Error('no');
    });
    fireEvent.click(document.querySelector('.btn-copy-list'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error copying to clipboard'));
    fireEvent.click(document.querySelector('.btn-share-list'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al copiar'));
    fireEvent.click(document.querySelector('.btn-recalculate-index'));
    expect(screen.getByTitle('Show original IDs')).toBeInTheDocument();
    expect(screen.getAllByTitle('Remove')).toHaveLength(2);
  });
});

describe('ListManager, data and callbacks', () => {
  it('names a list without a name after its key, and treats missing items as none', () => {
    localStorage.setItem('list_abc', JSON.stringify({}));
    render(<ListManager onClose={() => {}} />);
    expect(screen.getByRole('option', { name: 'abc (0 items)' })).toBeInTheDocument();
  });

  it('shows nothing for a selected list that no longer exists', () => {
    render(<ListManager onClose={() => {}} selectedListId="list_gone" />);
    expect(document.querySelector('.list-items-section')).toBeNull();
  });

  it('works without onListSelected, onLoadSeries or onClose', () => {
    setList('list_1', { name: 'Favs', items: [{ id: 1, name: 'Naruto' }] });
    render(<ListManager />);
    select('list_1');
    fireEvent.click(document.querySelector('.btn-show-series'));
    fireEvent.click(document.querySelector('.btn-delete-list'));
    expect(localStorage.getItem('list_1')).toBeNull();
    fireEvent.click(screen.getByTitle('addList'));
    fireEvent.change(screen.getByPlaceholderText('listName'), { target: { value: 'New' } });
    fireEvent.keyPress(screen.getByPlaceholderText('listName'), { key: 'a', code: 'KeyA', charCode: 97 });
    fireEvent.click(screen.getByTitle('create'));
    expect(Object.keys(localStorage).some((k) => k.startsWith('list_'))).toBe(true);
  });

  it('loads the series without closing when there is no onClose', () => {
    setList('list_1', { name: 'Favs', items: [{ id: 3, name: 'X' }] });
    const onLoadSeries = vi.fn();
    render(<ListManager onLoadSeries={onLoadSeries} />);
    select('list_1');
    fireEvent.click(document.querySelector('.btn-show-series'));
    expect(onLoadSeries).toHaveBeenCalledWith([3]);
  });

  it('shows the translated "please fill" message on an empty list name, and clears it on input', () => {
    render(<ListManager onClose={() => {}} />);
    fireEvent.click(screen.getByTitle('addList'));
    const field = screen.getByPlaceholderText('listName');
    fireEvent.invalid(field);
    expect(field.validationMessage).toBe('pleaseFillThisField');
    fireEvent.input(field);
    expect(field.validationMessage).not.toBe('pleaseFillThisField');
  });

  it('adds current series by id or ranking and name, skips incomplete ones, and reports in plain text', () => {
    translate = () => '';
    setList('list_1', { name: 'Favs', items: [{ id: 1, name: 'Naruto' }] });
    const current = [
      { id: 1, production_name: 'Naruto' },
      { production_ranking_number: 7, name: 'Bleach' },
      { id: 9 }, // no name: skipped silently
    ];
    render(<ListManager onClose={() => {}} currentSeries={current} />);
    select('list_1');
    expect(document.querySelector('.btn-add-all-cards').title).toBe('Add all current cards to list (3 series)');
    fireEvent.click(document.querySelector('.btn-add-all-cards'));
    expect(window.alert).toHaveBeenCalledWith('1 series added, 1 already in list');
    expect(JSON.parse(localStorage.getItem('list_1')).items.map((i) => i.id)).toEqual([1, 7]);
  });

  it('reports a plain count when nothing was skipped, and everything-already-there in plain text', () => {
    translate = () => '';
    setList('list_1', { name: 'Favs', items: [] });
    const { rerender } = render(<ListManager onClose={() => {}} currentSeries={[{ id: 4, name: 'Four' }]} />);
    select('list_1');
    fireEvent.click(document.querySelector('.btn-add-all-cards'));
    expect(window.alert).toHaveBeenCalledWith('1 series added to list');
    fireEvent.click(document.querySelector('.btn-add-all-cards'));
    expect(window.alert).toHaveBeenCalledWith('All series are already in the list');
    rerender(<ListManager onClose={() => {}} currentSeries={[]} />);
    expect(document.querySelector('.btn-add-all-cards').title).toBe('Add all current cards to list');
    expect(screen.getByText('Add Cards')).toBeInTheDocument();
  });

  it('adds nothing and says nothing when every current series is incomplete', () => {
    setList('list_1', { name: 'Favs', items: [] });
    render(<ListManager onClose={() => {}} currentSeries={[{ id: 5 }]} />);
    select('list_1');
    fireEvent.click(document.querySelector('.btn-add-all-cards'));
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('confirms and reports a working clipboard in plain text', async () => {
    translate = () => '';
    navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    setList('list_1', { name: 'Favs', items: [{ id: 1, name: 'Naruto' }] });
    render(<ListManager onClose={() => {}} />);
    select('list_1');
    fireEvent.click(document.querySelector('.btn-copy-list'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('List copied to clipboard!'));
    fireEvent.click(document.querySelector('.btn-share-list'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Copiado al portapapeles'));
    fireEvent.click(document.querySelector('.btn-delete-list'));
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this list?');
  });

  it('shows the empty-list text in plain text, and the add form labels', () => {
    translate = () => '';
    setList('list_1', { name: 'Favs', items: [] });
    render(<ListManager onClose={() => {}} />);
    select('list_1');
    expect(screen.getByText('This list is empty')).toBeInTheDocument();
    expect(screen.getByTitle('Delete list')).toBeInTheDocument();
    expect(screen.getByTitle('Show calculated indexes')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Add List/));
    expect(screen.getByPlaceholderText('List name')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Create'));
    expect(window.alert).toHaveBeenCalledWith('List name is required');
    fireEvent.click(screen.getByText('Cancel'));
  });
});
