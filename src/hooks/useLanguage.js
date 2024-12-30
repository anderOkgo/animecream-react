import { useState, useEffect } from 'react';

const translations = {
  en: {
    welcome: 'AnimeCream APP',
    jumdescription: 'The best recommendations about Anime',
    closeAdvancedSearch: '🔍 Close Advanced Search',
    openAdvancedSearch: '🔍 Open Advanced Search',
    searchMethod: 'Search Method',
    seriesName: 'Series Name',
    numberOfChapters: 'Number of Chapters',
    description: 'Description',
    productionYear: 'Production Year (comma-separated)',
    genreNames: 'Genre Names',
    selectGenre: 'Select Genre',
    demographicNames: 'Demographic Names',
    selectDemographic: 'Select Demographic',
    limit: 'Limit',
    search: 'Search',
    reset: 'Reset',
    prev: 'Prev',
    next: 'Next',
    showing: 'Showing',
    of: 'of',
    records: 'records',
    rows: 'Rows',
    search: 'Search...',
    cardDescription: 'Description',
  },
  es: {
    welcome: 'AnimeCream APP',
    jumdescription: 'Las mejores recomendaciones de Anime',
    closeAdvancedSearch: '🔍 Cerrar Búsqueda Avanzada',
    openAdvancedSearch: '🔍 Abrir Búsqueda Avanzada',
    searchMethod: 'Método de Búsqueda',
    seriesName: 'Nombre de la Serie',
    numberOfChapters: 'Número de Capítulos',
    description: 'Descripción',
    productionYear: 'Año de Producción (separados por comas)',
    genreNames: 'Nombres de Géneros',
    selectGenre: 'Seleccionar Género',
    demographicNames: 'Nombres Demográficos',
    selectDemographic: 'Seleccionar Demográfico',
    limit: 'Límite',
    search: 'Buscar',
    reset: 'Reiniciar',
    prev: 'Anterior',
    next: 'Siguiente',
    showing: 'Mostrando',
    of: 'de',
    records: 'registros',
    rows: 'Filas',
    search: 'Buscar...',
    cardDescription: 'Descripción',
  },
};

// Helper Functions
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'es' ? 'es' : 'en';
};

const getStoredLanguage = () => {
  return localStorage.getItem('lang') || getBrowserLanguage();
};

const setStoredLanguage = (lang) => {
  localStorage.setItem('lang', lang);
};

// Function to handle document updates
const setLanguage = (language) => {
  document.documentElement.lang = language;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (language === 'es') {
    metaDescription.content =
      'Descubre las mejores recomendaciones de anime de todos los tiempos en Animecream. Explora clasificaciones, Top 10, y más. Crea tus listas, compártelas y encuentra tus animes favoritos. ¡Bienvenid@!';
    document.title = 'Animecream - Descubre las Mejores Recomendaciones de Anime';
  } else {
    metaDescription.content =
      'Discover the best anime recommendations of all time on Animecream. Explore rankings, Top 10 lists, and more. Create and share your own lists, and find your favorite anime. Welcome!';
    document.title = 'Animecream - Discover the Best Anime Recommendations';
  }

  // Optionally log the change for debugging
  console.log(`Language set to: ${language}`);
};

// Custom Hook
export const useLanguage = () => {
  const [language, setLanguageState] = useState(getStoredLanguage());

  // Update language state and document configurations
  const updateLanguage = (lang) => {
    //setStoredLanguage(lang);
    setLanguageState(lang);
    setLanguage(lang);
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    updateLanguage(newLang);
  };

  // Translate a given key
  const t = (key) => translations[language][key] || key;

  // Apply language on mount
  useEffect(() => {
    setLanguage(language);
  }, [language]);

  return {
    language,
    toggleLanguage,
    t,
  };
};
