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
    numberOfChaptersPlaceholder: 'E.g. 1,10',
    description: 'Description',
    productionYear: 'Production Year',
    productionYearPlaceholder: 'E.g. 1994,1995',
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
    myLists: 'My Lists',
    addList: 'Add List',
    listName: 'List name',
    listNameRequired: 'List name is required',
    createNewList: 'Create New List',
    create: 'Create',
    noLists: 'No lists yet. Create one!',
    items: 'items',
    deleteList: 'Delete list',
    confirmDeleteList: 'Are you sure you want to delete this list?',
    addToList: 'Add to List',
    adding: 'Adding',
    alreadyInList: 'This series is already in the list',
    alreadyAdded: 'Added',
    back: 'Back',
    loadSeries: 'Load Series',
    emptyList: 'This list is empty',
    remove: 'Remove',
    save: 'Save',
    selectList: 'Select List',
    selectListFirst: 'Please select a list first',
    showCalculatedIndexes: 'Show calculated indexes',
    showOriginalIds: 'Show original IDs',
    copyList: 'Copy list to clipboard',
    addAllCurrentCards: 'Add all current cards to list',
    addCards: 'Add Cards',
    listCopied: 'List copied to clipboard!',
    copyError: 'Error copying to clipboard',
    noSeriesToAdd: 'No series available to add',
    seriesAdded: 'Series added to list',
    seriesAddedWithSkipped: 'Series added, some already in list',
    allSeriesAlreadyInList: 'All series are already in the list',
    series: 'series',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    Offline: 'You are offline. Please check your internet connection.',
    errorPrefix: 'Error:',
    errorLoadingSeriesByIds: 'Error loading series by IDs',
    errorLoadingData: 'Error loading data',
    errorGeneric: 'Error',
    errorUnknown: 'Unknown error',
    languageSystemDefault: 'Language: System Default',
    languageUserDefault: 'Language: User Default',
    themeSystemDefault: 'Theme: System Default',
    themeUserDefault: 'Theme: User Default',
  },
  es: {
    welcome: 'AnimeCream APP',
    jumdescription: 'Las mejores recomendaciones de Anime',
    closeAdvancedSearch: '🔍 Cerrar Búsqueda Avanzada',
    openAdvancedSearch: '🔍 Abrir Búsqueda Avanzada',
    searchMethod: 'Método de Búsqueda',
    seriesName: 'Nombre de la Serie',
    numberOfChapters: 'Número de Capítulos',
    numberOfChaptersPlaceholder: 'Ej. 1,10',
    description: 'Descripción',
    productionYear: 'Año de Producción',
    productionYearPlaceholder: 'Ej. 1994,1995',
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
    myLists: 'Mis Listas',
    addList: 'Agregar Lista',
    listName: 'Nombre de la lista',
    listNameRequired: 'El nombre de la lista es requerido',
    createNewList: 'Crear Nueva Lista',
    create: 'Crear',
    noLists: 'Aún no hay listas. ¡Crea una!',
    items: 'elementos',
    deleteList: 'Eliminar lista',
    confirmDeleteList: '¿Estás seguro de que deseas eliminar esta lista?',
    addToList: 'Agregar a Lista',
    adding: 'Agregando',
    alreadyInList: 'Esta serie ya está en la lista',
    alreadyAdded: 'Agregado',
    back: 'Volver',
    loadSeries: 'Cargar Series',
    emptyList: 'Esta lista está vacía',
    remove: 'Eliminar',
    save: 'Guardar',
    selectList: 'Seleccionar Lista',
    selectListFirst: 'Por favor selecciona una lista primero',
    showCalculatedIndexes: 'Mostrar índices calculados',
    showOriginalIds: 'Mostrar IDs originales',
    copyList: 'Copiar lista al portapapeles',
    addAllCurrentCards: 'Agregar todas las tarjetas actuales a la lista',
    addCards: 'Agregar Tarjetas',
    listCopied: '¡Lista copiada al portapapeles!',
    copyError: 'Error al copiar al portapapeles',
    noSeriesToAdd: 'No hay series disponibles para agregar',
    seriesAdded: 'Series agregadas a la lista',
    seriesAddedWithSkipped: 'Series agregadas, algunas ya estaban en la lista',
    allSeriesAlreadyInList: 'Todas las series ya están en la lista',
    series: 'series',
    login: 'Iniciar Sesión',
    username: 'Usuario',
    password: 'Contraseña',
    Offline: 'Estás sin conexión. Por favor verifica tu conexión a internet.',
    errorPrefix: 'Error:',
    errorLoadingSeriesByIds: 'Error al cargar series por IDs',
    errorLoadingData: 'Error al cargar datos',
    errorGeneric: 'Error',
    errorUnknown: 'Error desconocido',
    languageSystemDefault: 'Idioma: Predeterminado del Sistema',
    languageUserDefault: 'Idioma: Predeterminado del Usuario',
    themeSystemDefault: 'Tema: Predeterminado del Sistema',
    themeUserDefault: 'Tema: Predeterminado del Usuario',
  },
};

