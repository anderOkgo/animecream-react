import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
  createElement,
} from 'react';

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
    first: 'First',
    last: 'Last',
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
    search: 'Search',
    sort: 'Sort',
    filterByYear: 'Filter by year',
    filterByDecade: 'Filter by decade',
    allYears: 'All',
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
    showSeries: 'Show',
    shareList: 'Share list as URL',
    linkCopied: 'Link copied to clipboard!',
    emptyList: 'This list is empty',
    remove: 'Remove',
    save: 'Save',
    selectList: 'Select List',
    selectListFirst: 'Please select a list first',
    showCalculatedIndexes: 'Show calculated indexes',
    showOriginalIds: 'Show original IDs',
    copyList: 'Copy list to clipboard',
    addAllCurrentCards: 'Add all current cards to list',
    addCards: 'Add Current Cards',
    listCopied: 'List copied to clipboard!',
    copyError: 'Error copying to clipboard',
    noSeriesToAdd: 'No series available to add',
    seriesAdded: 'Series added to list',
    seriesAddedWithSkipped: 'Series added, some already in list',
    allSeriesAlreadyInList: 'All series are already in the list',
    series: 'Series',
    seriesAndOvas: 'Series & OVAs',
    seriesUnit: 'series',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    Offline: 'You are offline. Please check your internet connection.',
    transactionWaiting: 'Transaction pending',
    errorPrefix: 'Error:',
    errorLoadingSeriesByIds: 'Error loading series by IDs',
    errorLoadingData: 'Error loading data',
    errorGeneric: 'Error',
    errorUnknown: 'Unknown error',
    'Invalid credentials': 'Invalid credentials',
    'Username or email is required': 'Username or email is required',
    'Account is inactive': 'Account is inactive',
    'Account is temporarily locked': 'Account is temporarily locked',
    'Too many failed attempts. Account locked for 15 minutes':
      'Too many failed attempts. Account locked for 15 minutes',
    'Login failed': 'Login failed',
    'Internal server error': 'Internal server error',
    'Invalid email format': 'Invalid email format',
    'Invalid username format': 'Invalid username format',
    'Password must be at least 6 characters': 'Password must be at least 6 characters',
    'Email already exists': 'Email already exists',
    'User already exists': 'User already exists',
    'Verification code sent': 'Verification code sent',
    'Invalid verification code': 'Invalid verification code',
    'User created successfully': 'User created successfully',
    'Series name must be at least 2 characters': 'Series name must be at least 2 characters',
    'Series name must not exceed 200 characters': 'Series name must not exceed 200 characters',
    'Series name must be between 2 and 200 characters': 'Series name must be between 2 and 200 characters',
    'Series name is required': 'Series name is required',
    'Chapter number must be positive': 'Chapter number must be positive',
    'Year must be between 1900 and': 'Year must be between 1900 and',
    'Qualification must be between 0 and 10': 'Qualification must be between 0 and 10',
    'Valid demography_id is required': 'Valid demography_id is required',
    'Description must not exceed 5000 characters': 'Description must not exceed 5000 characters',
    'Description_en must not exceed 5000 characters': 'Description_en must not exceed 5000 characters',
    'Valid series ID is required': 'Valid series ID is required',
    'No fields to update': 'No fields to update',
    'Series not found': 'Series not found',
    'Series not found after update': 'Series not found after update',
    'Error creating series': 'Error creating series',
    'Error updating series': 'Error updating series',
    'Series created successfully': 'Series created successfully',
    'Series updated successfully': 'Series updated successfully',
    'Failed to delete series': 'Failed to delete series',
    'Series deleted successfully': 'Series deleted successfully',
    'At least one genre ID is required': 'At least one genre ID is required',
    'Invalid genre IDs:': 'Invalid genre IDs:',
    'Demography ID': 'Demography ID',
    'does not exist': 'does not exist',
    'At least one title is required': 'At least one title is required',
    'At least one title ID is required': 'At least one title ID is required',
    'No valid titles provided': 'No valid titles provided',
    'Invalid title IDs:': 'Invalid title IDs:',
    'Genres must be an array': 'Genres must be an array',
    'Titles must be an array': 'Titles must be an array',
    'Error creating complete series:': 'Error creating complete series:',
    'Series created successfully with all relations': 'Series created successfully with all relations',
    'Series updated successfully with all relations': 'Series updated successfully with all relations',
    'Invalid ID': 'Invalid ID',
    'No image sent': 'No image sent',
    'Image file is required': 'Image file is required',
    'Image buffer is required': 'Image buffer is required',
    'Image path is required': 'Image path is required',
    'Series image updated successfully': 'Series image updated successfully',
    'Image size must not exceed': 'Image size must not exceed',
    'Error updating series image:': 'Error updating series image:',
    'Unknown error': 'Unknown error',
    'ID must contain valid numbers separated by commas.': 'ID must contain valid numbers separated by commas.',
    'ID must contain valid numbers.': 'ID must contain valid numbers.',
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
    'Limit must be a positive number.': 'Limit must be a positive number.',
    'Limit cannot exceed 10,000.': 'Limit cannot exceed 10,000.',
    languageSystemDefault: 'Language: System Default',
    languageUserDefault: 'Language: User Default',
    themeSystemDefault: 'Theme: System Default',
    themeUserDefault: 'Theme: User Default',
    seriesUpdated: 'Series updated successfully!',
    seriesCreated: 'Series created successfully!',
    invalidDataFormat: 'Invalid data format',
    errorUpdatingSeries: 'Error updating series',
    errorCreatingSeries: 'Error creating series',
    genresUpdateFailed: 'Series updated but genres update failed',
    titlesRemoveFailed: 'Series updated but failed to remove old titles',
    titlesAddFailed: 'Series updated but failed to add new titles',
    imageUploadFailed: 'Series updated but image upload failed',
    imageRequiredToCreate: 'Image is required to create a series',
    noIdReturned: 'Series created but no ID returned',
    loadingErrorRepair: 'Loading error? Double click to clear cache and repair.',
    repairError: 'Error trying to repair.',
    open: 'Open',
    goToTop: 'Go to top',
    goToBottom: 'Go to bottom',
    doubleClick: 'Double click',
    pleaseFillThisField: 'Please fill out this field',
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
    first: 'Primero',
    last: 'Último',
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
    search: 'Buscar',
    sort: 'Ordenar',
    filterByYear: 'Filtrar por año',
    filterByDecade: 'Filtrar por década',
    allYears: 'Todos',
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
    showSeries: 'Mostrar',
    shareList: 'Compartir lista como URL',
    linkCopied: '¡Enlace copiado al portapapeles!',
    emptyList: 'Esta lista está vacía',
    remove: 'Eliminar',
    save: 'Guardar',
    selectList: 'Seleccionar Lista',
    selectListFirst: 'Por favor selecciona una lista primero',
    showCalculatedIndexes: 'Mostrar índices calculados',
    showOriginalIds: 'Mostrar IDs originales',
    copyList: 'Copiar lista al portapapeles',
    addAllCurrentCards: 'Agregar todas las tarjetas actuales a la lista',
    addCards: 'Agregar tarjetas actuales',
    listCopied: '¡Lista copiada al portapapeles!',
    copyError: 'Error al copiar al portapapeles',
    noSeriesToAdd: 'No hay series disponibles para agregar',
    seriesAdded: 'Series agregadas a la lista',
    seriesAddedWithSkipped: 'Series agregadas, algunas ya estaban en la lista',
    allSeriesAlreadyInList: 'Todas las series ya están en la lista',
    series: 'Series',
    seriesAndOvas: 'Series & OVAs',
    seriesUnit: 'series',
    login: 'Iniciar Sesión',
    username: 'Usuario',
    password: 'Contraseña',
    Offline: 'Estás sin conexión. Por favor verifica tu conexión a internet.',
    transactionWaiting: 'Transacción en espera',
    errorPrefix: 'Error:',
    errorLoadingSeriesByIds: 'Error al cargar series por IDs',
    errorLoadingData: 'Error al cargar datos',
    errorGeneric: 'Error',
    errorUnknown: 'Error desconocido',
    'Invalid credentials': 'Credenciales inválidas',
    'Username or email is required': 'El usuario o correo es obligatorio',
    'Account is inactive': 'La cuenta está inactiva',
    'Account is temporarily locked': 'La cuenta está bloqueada temporalmente',
    'Too many failed attempts. Account locked for 15 minutes':
      'Demasiados intentos fallidos. Cuenta bloqueada durante 15 minutos',
    'Login failed': 'Error al iniciar sesión',
    'Internal server error': 'Error interno del servidor',
    'Invalid email format': 'Formato de correo inválido',
    'Invalid username format': 'Formato de usuario inválido',
    'Password must be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
    'Email already exists': 'El correo ya existe',
    'User already exists': 'El usuario ya existe',
    'Verification code sent': 'Código de verificación enviado',
    'Invalid verification code': 'Código de verificación inválido',
    'User created successfully': 'Usuario creado correctamente',
    'Series name must be at least 2 characters': 'El nombre de la serie debe tener al menos 2 caracteres',
    'Series name must not exceed 200 characters': 'El nombre de la serie no puede superar 200 caracteres',
    'Series name must be between 2 and 200 characters': 'El nombre de la serie debe tener entre 2 y 200 caracteres',
    'Series name is required': 'El nombre de la serie es obligatorio',
    'Chapter number must be positive': 'El número de capítulos debe ser positivo',
    'Year must be between 1900 and': 'El año debe estar entre 1900 y',
    'Qualification must be between 0 and 10': 'La calificación debe estar entre 0 y 10',
    'Valid demography_id is required': 'Se requiere un demography_id válido',
    'Description must not exceed 5000 characters': 'La descripción no puede superar 5000 caracteres',
    'Description_en must not exceed 5000 characters': 'La descripción en inglés no puede superar 5000 caracteres',
    'Valid series ID is required': 'Se requiere un ID de serie válido',
    'No fields to update': 'No hay campos para actualizar',
    'Series not found': 'Serie no encontrada',
    'Series not found after update': 'Serie no encontrada tras la actualización',
    'Error creating series': 'Error al crear la serie',
    'Error updating series': 'Error al actualizar la serie',
    'Series created successfully': 'Serie creada correctamente',
    'Series updated successfully': 'Serie actualizada correctamente',
    'Failed to delete series': 'Error al eliminar la serie',
    'Series deleted successfully': 'Serie eliminada correctamente',
    'At least one genre ID is required': 'Se requiere al menos un ID de género',
    'Invalid genre IDs:': 'IDs de género inválidos:',
    'Demography ID': 'ID demográfico',
    'does not exist': 'no existe',
    'At least one title is required': 'Se requiere al menos un título',
    'At least one title ID is required': 'Se requiere al menos un ID de título',
    'No valid titles provided': 'No se proporcionaron títulos válidos',
    'Invalid title IDs:': 'IDs de título inválidos:',
    'Genres must be an array': 'Los géneros deben ser un array',
    'Titles must be an array': 'Los títulos deben ser un array',
    'Error creating complete series:': 'Error al crear la serie completa:',
    'Series created successfully with all relations': 'Serie creada con todas las relaciones',
    'Series updated successfully with all relations': 'Serie actualizada con todas las relaciones',
    'Invalid ID': 'ID inválido',
    'No image sent': 'No se envió ninguna imagen',
    'Image file is required': 'El archivo de imagen es obligatorio',
    'Image buffer is required': 'Se requiere el buffer de la imagen',
    'Image path is required': 'Se requiere la ruta de la imagen',
    'Series image updated successfully': 'Imagen de la serie actualizada correctamente',
    'Image size must not exceed': 'El tamaño de la imagen no puede superar',
    'Error updating series image:': 'Error al actualizar la imagen de la serie:',
    'Unknown error': 'Error desconocido',
    'ID must contain valid numbers separated by commas.':
      'El ID debe contener números válidos separados por comas.',
    'ID must contain valid numbers.': 'El ID debe contener números válidos.',
    'Production name must be a string with a maximum length of 50 characters.':
      'El nombre debe ser texto de máximo 50 caracteres.',
    'Production chapters must contain valid numbers separated by commas.':
      'Los capítulos deben ser números válidos separados por comas.',
    'The first chapter number cannot be higher than the second one.':
      'El primer capítulo no puede ser mayor que el segundo.',
    'Production description must be a string with a maximum length of 50 characters.':
      'La descripción debe ser texto de máximo 50 caracteres.',
    'Production years must contain valid numbers separated by commas.':
      'Los años deben ser números válidos separados por comas.',
    'The first year cannot be higher than the second one.': 'El primer año no puede ser mayor que el segundo.',
    'Demographic name must be a string with a maximum length of 50 characters.':
      'El nombre demográfico debe ser texto de máximo 50 caracteres.',
    'Genre names must be strings with a maximum length of 50 characters separated by commas.':
      'Los nombres de género deben ser texto de máximo 50 caracteres separados por comas.',
    'Limit must be a positive number.': 'El límite debe ser un número positivo.',
    'Limit cannot exceed 10,000.': 'El límite no puede superar 10.000.',
    languageSystemDefault: 'Idioma: Predeterminado del Sistema',
    languageUserDefault: 'Idioma: Predeterminado del Usuario',
    themeSystemDefault: 'Tema: Predeterminado del Sistema',
    themeUserDefault: 'Tema: Predeterminado del Usuario',
    seriesUpdated: '¡Serie actualizada con éxito!',
    seriesCreated: '¡Serie creada con éxito!',
    invalidDataFormat: 'Formato de datos inválido',
    errorUpdatingSeries: 'Error al actualizar la serie',
    errorCreatingSeries: 'Error al crear la serie',
    genresUpdateFailed: 'Serie actualizada pero falló la actualización de géneros',
    titlesRemoveFailed: 'Serie actualizada pero falló la eliminación de títulos antiguos',
    titlesAddFailed: 'Serie actualizada pero falló la adición de nuevos títulos',
    imageUploadFailed: 'Serie actualizada pero falló la carga de la imagen',
    imageRequiredToCreate: 'La imagen es requerida para crear una serie',
    noIdReturned: 'Serie creada pero no se devolvió ningún ID',
    loadingErrorRepair: '¿Error de carga? Doble clic para limpiar caché y reparar.',
    repairError: 'Error al intentar reparar.',
    open: 'Abrir',
    goToTop: 'Ir al inicio',
    goToBottom: 'Ir al final',
    doubleClick: 'Doble clic',
    pleaseFillThisField: 'Por favor, completa este campo',
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

