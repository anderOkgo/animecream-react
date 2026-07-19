import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
