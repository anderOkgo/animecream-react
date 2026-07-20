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
  vi.spyOn(console, 'error').mockImplementation(() => {});
  navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
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

  it('skips a malformed list_ entry instead of crashing, and still loads the valid ones', () => {
    localStorage.setItem('list_broken', 'not valid json{{{');
    setList('list_1', { name: 'Favorites', items: [] });

    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} />);

    expect(screen.getByRole('option', { name: 'Favorites (0 items)' })).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  it('silently no-ops when the selected list itself has malformed JSON', () => {
    localStorage.setItem('list_1', 'also not valid json');

    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} selectedListId="list_1" />);

    // loadListData's catch swallows the error and never calls setListData,
    // so the items section (gated on `selectedListId && listData`) simply
    // never renders -- no crash, no stale/partial data shown.
    expect(screen.queryByText('emptyList')).not.toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  it('notifies onListSelected when a list is chosen from the dropdown and when cleared back to none', () => {
    setList('list_1', { name: 'Favorites', items: [] });
    const onListSelected = vi.fn();
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} onListSelected={onListSelected} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'list_1' } });
    expect(onListSelected).toHaveBeenCalledWith('list_1');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
    expect(onListSelected).toHaveBeenCalledWith(null);
  });

  it('notifies onListSelected with the new id after creating a list, and with null after deleting one', () => {
    const onListSelected = vi.fn();
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} onListSelected={onListSelected} />);

    fireEvent.click(screen.getByTitle('addList'));
    fireEvent.change(screen.getByPlaceholderText('listName'), { target: { value: 'Fresh List' } });
    fireEvent.click(screen.getByTitle('create'));

    expect(onListSelected).toHaveBeenLastCalledWith(expect.stringMatching(/^list_/));

    fireEvent.click(screen.getByTitle('deleteList'));
    expect(onListSelected).toHaveBeenLastCalledWith(null);
  });

  it('leaves the list untouched when dropping without a prior drag, or onto the same index', () => {
    setList('list_1', {
      name: 'Favorites',
      items: [{ id: 1, name: 'Naruto' }, { id: 2, name: 'Bleach' }],
    });
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} selectedListId="list_1" />);

    const rows = screen.getAllByText(/Naruto|Bleach/).map((el) => el.closest('.list-item-simple'));

    // No dragStart fired first -- draggedItem is still null.
    fireEvent.drop(rows[1], { dataTransfer: {} });
    expect(JSON.parse(localStorage.getItem('list_1')).items.map((i) => i.name)).toEqual(['Naruto', 'Bleach']);

    // Drag started and dropped on its own index.
    fireEvent.dragStart(rows[0], { dataTransfer: {} });
    fireEvent.drop(rows[0], { dataTransfer: {} });
    expect(JSON.parse(localStorage.getItem('list_1')).items.map((i) => i.name)).toEqual(['Naruto', 'Bleach']);
  });

  it('loads the list in order and closes the modal via the show-series button', () => {
    setList('list_1', {
      name: 'Favorites',
      items: [{ id: 5, name: 'Naruto' }, { id: 3, name: 'Bleach' }],
    });
    const onLoadSeries = vi.fn();
    const onClose = vi.fn();
    render(<ListManager onClose={onClose} onLoadSeries={onLoadSeries} selectedListId="list_1" />);

    fireEvent.click(screen.getByTitle('showSeries'));

    expect(onLoadSeries).toHaveBeenCalledWith([5, 3]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('toggles between plain names and numbered indexes', () => {
    setList('list_1', { name: 'Favorites', items: [{ id: 1, name: 'Naruto' }] });
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} selectedListId="list_1" />);

    expect(screen.getByText('Naruto')).toBeInTheDocument();
    expect(screen.queryByText('1. Naruto')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTitle('showCalculatedIndexes'));
    expect(screen.getByText('1. Naruto')).toBeInTheDocument();
  });

  it('copies the formatted list to the clipboard', async () => {
    setList('list_1', {
      name: 'Favorites',
      items: [{ id: 1, name: 'Naruto' }, { id: 2, name: 'Bleach' }],
    });
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} selectedListId="list_1" />);

    fireEvent.click(screen.getByTitle('copyList'));

    await vi.waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Favorites\n\nNaruto\nBleach'));
    expect(window.alert).toHaveBeenCalledWith('listCopied');
  });

  it('copies a shareable /list/ URL with the item ids in order', async () => {
    setList('list_1', {
      name: 'Favorites',
      items: [{ id: 5, name: 'Naruto' }, { id: 3, name: 'Bleach' }],
    });
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} selectedListId="list_1" />);

    fireEvent.click(screen.getByTitle('shareList'));

    await vi.waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${window.location.origin}/list/5,3`)
    );
    expect(window.alert).toHaveBeenCalledWith('linkCopied');
  });

  it('creates a list by pressing Enter in the name field', () => {
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} />);

    fireEvent.click(screen.getByTitle('addList'));
    fireEvent.change(screen.getByPlaceholderText('listName'), { target: { value: 'Enter List' } });
    fireEvent.keyPress(screen.getByPlaceholderText('listName'), { key: 'Enter', code: 'Enter', charCode: 13 });

    const stored = Object.keys(localStorage).filter((k) => k.startsWith('list_'));
    expect(stored).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(stored[0])).name).toBe('Enter List');
  });

  it('cancels the add-list form, clearing the name and hiding the inputs', () => {
    render(<ListManager onClose={() => {}} onLoadSeries={() => {}} />);

    fireEvent.click(screen.getByTitle('addList'));
    fireEvent.change(screen.getByPlaceholderText('listName'), { target: { value: 'Discard Me' } });
    fireEvent.click(screen.getByTitle('cancel'));

    expect(screen.queryByPlaceholderText('listName')).not.toBeInTheDocument();
    expect(Object.keys(localStorage).filter((k) => k.startsWith('list_'))).toHaveLength(0);
  });

  it('alerts that everything is already in the list when there is nothing new to add', () => {
    setList('list_1', { name: 'Favorites', items: [{ id: 1, name: 'Naruto' }] });
    const currentSeries = [{ id: 1, production_name: 'Naruto' }];

    render(
      <ListManager
        onClose={() => {}}
        onLoadSeries={() => {}}
        selectedListId="list_1"
        currentSeries={currentSeries}
      />
    );

    fireEvent.click(screen.getByTitle(/addAllCurrentCards/));

    expect(window.alert).toHaveBeenCalledWith('allSeriesAlreadyInList');
    expect(JSON.parse(localStorage.getItem('list_1')).items).toEqual([{ id: 1, name: 'Naruto' }]);
  });
});
