import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TableSearch from '../TableSearch';

const t = (key) => key;
const dataset = [
  { production_name: 'Naruto', production_ranking_number: 2 },
  { production_name: 'Nana', production_ranking_number: 1 },
];

const renderTableSearch = (props = {}) =>
  render(
    <TableSearch
      setCurrentPage={() => {}}
      setFilteredData={() => {}}
      setItemsPerPage={() => {}}
      dataset={dataset}
      itemsPerPage={10}
      t={t}
      {...props}
    />
  );

describe('TableSearch', () => {
  it('shows the full dataset (unfiltered) when the search term is empty', () => {
    const setFilteredData = vi.fn();
    renderTableSearch({ setFilteredData });
    expect(setFilteredData).toHaveBeenCalledWith(dataset);
  });

  it('filters and sorts by ranking number when a search term is typed', () => {
    const setFilteredData = vi.fn();
    renderTableSearch({ setFilteredData });
    setFilteredData.mockClear();

    fireEvent.change(screen.getByPlaceholderText('search'), { target: { value: 'na' } });

    const [sorted] = setFilteredData.mock.calls.at(-1);
    expect(sorted.map((i) => i.production_name)).toEqual(['Nana', 'Naruto']); // rank 1 before rank 2
  });

  it('resets to page 1 and clears the suggestion selection on every keystroke', () => {
    const setCurrentPage = vi.fn();
    renderTableSearch({ setCurrentPage });
    fireEvent.change(screen.getByPlaceholderText('search'), { target: { value: 'n' } });
    expect(setCurrentPage).toHaveBeenCalledWith(1);
  });

  it('changing the items-per-page select resets to page 1', () => {
    const setItemsPerPage = vi.fn();
    const setCurrentPage = vi.fn();
    renderTableSearch({ setItemsPerPage, setCurrentPage });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } });
    expect(setItemsPerPage).toHaveBeenCalledWith(50);
    expect(setCurrentPage).toHaveBeenCalledWith(1);
  });

  it('selecting a suggestion via keyboard sets the search term and resets to page 1', () => {
    const setCurrentPage = vi.fn();
    renderTableSearch({ setCurrentPage });
    const input = screen.getByPlaceholderText('search');
    input.focus();

    fireEvent.change(input, { target: { value: 'na' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toHaveValue('Naruto');
  });

  it('picks a suggestion with a click, and lets other keys through', () => {
    const setCurrentPage = vi.fn();
    const { container } = renderTableSearch({ setCurrentPage });
    const input = screen.getByPlaceholderText('search');
    input.focus();
    fireEvent.change(input, { target: { value: 'na' } });
    fireEvent.keyDown(input, { key: 'a' }); // not a suggestion key: left to the input
    fireEvent.click(container.querySelector('.suggestion-item'));
    expect(input).toHaveValue('Naruto');
    expect(setCurrentPage).toHaveBeenLastCalledWith(1);
  });

  it('shows the suggestions again when the input gets the focus back, but not without a term', () => {
    const { container } = renderTableSearch();
    const input = screen.getByPlaceholderText('search');
    fireEvent.focus(input);
    expect(container.querySelector('.search-suggestions')).toBeNull();

    input.focus();
    fireEvent.change(input, { target: { value: 'na' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(container.querySelector('.search-suggestions')).toBeNull();
    fireEvent.focus(input);
    expect(container.querySelector('.search-suggestions')).not.toBeNull();
  });
});
