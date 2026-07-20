import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ListManager from '../ListManager';

vi.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({ t: (key) => key }),
}));

const setList = (id, data) => localStorage.setItem(id, JSON.stringify(data));

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ListManager', () => {
  it('loads every localStorage key prefixed "list_" as a selectable list', () => {
    setList('list_1', { name: 'Favorites', items: [{ id: 1, name: 'Naruto' }] });
    setList('list_2', { name: 'To Watch', items: [] });
    localStorage.setItem('unrelated_key', 'ignored');

    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} />);

    expect(screen.getByRole('option', { name: 'Favorites (1 items)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'To Watch (0 items)' })).toBeInTheDocument();
    expect(screen.queryByText(/unrelated/)).not.toBeInTheDocument();
  });

  it('creates a new list and persists it to localStorage', () => {
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} />);

    fireEvent.click(screen.getByTitle('addList'));
    fireEvent.change(screen.getByPlaceholderText('listName'), { target: { value: 'My New List' } });
    fireEvent.click(screen.getByTitle('create'));

    const stored = Object.keys(localStorage).filter((k) => k.startsWith('list_'));
    expect(stored).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(stored[0]))).toEqual({ name: 'My New List', items: [] });
  });

  it('refuses to create a list with an empty/whitespace name', () => {
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} />);

    fireEvent.click(screen.getByTitle('addList'));
    fireEvent.change(screen.getByPlaceholderText('listName'), { target: { value: '   ' } });
    fireEvent.click(screen.getByTitle('create'));

    expect(window.alert).toHaveBeenCalled();
    expect(Object.keys(localStorage).filter((k) => k.startsWith('list_'))).toHaveLength(0);
  });

  it('deletes the selected list after confirmation, and does nothing if the user declines', () => {
    setList('list_1', { name: 'Favorites', items: [] });
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} selectedListId="list_1" />);

    window.confirm.mockReturnValueOnce(false);
    fireEvent.click(screen.getByTitle('deleteList'));
    expect(localStorage.getItem('list_1')).not.toBeNull();

    window.confirm.mockReturnValueOnce(true);
    fireEvent.click(screen.getByTitle('deleteList'));
    expect(localStorage.getItem('list_1')).toBeNull();
  });

  it('removes a single item from the selected list', () => {
    setList('list_1', { name: 'Favorites', items: [{ id: 1, name: 'Naruto' }, { id: 2, name: 'Bleach' }] });
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} selectedListId="list_1" />);

    fireEvent.click(screen.getAllByTitle('remove')[0]);

    const updated = JSON.parse(localStorage.getItem('list_1'));
    expect(updated.items).toEqual([{ id: 2, name: 'Bleach' }]);
  });

  it('adds only the current series not already in the list, and skips duplicates', () => {
    setList('list_1', { name: 'Favorites', items: [{ id: 1, name: 'Naruto' }] });
    const currentSeries = [
      { id: 1, production_name: 'Naruto' }, // already in list -> skipped
      { id: 2, production_name: 'Bleach' }, // new -> added
    ];

    render(
      <ListManager
        onClose={() => {}}
        onLoadSeries={() => {}}
        selectedListId="list_1"
        currentSeries={currentSeries}
      />
    );

    fireEvent.click(screen.getByTitle(/addAllCurrentCards/));

    const updated = JSON.parse(localStorage.getItem('list_1'));
    expect(updated.items).toEqual([
      { id: 1, name: 'Naruto' },
      { id: 2, name: 'Bleach' },
    ]);
    expect(window.alert).toHaveBeenCalledWith('seriesAddedWithSkipped');
  });

  it('reorders items via drag and drop', () => {
    setList('list_1', {
      name: 'Favorites',
      items: [{ id: 1, name: 'Naruto' }, { id: 2, name: 'Bleach' }, { id: 3, name: 'One Piece' }],
    });
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} selectedListId="list_1" />);

    const items = screen.getAllByText(/Naruto|Bleach|One Piece/);
    const rows = items.map((el) => el.closest('.list-item-simple'));

    fireEvent.dragStart(rows[0], { dataTransfer: {} });
    fireEvent.dragOver(rows[2], { dataTransfer: {} });
    fireEvent.drop(rows[2], { dataTransfer: {} });

    const updated = JSON.parse(localStorage.getItem('list_1'));
    expect(updated.items.map((i) => i.name)).toEqual(['Bleach', 'One Piece', 'Naruto']);
  });
});
