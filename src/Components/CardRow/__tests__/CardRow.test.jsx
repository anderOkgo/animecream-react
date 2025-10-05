import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CardRow from '../CardRow';

// Mock the useTextToSpeech hook
jest.mock('../../../hooks/useTextToSpeech', () => ({
  useTextToSpeech: () => ({
    isSpeaking: false,
    toggle: jest.fn(),
  }),
}));

// Mock the useLanguage hook
jest.mock('../../../hooks/useLanguage', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const translations = {
        readAloud: 'Read Aloud',
        stopReading: 'Stop Reading',
        info: 'Info',
        cardDescription: 'Description',
      };
      return translations[key] || key;
    },
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

  it('renders the read aloud button', () => {
    render(<CardRow el={mockElement} t={mockT} language="en" />);

    const readAloudButton = screen.getByText('Read Aloud');
    expect(readAloudButton).toBeInTheDocument();
  });

  it('shows correct button text based on language', () => {
    const { rerender } = render(<CardRow el={mockElement} t={mockT} language="en" />);

    expect(screen.getByText('Read Aloud')).toBeInTheDocument();

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
    expect(screen.getByText('Leer en voz alta')).toBeInTheDocument();
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

    // The description should be in the DOM (though hidden on small screens)
    expect(screen.getByText('This is a test anime description in English')).toBeInTheDocument();
  });

  it('uses Spanish description when language is es', () => {
    render(<CardRow el={mockElement} t={mockT} language="es" />);

    // The description should be in the DOM (though hidden on small screens)
    expect(screen.getByText('This is a test anime description')).toBeInTheDocument();
  });
});
