import { vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CardRow from '../CardRow';

// Edge cases of CardRow: missing handlers and fields, fallback labels, the 1.5 s checkmark, and the
// read-aloud control while speaking (this file mocks the speech hook as speaking).
const toggle = vi.fn();
vi.mock('../../../hooks/useTextToSpeech', () => ({ useTextToSpeech: () => ({ isSpeaking: true, toggle }) }));

const el = {
  production_name: 'Test Anime',
  production_year: 2023,
  production_description: 'Descripción',
  production_description_en: 'Description',
  production_ranking_number: 1,
  production_image_path: '/x.jpg',
  genre_names: 'Action',
  demographic_name: 'Shounen',
  production_number_chapters: 12,
};
const t = (k) => k;
const blank = () => '';

describe('CardRow, edge cases', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows the checkmark for 1.5 s and ignores a second add meanwhile', () => {
    vi.useFakeTimers();
    const onAddToList = vi.fn().mockReturnValue(true);
    render(<CardRow el={el} t={t} language="en" onAddToList={onAddToList} />);
    fireEvent.click(screen.getByTitle('addToList'));
    fireEvent.click(screen.getByTitle('addToList'));
    expect(onAddToList).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByTitle('addToList')).toHaveTextContent('+');
    vi.useRealTimers();
  });

  it('does nothing on add, edit or close without their handlers, and stops mouse-down on each', () => {
    render(<CardRow el={el} t={t} language="en" role="admin" />);
    ['addToList', 'edit', 'close'].forEach((title) => {
      const button = screen.getByTitle(title);
      expect(fireEvent.mouseDown(button)).toBe(false); // default prevented
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  it('does not filter by a tag without a filter handler, or by a missing field', () => {
    const onFilterChange = vi.fn();
    const { rerender } = render(<CardRow el={el} t={t} language="en" />);
    fireEvent.click(screen.getByTitle('filterByGenre'));
    rerender(
      <CardRow el={{ ...el, production_number_chapters: 0, demographic_name: '' }} t={t} language="en" onFilterChange={onFilterChange} />
    );
    fireEvent.click(screen.getByTitle('filterByEpisodes'));
    fireEvent.click(screen.getByTitle('filterByDemographic'));
    expect(onFilterChange).not.toHaveBeenCalled();
  });

  it('uses the plain demographic slug when the cached list is unreadable', () => {
    localStorage.setItem('options_demographics', '{not json');
    const onFilterChange = vi.fn();
    render(<CardRow el={el} t={t} language="en" onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByTitle('filterByDemographic'));
    expect(onFilterChange).toHaveBeenCalledWith({
      method: 'POST',
      body: { demographic_name: 'shounen', production_ranking_number: 'ASC' },
    });
  });

  it('falls back to built-in labels when the keys are not translated', () => {
    render(<CardRow el={el} t={blank} language="en" role="admin" onEdit={vi.fn()} />);
    ['Editar', 'Add to List', 'Cerrar', 'Filter by year', 'Filter by episodes', 'Filter by demographic', 'Filter by genre'].forEach(
      (title) => expect(screen.getByTitle(title)).toBeInTheDocument()
    );
    expect(screen.getByLabelText('Editar serie')).toBeInTheDocument();
    expect(screen.getByLabelText('Cerrar tarjeta')).toBeInTheDocument();
  });

  it('shows the stop control while reading aloud, in Spanish for a Spanish card', () => {
    render(<CardRow el={el} t={t} language="es" />);
    const control = screen.getByTitle('stopReading');
    expect(control).toHaveTextContent('⏸');
    expect(control.className).toContain('speaking');
    fireEvent.click(control);
    expect(toggle).toHaveBeenCalledWith(expect.any(String), 'es-ES');
  });
});
