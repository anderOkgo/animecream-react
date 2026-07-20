import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TablePagination from '../TablePagination';

const t = (key) => key;
const filteredData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

describe('TablePagination', () => {
  it('renders without a navigation prop at all', () => {
    // navigation is optional per PropTypes (not in `.isRequired` list) and
    // both effects that use it start with `if (!navigation) return;` --
    // but dependency arrays are evaluated every render regardless of that
    // guard, so a plain `navigation.pushHistory`/`navigation.currentState`
    // used to throw whenever `navigation` was actually omitted (found by
    // this exact test, which failed before the source fix below). Fixed
    // with optional chaining in both dependency arrays.
    expect(() =>
      render(
        <TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} t={t} />
      )
    ).not.toThrow();
  });

  it('computes the showing-range label from currentPage/itemsPerPage', () => {
    render(
      <TablePagination currentPage={2} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} t={t} />
    );
    expect(screen.getByText(/11-20/)).toBeInTheDocument();
  });

  it('caps the last page\'s end index at the data length', () => {
    render(
      <TablePagination currentPage={3} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} t={t} />
    );
    expect(screen.getByText(/21-25/)).toBeInTheDocument();
  });

  it('disables prev on the first page and next on the last page', () => {
    const { rerender } = render(
      <TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} t={t} />
    );
    expect(screen.getByText('prev')).toBeDisabled();
    expect(screen.getByText('next')).not.toBeDisabled();

    rerender(
      <TablePagination currentPage={3} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} t={t} />
    );
    expect(screen.getByText('next')).toBeDisabled();
  });

  it('calls setCurrentPage with the clamped next/prev page', () => {
    const setCurrentPage = vi.fn();
    render(
      <TablePagination currentPage={2} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} t={t} />
    );

    fireEvent.click(screen.getByText('next'));
    const updater = setCurrentPage.mock.calls[0][0];
    expect(updater(2)).toBe(3);
  });

  it('jumps to page 1 / last page via the edge buttons', () => {
    const setCurrentPage = vi.fn();
    render(
      <TablePagination currentPage={2} setCurrentPage={setCurrentPage} filteredData={filteredData} itemsPerPage={10} t={t} />
    );

    fireEvent.click(screen.getByTitle('last'));
    expect(setCurrentPage).toHaveBeenLastCalledWith(3);

    fireEvent.click(screen.getByTitle('first'));
    expect(setCurrentPage).toHaveBeenLastCalledWith(1);
  });

  it('toggles the range slider enabled state on double-click', () => {
    render(
      <TablePagination currentPage={1} setCurrentPage={() => {}} filteredData={filteredData} itemsPerPage={10} t={t} />
    );
    const slider = screen.getByRole('slider');
    expect(slider).not.toBeDisabled();

    fireEvent.doubleClick(slider.parentElement);
    expect(slider).toBeDisabled();
  });

  it('pushes pagination state to history.navigation when the page changes externally, skipping the initial page-1 mount', () => {
    const pushHistory = vi.fn();
    const navigation = { pushHistory, currentState: null };

    const { rerender } = render(
      <TablePagination
        currentPage={1}
        setCurrentPage={() => {}}
        filteredData={filteredData}
        itemsPerPage={10}
        t={t}
        navigation={navigation}
        element="main-content"
      />
    );
    expect(pushHistory).not.toHaveBeenCalled();

    rerender(
      <TablePagination
        currentPage={2}
        setCurrentPage={() => {}}
        filteredData={filteredData}
        itemsPerPage={10}
        t={t}
        navigation={navigation}
        element="main-content"
      />
    );
    expect(pushHistory).toHaveBeenCalledWith('pagination', { page: 2, id: 'main-content' });
  });

  it('restores currentPage from navigation.currentState when it targets this element', () => {
    const setCurrentPage = vi.fn();
    const navigation = { pushHistory: vi.fn(), currentState: { type: 'pagination', data: { page: 3, id: 'main-content' } } };

    render(
      <TablePagination
        currentPage={1}
        setCurrentPage={setCurrentPage}
        filteredData={filteredData}
        itemsPerPage={10}
        t={t}
        navigation={navigation}
        element="main-content"
      />
    );

    expect(setCurrentPage).toHaveBeenCalledWith(3);
  });

  it('ignores an out-of-range restored page', () => {
    const setCurrentPage = vi.fn();
    const navigation = { pushHistory: vi.fn(), currentState: { type: 'pagination', data: { page: 999, id: 'main-content' } } };

    render(
      <TablePagination
        currentPage={1}
        setCurrentPage={setCurrentPage}
        filteredData={filteredData}
        itemsPerPage={10}
        t={t}
        navigation={navigation}
        element="main-content"
      />
    );

    expect(setCurrentPage).not.toHaveBeenCalled();
  });

  it('resets to page 1 when navigation restores the initial state', () => {
    const setCurrentPage = vi.fn();
    const navigation = { pushHistory: vi.fn(), currentState: { type: 'initial' } };

    render(
      <TablePagination
        currentPage={2}
        setCurrentPage={setCurrentPage}
        filteredData={filteredData}
        itemsPerPage={10}
        t={t}
        navigation={navigation}
        element="main-content"
      />
    );

    expect(setCurrentPage).toHaveBeenCalledWith(1);
  });
});
