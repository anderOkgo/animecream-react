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
    rankingOrder: 'Ranking Order',
    ascending: 'Ascending',
    descending: 'Descending',
    limit: 'Limit',
    search: 'Search',
    reset: 'Reset',
    prev: 'Prev',
    next: 'Next',
    showing: 'Showing',
    of: 'of',
    records: 'records',
    rows: 'Rows',
    search: 'Search',
    cardDescription: 'Description',
    info: 'Information',
    switchToSpanish: 'ESP',
    switchToEnglish: 'ENG',
    'ID must contain valid numbers separated by commas.': 'ID must contain valid numbers separated by commas.',
    'Production name must be a string with a maximum length of 50 characters.':
      'Production name must be a string with a maximum length of 50 characters.',
    'Production chapters must contain valid numbers separated by commas.':
      'Production chapters must contain valid numbers separated by commas.',
    'The first chapter number cannot be higher than the second one.':
      'The first chapter number cannot be higher than the second one.',
    'Production description must be a string with a maximum length of 50 characters.':
      'Production description must be a string with a maximum length of 50 characters.',
    'Production years must contain valid numbers separated by commas.':
      'Production years must contain valid numbers separated by commas.',
    'The first year cannot be higher than the second one.': 'The first year cannot be higher than the second one.',
    'Demographic name must be a string with a maximum length of 50 characters.':
      'Demographic name must be a string with a maximum length of 50 characters.',
    'Genre names must be strings with a maximum length of 50 characters separated by commas.':
      'Genre names must be strings with a maximum length of 50 characters separated by commas.',
    'Limit cannot exceed 10,000.': 'Limit cannot exceed 10,000.',
    Acción: 'Action',
    Psicologico: 'Psychological',
    Magia: 'Magic',
    Drama: 'Drama',
    Comedia: 'Comedy',
    'Ciencia ficción': 'Science Fiction',
    Fantasía: 'Fantasy',
    Terror: 'Horror',
    Romance: 'Romance',
    Musical: 'Musical',
    Suspenso: 'Suspense',
    Histórico: 'Historical',
    Bélico: 'War',
    Policíaco: 'Police',
    Aventura: 'Adventure',
    Samuráis: 'Samurai',
    Gore: 'Gore',
    'Space ópera': 'Space Opera',
    Mecha: 'Mecha',
    Cyberpunk: 'Cyberpunk',
    H: 'H',
    Otaku: 'Otaku',
    Deporte: 'Sports',
    Yaoi: 'Yaoi',
    'Post Apocalíptico': 'Post-apocalyptic',
    Entretenimiento: 'Entertainment',
    Realismo: 'Realism',
    Horror: 'Horror',
    'Western Espacial': 'Space Western',
    'Neo-noir': 'Neo-noir',
    Sobrenatural: 'Supernatural',
    Hentai: 'Hentai',
    Crimen: 'Crime',
    Misterio: 'Mystery',
    Yuri: 'Yuri',
    Filosófico: 'Philosophical',
    Paranormal: 'Paranormal',
    'Terror Psicológico': 'Psychological Horror',
    Apocalíptico: 'Apocalyptic',
    'Triller Psicológico': 'Psychological Thriller',
    Harem: 'Harem',
    readAloud: 'Read Aloud',
    stopReading: 'Stop Reading',
    index: 'Index',
    edit: 'Edit',
    close: 'Close',
    admin: 'Admin',
    series: 'Series',
    editSeries: 'Edit Series',
    createSeries: 'Create Series',
    cancel: 'Cancel',
    loadingSeries: 'Loading series data...',
    useJSON: 'Use JSON',
    useForm: 'Use Form',
    year: 'Year',
    chapters: 'Chapters',
    qualification: 'Qualification',
    descriptionEn: 'Description (EN)',
    demographic: 'Demographic',
    visible: 'Visible',
    genres: 'Genres',
    loading: 'Loading...',
    titles: 'Alternative Titles',
    alternativeTitle: 'Alternative title',
    addTitle: 'Add Title',
    seriesData: 'Series Data (JSON)',
    image: 'Series Image',
    selectedFile: 'Selected',
    imageOptional: 'Leave empty to keep current image',
    imageRequired: 'Image is required',
    updating: 'Updating...',
    creating: 'Creating...',
    updateSeries: 'Update Series',
    filterByYear: 'Filter by year',
    filterByEpisodes: 'Filter by episodes',
    filterByDemographic: 'Filter by demographic',
    filterByGenre: 'Filter by genre',
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
    rankingOrder: 'Orden de Ranking',
    ascending: 'Ascendente',
    descending: 'Descendente',
    limit: 'Límite',
    search: 'Buscar',
    reset: 'Reiniciar',
    prev: 'Anterior',
    next: 'Siguiente',
    showing: 'Mostrando',
    of: 'de',
    records: 'registros',
    rows: 'Filas',
    search: 'Buscar',
    cardDescription: 'Descripción',
    info: 'Información',
    switchToSpanish: 'ESP',
    switchToEnglish: 'ENG',
    'ID must contain valid numbers separated by commas.':
      'El ID debe contener números válidos separados por comas.',
    'Production name must be a string with a maximum length of 50 characters.':
      'El nombre de la producción debe ser una cadena de texto con una longitud máxima de 50 caracteres.',
    'Production chapters must contain valid numbers separated by commas.':
      'Los capítulos de producción deben contener números válidos separados por comas.',
    'The first chapter number cannot be higher than the second one.':
      'El primer número de capítulo no puede ser mayor que el segundo.',
    'Production description must be a string with a maximum length of 50 characters.':
      'La descripción de la producción debe ser una cadena de texto con una longitud máxima de 50 caracteres.',
    'Production years must contain valid numbers separated by commas.':
      'Los años de producción deben contener números válidos separados por comas.',
    'The first year cannot be higher than the second one.': 'El primer año no puede ser mayor que el segundo.',
    'Demographic name must be a string with a maximum length of 50 characters.':
      'El nombre demográfico debe ser una cadena de texto con una longitud máxima de 50 caracteres.',
    'Genre names must be strings with a maximum length of 50 characters separated by commas.':
      'Los nombres de los géneros deben ser cadenas de texto con una longitud máxima de 50 caracteres separados por comas.',
    'Limit cannot exceed 10,000.': 'El límite no puede exceder los 10,000.',
    Acción: 'Acción',
    Psicologico: 'Psicológico',
    Magia: 'Magia',
    Drama: 'Drama',
    Comedia: 'Comedia',
    'Ciencia ficción': 'Ciencia ficción',
    Fantasía: 'Fantasía',
    Terror: 'Terror',
    Romance: 'Romance',
    Musical: 'Musical',
    Suspenso: 'Suspenso',
    Histórico: 'Histórico',
    Bélico: 'Bélico',
    Policíaco: 'Policíaco',
    Aventura: 'Aventura',
    Samuráis: 'Samuráis',
    Gore: 'Gore',
    'Space ópera': 'Space ópera',
    Mecha: 'Mecha',
    Cyberpunk: 'Cyberpunk',
    H: 'H',
    Otaku: 'Otaku',
    Deporte: 'Deporte',
    Yaoi: 'Yaoi',
    'Post Apocalíptico': 'Post Apocalíptico',
    Entretenimiento: 'Entretenimiento',
    Realismo: 'Realismo',
    Horror: 'Horror',
    'Western Espacial': 'Western Espacial',
    'Neo-noir': 'Neo-noir',
    Sobrenatural: 'Sobrenatural',
    Hentai: 'Hentai',
    Crimen: 'Crimen',
    Misterio: 'Misterio',
    Yuri: 'Yuri',
    Filosófico: 'Filosófico',
    Paranormal: 'Paranormal',
    'Terror Psicológico': 'Terror Psicológico',
    Apocalíptico: 'Apocalíptico',
    'Triller Psicológico': 'Triller Psicológico',
    Harem: 'Harem',
    readAloud: 'Leer en voz alta',
    stopReading: 'Detener lectura',
    index: 'Índice',
    edit: 'Editar',
    close: 'Cerrar',
    admin: 'Admin',
    series: 'Series',
    editSeries: 'Editar Serie',
    createSeries: 'Crear Serie',
    cancel: 'Cancelar',
    loadingSeries: 'Cargando datos de la serie...',
    useJSON: 'Usar JSON',
    useForm: 'Usar Formulario',
    year: 'Año',
    chapters: 'Capítulos',
    qualification: 'Calificación',
    descriptionEn: 'Descripción (EN)',
    demographic: 'Demográfico',
    visible: 'Visible',
    genres: 'Géneros',
    loading: 'Cargando...',
    titles: 'Títulos Alternativos',
    alternativeTitle: 'Título alternativo',
    addTitle: 'Agregar Título',
    seriesData: 'Datos de la Serie (JSON)',
    image: 'Imagen de la Serie',
    selectedFile: 'Seleccionado',
    imageOptional: 'Dejar vacío para mantener la imagen actual',
    imageRequired: 'La imagen es requerida',
    updating: 'Actualizando...',
    creating: 'Creando...',
    updateSeries: 'Actualizar Serie',
    filterByYear: 'Filtrar por año',
    filterByEpisodes: 'Filtrar por episodios',
    filterByDemographic: 'Filtrar por demográfico',
    filterByGenre: 'Filtrar por género',
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
