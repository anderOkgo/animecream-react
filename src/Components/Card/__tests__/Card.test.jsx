import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

// Card's own responsibility is pagination slicing, sort ordering, delete
// bookkeeping (filteredData + dataset), and the filteredData-changed
// notification -- not re-testing CardRow/TableSearch/TablePagination's own
// behavior (each already has its own test suite). Mocked here as thin
// stand-ins that expose the props Card passes them, so tests can drive
// Card's state from the outside the same way the real children would.
vi.mock('../../CardRow/CardRow', () => ({
  default: ({ el, onDelete }) => (
    <div data-testid={`cardrow-${el.production_ranking_number}`}>
      {el.production_name}
      <button onClick={onDelete}>delete-{el.production_ranking_number}</button>
    </div>
  ),
}));

vi.mock('../../ErrorBoundary/ErrorBoundary', () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock('../../Table/TableSearch', () => ({
  default: ({ dataset }) => <div data-testid="table-search">dataset:{dataset.length}</div>,
}));

vi.mock('../../Table/TablePagination', () => ({
  default: ({ currentPage, setCurrentPage }) => (
    <div data-testid="table-pagination">
      page:{currentPage}
      <button onClick={() => setCurrentPage(2)}>go-to-page-2</button>
    </div>
  ),
}));

const t = (key) => key;

const makeSeries = (count) =>
  Array.from({ length: count }, (_, i) => ({
    production_ranking_number: i + 1,
    production_name: `Series ${i + 1}`,
  }));

describe('Card', () => {
  it('shows the noDataFound message when data is empty', () => {
    render(<Card data={[]} t={t} language="en" />);
    expect(screen.getByText('noDataFound')).toBeInTheDocument();
  });

  it('renders only the current page worth of items (default itemsPerPage=10)', () => {
    render(<Card data={makeSeries(11)} t={t} language="en" />);
    expect(screen.getByTestId('cardrow-1')).toBeInTheDocument();
    expect(screen.getByTestId('cardrow-10')).toBeInTheDocument();
    expect(screen.queryByTestId('cardrow-11')).not.toBeInTheDocument();
  });

  it('keeps API order when sortOrder is null', () => {
    render(<Card data={makeSeries(3)} t={t} language="en" sortOrder={null} />);
    const order = screen.getAllByTestId(/^cardrow-/).map((el) => el.getAttribute('data-testid'));
    expect(order).toEqual(['cardrow-1', 'cardrow-2', 'cardrow-3']);
  });

  it('sorts descending by production_ranking_number when sortOrder is desc', () => {
    render(<Card data={makeSeries(3)} t={t} language="en" sortOrder="desc" />);
    const order = screen.getAllByTestId(/^cardrow-/).map((el) => el.getAttribute('data-testid'));
    expect(order).toEqual(['cardrow-3', 'cardrow-2', 'cardrow-1']);
  });

  it('notifies onFilteredDataChange with the current filtered data on mount', () => {
    const onFilteredDataChange = vi.fn();
    const data = makeSeries(2);
    render(<Card data={data} t={t} language="en" onFilteredDataChange={onFilteredDataChange} />);
    expect(onFilteredDataChange).toHaveBeenCalledWith(data);
  });

  it('removes the deleted item from both filteredData and dataset', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    render(<Card data={makeSeries(3)} t={t} language="en" />);

    expect(screen.getByTestId('table-search')).toHaveTextContent('dataset:3');
    await user.click(screen.getByText('delete-2'));

    expect(screen.queryByTestId('cardrow-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('cardrow-1')).toBeInTheDocument();
    expect(screen.getByTestId('cardrow-3')).toBeInTheDocument();
    expect(screen.getByTestId('table-search')).toHaveTextContent('dataset:2');
  });

  it('steps back to the previous page when a delete empties the current page', async () => {
    const { user } = await import('@testing-library/user-event').then((m) => ({ user: m.default.setup() }));
    // 11 items: page 1 has #1-10, page 2 has only #11.
    render(<Card data={makeSeries(11)} t={t} language="en" />);

    await user.click(screen.getByText('go-to-page-2'));
    expect(screen.getByTestId('table-pagination')).toHaveTextContent('page:2');

    await user.click(screen.getByText('delete-11'));
    expect(screen.getByTestId('table-pagination')).toHaveTextContent('page:1');
  });
});
