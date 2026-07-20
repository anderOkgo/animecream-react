import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardRow from '../CardRow';

// Mock the useTextToSpeech hook (the only hook CardRow itself imports and
// calls directly -- language/translation come in as props, not from a hook).
vi.mock('../../../hooks/useTextToSpeech', () => ({
  useTextToSpeech: () => ({
    isSpeaking: false,
    toggle: vi.fn(),
  }),
}));

describe('CardRow Component', () => {
  const mockElement = {
    production_name: 'Test Anime',
    production_year: 2023,
    production_description: 'This is a test anime description',
    production_description_en: 'This is a test anime description in English',
    production_ranking_number: 1,
    production_image_path: '/test-image.jpg',
    genre_names: 'Action,Adventure',
    demographic_name: 'Shounen',
    production_number_chapters: 12,
  };

  const mockT = (key) => {
    const translations = {
      readAloud: 'Read Aloud',
      stopReading: 'Stop Reading',
      info: 'Info',
      cardDescription: 'Description',
      Action: 'Action',
      Adventure: 'Adventure',
    };
    return translations[key] || key;
  };

  // Note: the read-aloud control renders as an icon button ("▶"/"⏸"),
  // with the translated label only in its `title`/tooltip, not as visible
  // text -- so these assertions target the title, not getByText.
  it('renders the read aloud button', () => {
    render(<CardRow el={mockElement} t={mockT} language="en" />);

    const readAloudButton = screen.getByTitle('Read Aloud');
    expect(readAloudButton).toBeInTheDocument();
  });

  it('shows correct button title based on language', () => {
    const { rerender } = render(<CardRow el={mockElement} t={mockT} language="en" />);

    expect(screen.getByTitle('Read Aloud')).toBeInTheDocument();

    // Test Spanish version
    const spanishT = (key) => {
      const translations = {
        readAloud: 'Leer en voz alta',
        stopReading: 'Detener lectura',
        info: 'Info',
        cardDescription: 'Descripción',
        Action: 'Acción',
        Adventure: 'Aventura',
      };
      return translations[key] || key;
    };

    rerender(<CardRow el={mockElement} t={spanishT} language="es" />);
    expect(screen.getByTitle('Leer en voz alta')).toBeInTheDocument();
  });

  it('displays anime information correctly', () => {
    render(<CardRow el={mockElement} t={mockT} language="en" />);

    expect(screen.getByText('#1. Test Anime')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('12 Ep')).toBeInTheDocument();
    expect(screen.getByText('Shounen')).toBeInTheDocument();
  });

  it('uses English description when language is en', () => {
    render(<CardRow el={mockElement} t={mockT} language="en" />);

    // The description is rendered twice (once per tab panel), so assert
    // both instances rather than a single unique match.
    const matches = screen.getAllByText('This is a test anime description in English');
    expect(matches).toHaveLength(2);
  });

  it('uses Spanish description when language is es', () => {
    render(<CardRow el={mockElement} t={mockT} language="es" />);

    const matches = screen.getAllByText('This is a test anime description');
    expect(matches).toHaveLength(2);
  });

  it('uses realNumber over the ranking number when provided', () => {
    render(<CardRow el={mockElement} t={mockT} language="en" realNumber={7} />);
    expect(screen.getByText('#7. Test Anime')).toBeInTheDocument();
  });

  describe('filter clicks', () => {
    beforeEach(() => {
      Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    });

    it('clicking the year tag calls onFilterChange with a year filter', () => {
      const onFilterChange = vi.fn();
      render(<CardRow el={mockElement} t={mockT} language="en" onFilterChange={onFilterChange} />);
      fireEvent.click(screen.getByTitle('filterByYear'));
      expect(onFilterChange).toHaveBeenCalledWith({
        method: 'POST',
        body: { production_year: '2023', production_ranking_number: 'ASC' },
      });
    });

    it('clicking the episodes tag calls onFilterChange with a chapters filter', () => {
      const onFilterChange = vi.fn();
      render(<CardRow el={mockElement} t={mockT} language="en" onFilterChange={onFilterChange} />);
      fireEvent.click(screen.getByTitle('filterByEpisodes'));
      expect(onFilterChange).toHaveBeenCalledWith({
        method: 'POST',
        body: { production_number_chapters: '12', production_ranking_number: 'ASC' },
      });
    });

    it('clicking the demographic tag calls onFilterChange with the cached slug when a match exists', () => {
      localStorage.setItem('options_demographics', JSON.stringify([{ name: 'Shounen', slug: 'shounen-slug' }]));
      const onFilterChange = vi.fn();
      render(<CardRow el={mockElement} t={mockT} language="en" onFilterChange={onFilterChange} />);
      fireEvent.click(screen.getByTitle('filterByDemographic'));
      expect(onFilterChange).toHaveBeenCalledWith({
        method: 'POST',
        body: { demographic_name: 'shounen-slug', production_ranking_number: 'ASC' },
      });
      localStorage.clear();
    });

    it('clicking the demographic tag falls back to a slugified name with no cache match', () => {
      const onFilterChange = vi.fn();
      render(<CardRow el={mockElement} t={mockT} language="en" onFilterChange={onFilterChange} />);
      fireEvent.click(screen.getByTitle('filterByDemographic'));
      expect(onFilterChange).toHaveBeenCalledWith({
        method: 'POST',
        body: { demographic_name: 'shounen', production_ranking_number: 'ASC' },
      });
    });

    it('clicking a genre tag calls onFilterChange with that genre', () => {
      const onFilterChange = vi.fn();
      render(<CardRow el={mockElement} t={mockT} language="en" onFilterChange={onFilterChange} />);
      // Both genre tags (Action, Adventure) share the same title
      // ("filterByGenre" is a fixed tooltip, not genre-specific) --
      // the first one is Action, per genre_names' order.
      fireEvent.click(screen.getAllByTitle('filterByGenre')[0]);
      expect(onFilterChange).toHaveBeenCalledWith({
        method: 'POST',
        body: { genre_names: 'Action', production_ranking_number: 'ASC' },
      });
    });

    it('does nothing when onFilterChange is not provided', () => {
      render(<CardRow el={mockElement} t={mockT} language="en" />);
      expect(() => fireEvent.click(screen.getByTitle('filterByYear'))).not.toThrow();
    });
  });

  it('clicking the close button calls onDelete', () => {
    const onDelete = vi.fn();
    render(<CardRow el={mockElement} t={mockT} language="en" onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('close'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  describe('add to list', () => {
    it('calls onAddToList with the series id/name and shows a checkmark on success', () => {
      const onAddToList = vi.fn().mockReturnValue(true);
      render(<CardRow el={mockElement} t={mockT} language="en" onAddToList={onAddToList} />);
      fireEvent.click(screen.getByTitle('addToList'));

      expect(onAddToList).toHaveBeenCalledWith({ id: 1, name: 'Test Anime' });
      expect(screen.getByTitle('addToList')).toHaveTextContent('✓');
    });

    it('does not show a checkmark when onAddToList returns false', () => {
      const onAddToList = vi.fn().mockReturnValue(false);
      render(<CardRow el={mockElement} t={mockT} language="en" onAddToList={onAddToList} />);
      fireEvent.click(screen.getByTitle('addToList'));
      expect(screen.getByTitle('addToList')).toHaveTextContent('+');
    });

    it('prefers el.id over the ranking number when both exist', () => {
      const onAddToList = vi.fn().mockReturnValue(true);
      const withId = { ...mockElement, id: 42 };
      render(<CardRow el={withId} t={mockT} language="en" onAddToList={onAddToList} />);
      fireEvent.click(screen.getByTitle('addToList'));
      expect(onAddToList).toHaveBeenCalledWith({ id: 42, name: 'Test Anime' });
    });
  });

  describe('admin edit button', () => {
    it('is not rendered for a non-admin role', () => {
      render(<CardRow el={mockElement} t={mockT} language="en" role="user" />);
      expect(screen.queryByTitle('edit')).not.toBeInTheDocument();
    });

    it('is rendered for the admin role and calls onEdit with the series', () => {
      const onEdit = vi.fn();
      render(<CardRow el={mockElement} t={mockT} language="en" role="admin" onEdit={onEdit} />);
      fireEvent.click(screen.getByTitle('edit'));
      expect(onEdit).toHaveBeenCalledWith(mockElement);
    });
  });

  it('clicking the read-aloud control does not throw', () => {
    render(<CardRow el={mockElement} t={mockT} language="en" />);
    expect(() => fireEvent.click(screen.getByTitle('Read Aloud'))).not.toThrow();
  });

  it('renders no genre tags when genre_names is empty', () => {
    const noGenres = { ...mockElement, genre_names: '' };
    render(<CardRow el={noGenres} t={mockT} language="en" />);
    expect(screen.queryByTitle('filterByGenre')).not.toBeInTheDocument();
  });
});