// Helper Functions
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'es' ? 'es' : 'en';
};

const getStoredLanguage = () => {
  return localStorage.getItem('lang');
};

const setStoredLanguage = (lang) => {
  localStorage.setItem('lang', lang);
};

const removeStoredLanguage = () => {
  localStorage.removeItem('lang');
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
};

// Custom Hook
export const useLanguage = () => {
  const storedLang = getStoredLanguage();
  const browserLang = getBrowserLanguage();
  const [language, setLanguageState] = useState(storedLang ?? browserLang);
  const [useSystemDefault, setUseSystemDefault] = useState(storedLang === null);

  // Update language state and document configurations
  const updateLanguage = (lang) => {
    setLanguageState(lang);
    setLanguage(lang);
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    updateLanguage(newLang);
    // If not using system default, save the change
    if (!useSystemDefault) {
      setStoredLanguage(newLang);
    }
  };

  // Function to save current language as default
  const saveLanguageAsDefault = () => {
    setStoredLanguage(language);
    setUseSystemDefault(false);
  };

  // Function to restore system default
  const restoreSystemDefault = () => {
    removeStoredLanguage();
    setUseSystemDefault(true);
    const browserLang = getBrowserLanguage();
    updateLanguage(browserLang);
  };

  // Translate a given key
  const t = (key) => translations[language]?.[key] || translations['en'][key] || key;

  // Effect hook to sync with system language when using system default
  useEffect(() => {
    if (useSystemDefault) {
      // When using system default, sync with current browser language
      const browserLang = getBrowserLanguage();
      setLanguageState(browserLang);
      setLanguage(browserLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSystemDefault]);

  // Apply language on mount and sync with localStorage changes
  useEffect(() => {
    setLanguage(language);

    // Sync with localStorage changes (for cross-tab synchronization)
    const handleStorageChange = (e) => {
      if (e.key === 'lang') {
        if (e.newValue) {
          setLanguageState(e.newValue);
          setLanguage(e.newValue);
          setUseSystemDefault(false);
        } else {
          // If removed, restore system default
          const browserLang = getBrowserLanguage();
          setLanguageState(browserLang);
          setLanguage(browserLang);
          setUseSystemDefault(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check localStorage on mount/update to ensure consistency
    const storedLang = getStoredLanguage();
    if (storedLang && storedLang !== language) {
      setLanguageState(storedLang);
      setLanguage(storedLang);
      setUseSystemDefault(false);
    } else if (!storedLang && !useSystemDefault) {
      // If no stored language but we're not using system default, restore it
      const browserLang = getBrowserLanguage();
      setLanguageState(browserLang);
      setLanguage(browserLang);
      setUseSystemDefault(true);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language, useSystemDefault]);

  return {
    language,
    toggleLanguage,
    saveLanguageAsDefault,
    restoreSystemDefault,
    t,
  };
};