// Updates document lang, title and meta description
const applyDocumentLanguage = (language) => {
  document.documentElement.lang = language;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    return;
  }
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

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = getStoredLanguage();
    return stored ?? getBrowserLanguage();
  });
  const [useSystemDefault, setUseSystemDefault] = useState(() => getStoredLanguage() === null);
  const useSystemDefaultRef = useRef(useSystemDefault);

  useEffect(() => {
    useSystemDefaultRef.current = useSystemDefault;
  }, [useSystemDefault]);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const newLang = prev === 'en' ? 'es' : 'en';
      applyDocumentLanguage(newLang);
      if (!useSystemDefaultRef.current) {
        setStoredLanguage(newLang);
      }
      return newLang;
    });
  }, []);

  const saveLanguageAsDefault = useCallback(() => {
    setStoredLanguage(language);
    setUseSystemDefault(false);
    useSystemDefaultRef.current = false;
  }, [language]);

  const restoreSystemDefault = useCallback(() => {
    removeStoredLanguage();
    setUseSystemDefault(true);
    useSystemDefaultRef.current = true;
    const browserLang = getBrowserLanguage();
    setLanguageState(browserLang);
    applyDocumentLanguage(browserLang);
  }, []);

  const t = useCallback((key) => translations[language]?.[key] ?? translations.en[key] ?? key, [language]);

  useEffect(() => {
    if (useSystemDefault) {
      const browserLang = getBrowserLanguage();
      setLanguageState(browserLang);
      applyDocumentLanguage(browserLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSystemDefault]);

  useEffect(() => {
    applyDocumentLanguage(language);

    const handleStorageChange = (e) => {
      if (e.key === 'lang') {
        if (e.newValue) {
          setLanguageState(e.newValue);
          applyDocumentLanguage(e.newValue);
          setUseSystemDefault(false);
          useSystemDefaultRef.current = false;
        } else {
          const browserLang = getBrowserLanguage();
          setLanguageState(browserLang);
          applyDocumentLanguage(browserLang);
          setUseSystemDefault(true);
          useSystemDefaultRef.current = true;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const storedLang = getStoredLanguage();
    if (storedLang && storedLang !== language) {
      setLanguageState(storedLang);
      applyDocumentLanguage(storedLang);
      setUseSystemDefault(false);
      useSystemDefaultRef.current = false;
    } else if (!storedLang && !useSystemDefault) {
      const browserLang = getBrowserLanguage();
      setLanguageState(browserLang);
      applyDocumentLanguage(browserLang);
      setUseSystemDefault(true);
      useSystemDefaultRef.current = true;
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language, useSystemDefault]);

  const value = useMemo(
    () => ({
      language,
      toggleLanguage,
      saveLanguageAsDefault,
      restoreSystemDefault,
      t,
    }),
    [language, toggleLanguage, saveLanguageAsDefault, restoreSystemDefault, t]
  );

  return createElement(LanguageContext.Provider, { value }, children);
}

export const translateEN = (key) => translations.en[key] ?? key;

const translateMessagePart = (t, part) => {
  const trimmed = typeof part === 'string' ? part.trim() : String(part);
  if (!trimmed) {
    return '';
  }
  const yearMatch = trimmed.match(/^Year must be between 1900 and (\d+)$/);
  if (yearMatch) {
    return `${t('Year must be between 1900 and')} ${yearMatch[1]}`;
  }
  const demogMatch = trimmed.match(/^Demography ID (\d+) does not exist$/);
  if (demogMatch) {
    return `${t('Demography ID')} ${demogMatch[1]} ${t('does not exist')}`;
  }
  if (trimmed.startsWith('Invalid genre IDs:')) {
    return `${t('Invalid genre IDs:')} ${trimmed.slice('Invalid genre IDs:'.length).trim()}`;
  }
  if (trimmed.startsWith('Invalid title IDs:')) {
    return `${t('Invalid title IDs:')} ${trimmed.slice('Invalid title IDs:'.length).trim()}`;
  }
  if (trimmed.startsWith('Image size must not exceed ')) {
    return `${t('Image size must not exceed')} ${trimmed.slice('Image size must not exceed '.length)}`;
  }
  const wrappedPrefixes = [
    'Error creating complete series:',
    'Error updating series image:',
  ];
  for (const prefix of wrappedPrefixes) {
    if (trimmed.startsWith(prefix)) {
      return `${t(prefix)} ${translateMessagePart(t, trimmed.slice(prefix.length).trim())}`;
    }
  }
  return t(trimmed);
};

/** Translates API messages (auth, series, search validation). */
export const translateApiMessage = (t, message) => {
  if (!message) {
    return t('errorUnknown');
  }
  if (Array.isArray(message)) {
    return message.map((part) => translateMessagePart(t, part)).filter(Boolean).join(', ');
  }
  if (typeof message === 'object') {
    if (typeof message.message === 'string') {
      return translateApiMessage(t, message.message);
    }
    if (typeof message.error === 'string') {
      return translateApiMessage(t, message.error);
    }
    const values = Object.values(message).filter((v) => typeof v === 'string');
    if (values.length > 0) {
      return translateApiMessage(t, values);
    }
    return t('errorUnknown');
  }
  if (typeof message !== 'string') {
    return t('errorUnknown');
  }
  if (message.includes(', ')) {
    return message
      .split(', ')
      .map((part) => translateMessagePart(t, part))
      .filter(Boolean)
      .join(', ');
  }
  return translateMessagePart(t, message);
};

/** @deprecated Use translateApiMessage */
export const translateAuthMessage = translateApiMessage;

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (ctx == null) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
};
