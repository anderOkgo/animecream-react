import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../Card';

// Real numbering (IX), ascending order with unranked series, and no data at all.
vi.mock('../../CardRow/CardRow', () => ({
  default: ({ el, realNumber }) => (
    <div data-testid="cardrow">
      {el.production_name}#{realNumber ?? 'none'}
    </div>
  ),
}));
vi.mock('../../ErrorBoundary/ErrorBoundary', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../../Table/TableSearch', () => ({ default: () => null }));
vi.mock('../../Table/TablePagination', () => ({
  default: ({ setCurrentPage }) => <button onClick={() => setCurrentPage(2)}>go-to-page-2</button>,
}));

const t = (key) => key;
const rows = () => screen.getAllByTestId('cardrow').map((el) => el.textContent);

describe('Card, numbering and order', () => {
  it('numbers the cards from 1 on the first page and goes on on the next', () => {
    const data = Array.from({ length: 12 }, (_, i) => ({ production_ranking_number: i + 1, production_name: `S${i + 1}` }));
    render(<Card data={data} t={t} language="en" showRealNumbers sortOrder={null} />);
    expect(rows()[0]).toBe('S1#1');
    fireEvent.click(screen.getByText('go-to-page-2'));
    expect(rows()[0]).toBe('S11#11');
  });

  it('sorts ascending, with series without a ranking first', () => {
    const data = [
      { production_ranking_number: 2, production_name: 'Two' },
      { production_name: 'None' },
      { production_ranking_number: 1, production_name: 'One' },
    ];
    render(<Card data={data} t={t} language="en" sortOrder="asc" />);
    expect(rows()).toEqual(['None#none', 'One#none', 'Two#none']);
  });
});
