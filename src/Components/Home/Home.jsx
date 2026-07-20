import { useEffect, useState, useRef, useMemo } from 'react';
import { useLanguage, translateEN, translateApiMessage } from '../../hooks/useLanguage';
import helpHttp from '../../helpers/helpHttp';
import SearchMethod from '../SearchMethod/SearchMethod';
import Card from '../Card/Card';
import Loader from '../Loader/Loader';
import Message from '../Message/Message';
import './Home.css';
import set from '../../helpers/set.json';
import { API_BASE_URL } from '../../helpers/apiConfig';
import RangeFilter from '../SearchMethod/RangeFilter';
import '../SearchMethod/RangeFilter.css';
import initialData from '../../helpers/initialData';
import {
  getCachedFullCatalog,
  persistFullCatalog,
  isFullCatalogRequest,
  isAppOffline,
  parseOptBody,
  applyCatalogQuery,
  isYearOnlyOptBody,
} from '../../helpers/catalogStorage';
import { Helmet } from 'react-helmet-async';

const formatHttpErrMessage = (err, translate) => {
  if (!err) {
    return '';
  }
  return translateApiMessage(translate, err.message ?? 'errorGeneric');
};

const resolveAppError = (payload, translate) => {
  if (!payload) {
    return null;
  }
  if (payload.type === 'i18nKey') {
    return translate(payload.key);
  }
  if (payload.type === 'http') {
    return formatHttpErrMessage(payload.err, translate);
  }
  return null;
};

const Home = ({
  t,
  toggleLanguage,
  onLanguageDoubleClick,
  language,
  showRealNumbers,
  setShowRealNumbers,
  sortOrder,
  setSortOrder,
  role,
  onEditSeries,
  refreshTrigger,
  isAdvancedSearchVisible,
  setIsAdvancedSearchVisible,
  onAddToList,
  loadByIds: externalLoadByIds,
  onSeriesDataChange,
  onSetOptReady,
  navigation,
  onShowListManager,
}) => {
  const { t: translate, language: activeLanguage } = useLanguage();
  const [loadByIds, setLoadByIds] = useState(externalLoadByIds);
  const [loadedByList, setLoadedByList] = useState(false);
  const isLoadingByIdsRef = useRef(false);
  const hasInitialLoad = useRef(false);
  const lastOptRef = useRef({});
  const prevRefreshTriggerRef = useRef(refreshTrigger);
  const userNavigatedRef = useRef(false);

  const hasCleanedUrlRef = useRef(false);

  const tipoParam = useMemo(() => {
    const pathname = window.location.pathname;

    // /list/[id1,id2,...] — shared list route; normalized to "lista,id1,id2,..." for tipoLista
    const listaMatch = pathname.match(/^\/list\/([^/]+)\/?$/);
    if (listaMatch) {
      return `lista,${listaMatch[1].trim()}`;
    }

    // Legacy paths — server sends 301 but handle client-side as fallback
    const legacyMatch = pathname.match(/^\/(?:producciones|anime)\/([^/]+)\/?$/);
    if (legacyMatch) {
      const slug = legacyMatch[1].trim().toLowerCase();
      window.history.replaceState(null, '', `/${slug}`);
      return slug;
    }

    // /[slug] — canonical root-level route
    const rootMatch = pathname.match(/^\/([^/]+)\/?$/);
    if (rootMatch) {
      return rootMatch[1].trim().toLowerCase();
    }

    // Clean multi-segment unknown routes back to root
    if (pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }

    // Fallback: ?tipo= query param
    const raw = new URLSearchParams(window.location.search).get('tipo');
    return raw ? raw.trim().toLowerCase() : null;
  }, []);

  const tipoYear = useMemo(() => {
    if (!tipoParam || !/^\d{4}$/.test(tipoParam)) return null;
    return parseInt(tipoParam, 10);
  }, [tipoParam]);

  const tipoDecade = useMemo(() => {
    if (!tipoParam) return null;
    const m = tipoParam.match(/^(\d{2,4})s$/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    return n >= 100 ? Math.floor(n / 10) * 10 : n < 30 ? 2000 + n : 1900 + n;
  }, [tipoParam]);

  const tipoTop250 = tipoParam === 'top250';
  const tipoTop100 = tipoParam === 'top100';

  const initialSeed = useMemo(() => {
    const cached = getCachedFullCatalog();
    if (cached) return cached;

    let filtered = [...initialData];

    if (tipoYear) {
      filtered = filtered.filter((item) => parseInt(item.production_year, 10) === tipoYear);
    } else if (tipoDecade) {
      filtered = filtered.filter((item) => {
        const y = parseInt(item.production_year, 10);
        return y >= tipoDecade && y <= tipoDecade + 9;
      });
    } else if (tipoParam) {
      const slugify = (str) =>
        str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-');
      filtered = filtered.filter((item) => {
        const matchGenre = item.genre_names?.split(',').some((g) => slugify(g) === tipoParam);
        const matchDemo = slugify(item.demographic_name || '') === tipoParam;
        return matchGenre || matchDemo;
      });
    }

    // Si no hay coincidencias con el filtro, usamos toda la data
    if (filtered.length === 0) filtered = [...initialData];

    // Devolvemos 10 aleatorios de la lista filtrada (o de la total si falló el filtro)
    return filtered.sort(() => Math.random() - 0.5).slice(0, 10);
  }, [tipoYear, tipoDecade, tipoParam]);

  const [db, setDb] = useState(initialSeed);
  const [errorPayload, setErrorPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});
  const isRestoringRef = useRef(false);
  const initialDbRef = useRef(initialSeed);

  const getFullCatalogSource = () =>
    (initialDbRef.current?.length ? initialDbRef.current : null) ?? getCachedFullCatalog() ?? db;

  // Calcular límites de años dinámicamente basados en la data
  const { minYear, maxYear, minDecade, maxDecade } = useMemo(() => {
    const fallbackYear = new Date().getFullYear();
    if (!db || db.length === 0) {
      return { minYear: 1969, maxYear: fallbackYear, minDecade: 1960, maxDecade: 2020 };
    }
    const years = db.map((item) => parseInt(item.production_year, 10)).filter((y) => !isNaN(y) && y > 0);

    if (years.length === 0) {
      return { minYear: 1969, maxYear: fallbackYear, minDecade: 1960, maxDecade: 2020 };
    }

    const min = Math.min(...years);
    const max = Math.max(...years);
    const minD = Math.floor(min / 10) * 10;
    const maxD = Math.floor(max / 10) * 10;

    return { minYear: min, maxYear: max, minDecade: minD, maxDecade: maxD };
  }, [db]);

  const allYearValue = useMemo(() => minYear - 1, [minYear]);
  const allDecadeValue = useMemo(() => minDecade - 10, [minDecade]);

  const [yearFilter, setYearFilter] = useState(allYearValue);
  const [decadeFilter, setDecadeFilter] = useState(allDecadeValue);

  // Efecto para sincronizar los filtros con los valores calculados una vez que db esté listo
  useEffect(() => {
    setYearFilter(allYearValue);
    setDecadeFilter(allDecadeValue);
  }, [allYearValue, allDecadeValue]);

  const tipoLista = useMemo(() => {
    if (!tipoParam) return null;
    const parts = tipoParam.split(',');
    if (parts[0] !== 'lista' || parts.length < 2) return null;
    const ids = parts
      .slice(1)
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n) && n > 0);
    return ids.length > 0 ? ids : null;
  }, [tipoParam]);

  const [isRangesExpanded, setIsRangesExpanded] = useState(false);
  const [resolvedSlugs, setResolvedSlugs] = useState(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const toolbarClickCountRef = useRef(0);
  const toolbarClickTimerRef = useRef(null);

  const handleToolbarClick = () => {
    toolbarClickCountRef.current += 1;
    if (toolbarClickTimerRef.current) clearTimeout(toolbarClickTimerRef.current);
    toolbarClickTimerRef.current = setTimeout(() => {
      toolbarClickCountRef.current = 0;
    }, 1000);
    if (toolbarClickCountRef.current >= 5) {
      toolbarClickCountRef.current = 0;
      clearTimeout(toolbarClickTimerRef.current);
      setIsToolbarVisible(false);
    }
  };

  const setOptWithHistory = (requestData) => {
    if (navigation && !isRestoringRef.current) {
      navigation.pushHistory('request', { type: 'filter', data: requestData });
    }
    setOpt(requestData);
  };

  const cleanUrlParam = () => {
    if (tipoParam && !hasCleanedUrlRef.current) {
      hasCleanedUrlRef.current = true;
      // Do NOT clear the URL if it's an SEO-friendly parameter
      // window.history.replaceState(null, '', '/');
    }
  };

  // Exponer setOpt al componente padre
  useEffect(() => {
    if (onSetOptReady) {
      onSetOptReady(setOpt);
    }
  }, [onSetOptReady]);

  // Sync sliders with opt
  useEffect(() => {
    if (!opt) return;
    try {
      const currentBody = opt.body ? (typeof opt.body === 'string' ? JSON.parse(opt.body) : opt.body) : {};
      const year = currentBody.production_year;

      if (year) {
        if (Array.isArray(year)) {
          setDecadeFilter(year[0]);
          setYearFilter(allYearValue);
        } else if (typeof year === 'string' && year.includes(',')) {
          // Range string like "2020,2025" — the API handles the filter, reset local sliders
          setYearFilter(allYearValue);
          setDecadeFilter(allDecadeValue);
        } else {
          setYearFilter(parseInt(year, 10));
          setDecadeFilter(allDecadeValue);
        }
      } else {
        setYearFilter(allYearValue);
        setDecadeFilter(allDecadeValue);
      }
    } catch (e) {
      console.warn('Error syncing sliders with opt:', e);
    }
  }, [opt, allYearValue, allDecadeValue]);

  const handleYearChange = (year) => {
    setYearFilter(year);
    setDecadeFilter(allDecadeValue);
  };

  const handleDecadeChange = (decade) => {
    setDecadeFilter(decade);
    setYearFilter(allYearValue);
  };

  // Handlers para el toolbar completo
  const handleSortCycle = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  const handleTop250 = () => {
    const requestData = {
      method: 'POST',
      body: {
        limit: 250,
        production_ranking_number: 'ASC',
        _reverse: true,
      },
    };
    navigator.clipboard?.writeText(`${window.location.origin}/top250`);
    setOptWithHistory(requestData);
  };

  const handleTop100 = () => {
    const requestData = {
      method: 'POST',
      body: {
        limit: 100,
        production_ranking_number: 'ASC',
        _reverse: true,
      },
    };
    navigator.clipboard?.writeText(`${window.location.origin}/top100`);
    setOptWithHistory(requestData);
  };

  // Restaurar peticiones cuando se navega hacia atrás
  useEffect(() => {
    if (!navigation) return;

    const currentState = navigation.currentState;
    if (currentState) {
      if (currentState.type === 'request' && currentState.data?.data) {
        // Restaurar la petición anterior sin agregar al historial
        isRestoringRef.current = true;
        setOpt(currentState.data.data);
        // Resetear el flag después de un breve delay
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 50);
      } else if (currentState.type === 'initial') {
        // Si volvemos al estado inicial, resetear los filtros y restaurar datos iniciales
        isRestoringRef.current = true;
        setOpt({});

        // Si tenemos datos iniciales guardados, los restauramos
        if (initialDbRef.current) {
          setDb(initialDbRef.current);
          if (onSeriesDataChange) {
            onSeriesDataChange(initialDbRef.current);
          }
        } else {
          // Si por alguna razón no los tenemos (ej: refresh), los cargamos del localStorage
          try {
            const data = getCachedFullCatalog();
            if (data) {
              setDb(data);
              initialDbRef.current = data;
              if (onSeriesDataChange) onSeriesDataChange(data);
            } else {
              // Si no hay nada en cache, mantener initialData en lugar de poner null
              if (!db || db === initialData) {
                // No hacemos nada, mantenemos el estado actual
              } else {
                setDb(null);
              }
            }
          } catch (e) {
            setDb(null);
          }
        }

        // Resetear el flag después de un delay
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      }
    }
    // `db`/`navigation` deliberately excluded: `navigation.currentState` is
    // already the tracked dependency, and `db` is only read to compute the
    // next `db`, not to decide whether to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.currentState, onSeriesDataChange]);

  // Filtrar la información actual localmente (según lo solicitado por el usuario)
  const filteredDb = useMemo(() => {
    if (!db) return null;

    const isOffline = isAppOffline();
    const isOptActive = opt && Object.keys(opt).length > 0;
    const optBody = isOptActive ? parseOptBody(opt) : {};
    // Año por doble clic: offline usa el slider (mismo camino que RangeFilter), no applyCatalogQuery
    const useOfflineYearSlider = isOffline && isOptActive && !loadedByList && isYearOnlyOptBody(optBody);
    const useOfflineQuery = isOffline && isOptActive && !loadedByList && !useOfflineYearSlider;

    let filtered;
    if (useOfflineQuery) {
      const source = getFullCatalogSource();
      const offlineBody = { ...parseOptBody(opt) };
      const reverseOffline = offlineBody._reverse === true;
      delete offlineBody._reverse;
      const offlineResult = source ? applyCatalogQuery(source, offlineBody) : [];
      filtered = reverseOffline ? [...offlineResult].reverse() : offlineResult;
    } else if (isOffline && !loadedByList) {
      filtered = [...(getFullCatalogSource() || db)];
    } else {
      filtered = [...db];
    }

    const isYearFilterActive = yearFilter > allYearValue;
    const isDecadeFilterActive = decadeFilter > allDecadeValue;

    if (isYearFilterActive) {
      filtered = filtered.filter((item) => parseInt(item.production_year, 10) === yearFilter);
    } else if (isDecadeFilterActive) {
      filtered = filtered.filter((item) => {
        const itemYear = parseInt(item.production_year, 10);
        return itemYear >= decadeFilter && itemYear <= decadeFilter + 9;
      });
    }

    // Solo aplicar ordenamiento si hay algún filtro de rango activo
    // Si está en "All", dejar el orden por defecto (el que viene de la API/estado previo)
    if (isYearFilterActive || isDecadeFilterActive) {
      filtered.sort((a, b) => {
        const rankA = parseInt(a.production_ranking_number, 10) || 999999;
        const rankB = parseInt(b.production_ranking_number, 10) || 999999;

        if (rankA !== rankB) {
          return rankA - rankB;
        }

        // Si el ranking es el mismo, ordenar por año (más reciente primero)
        const yearA = parseInt(a.production_year, 10) || 0;
        const yearB = parseInt(b.production_year, 10) || 0;
        return yearB - yearA;
      });
    }

    // Aplicar filtro ?tipo= de año/década localmente si no hay otros filtros activos
    if (!isYearFilterActive && !isDecadeFilterActive && !isOptActive && !loadedByList) {
      if (tipoYear) {
        const matches = filtered.filter((item) => parseInt(item.production_year, 10) === tipoYear);
        if (matches.length > 0) filtered = matches;
      } else if (tipoDecade) {
        const matches = filtered.filter((item) => {
          const y = parseInt(item.production_year, 10);
          return y >= tipoDecade && y <= tipoDecade + 9;
        });
        if (matches.length > 0) filtered = matches;
      }

      if (tipoYear || tipoDecade) {
        filtered.sort((a, b) => {
          const rankA = parseInt(a.production_ranking_number, 10) || 999999;
          const rankB = parseInt(b.production_ranking_number, 10) || 999999;
          if (rankA !== rankB) return rankA - rankB;
          return (parseInt(b.production_year, 10) || 0) - (parseInt(a.production_year, 10) || 0);
        });
      }
    }

    return filtered;
    // `getFullCatalogSource` is redefined every render from the same
    // closure as the values already listed below; adding it as a dep would
    // make this memo recompute on every render, defeating its purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, yearFilter, decadeFilter, allYearValue, allDecadeValue, tipoYear, tipoDecade, opt, loadedByList]);

  // Sincronizar filteredDb con onSeriesDataChange siempre que cambie
  useEffect(() => {
    if (filteredDb && Array.isArray(filteredDb) && onSeriesDataChange) {
      onSeriesDataChange(filteredDb);
    }
  }, [filteredDb, onSeriesDataChange]);

  // Sincronizar loadByIds externo
  useEffect(() => {
    if (externalLoadByIds && !isLoadingByIdsRef.current) {
      setLoadByIds(externalLoadByIds);
    }
  }, [externalLoadByIds]);

  useEffect(() => {
    // Resetear orden a default cuando cambia la consulta
    if (setSortOrder) {
      setSortOrder(null);
    }
  }, [opt, setSortOrder]);

  // Efecto separado para cargar por IDs (solo cuando loadByIds cambia y no está vacío)
  useEffect(() => {
    // No ejecutar si no hay loadByIds o ya se está cargando
    if (!loadByIds || loadByIds.length === 0 || isLoadingByIdsRef.current) {
      return;
    }

    userNavigatedRef.current = true;

    const fetchDataByIds = async () => {
      isLoadingByIdsRef.current = true;
      setLoading(true);

      try {
        const ids = loadByIds
          .filter(Boolean)
          .map((id) => (typeof id === 'string' ? parseInt(id, 10) : Number(id)))
          .filter((id) => !isNaN(id) && id > 0);

        console.log('Home: Loading series with IDs:', ids);

        if (ids.length === 0) {
          throw new Error('No valid IDs to load');
        }

        const cached = getCachedFullCatalog();
        if (cached) {
          const filtered = applyCatalogQuery(cached, { id: ids });
          setDb(filtered);
          setLoadedByList(true);
          setErrorPayload(null);
          if (onSeriesDataChange) onSeriesDataChange(filtered);
          return;
        }

        const urlProduction = API_BASE_URL + set.api_url;
        // El API espera el parámetro "id" (no "ids") como array de números
        // Según series-read.mysql.ts línea 216: id: HDB.generateInCondition
        const productionsInfo = await helpHttp.post(urlProduction, {
          body: {
            id: ids, // Array de IDs numéricos - el API usa generateInCondition
          },
        });

        console.log('Home: Response from API:', productionsInfo);

        if (!productionsInfo?.err) {
          const allData = Array.isArray(productionsInfo)
            ? productionsInfo
            : productionsInfo.data || productionsInfo;

          // Filtrar y reordenar según el orden de la lista
          const seriesMap = new Map();
          allData.forEach((series) => {
            const seriesId = Number(series.id || series.production_ranking_number);
            if (seriesId) seriesMap.set(seriesId, series);
          });
          const ordered = ids.map((id) => seriesMap.get(id)).filter(Boolean);
          const filtered = ordered.length > 0 ? ordered : allData;

          setDb(filtered);
          setLoadedByList(true);
          setErrorPayload(null);
          // Notificar cambios en los datos de series
          if (onSeriesDataChange) {
            onSeriesDataChange(filtered);
          }
        } else {
          setErrorPayload({ type: 'http', err: productionsInfo.err });
        }
      } catch (error) {
        console.error('Error loading by IDs:', error);
        setErrorPayload({ type: 'i18nKey', key: 'errorLoadingSeriesByIds' });
      } finally {
        setLoading(false);
        isLoadingByIdsRef.current = false;
        // Limpiar loadByIds después de cargar (exitoso o con error)
        // Usar setTimeout para evitar que el cambio de estado cause re-ejecución inmediata
        setTimeout(() => {
          setLoadByIds(null);
        }, 0);
      }
    };

    fetchDataByIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadByIds]);

  // Carga inicial cuando el componente se monta
  useEffect(() => {
    if (hasInitialLoad.current) return;

    // Si hay caché y es un slug de género/demografía, resolveSlug lo filtra localmente
    if (tipoParam && !tipoYear && !tipoDecade) {
      const cached = getCachedFullCatalog();
      if (cached) {
        hasInitialLoad.current = true;
        setDb(cached);
        initialDbRef.current = cached;
        if (onSeriesDataChange) onSeriesDataChange(cached);
        return;
      }
      // Sin caché: cae al fetch completo que corre en paralelo con resolveSlug
    }

    const cachedFull = getCachedFullCatalog();
    if (cachedFull) {
      setDb(cachedFull);
      initialDbRef.current = cachedFull;
      if (onSeriesDataChange) {
        onSeriesDataChange(cachedFull);
      }
    }

    // Siempre hacer carga inicial completa del API al recargar
    hasInitialLoad.current = true;
    const fetchInitialData = async () => {
      if (isAppOffline()) {
        return;
      }
      try {
        const urlProduction = API_BASE_URL + set.api_url;
        const response = await helpHttp.post(urlProduction, {});
        const productionsInfo = response;

        if (!productionsInfo?.err) {
          const data = Array.isArray(productionsInfo) ? productionsInfo : productionsInfo.data || productionsInfo;
          persistFullCatalog(data);
          if (!userNavigatedRef.current) {
            setDb(data);
            initialDbRef.current = data;
            setErrorPayload(null);
            if (onSeriesDataChange) onSeriesDataChange(data);
            if (tipoParam) cleanUrlParam();
          }
        } else {
          setErrorPayload({ type: 'http', err: productionsInfo.err });
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setErrorPayload({ type: 'i18nKey', key: 'errorLoadingData' });
      } finally {
        // no loader to dismiss; App Loader (proc) covers initial load
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto separado para carga normal (solo cuando opt cambia y NO hay loadByIds)
  useEffect(() => {
    // No ejecutar si hay loadByIds pendiente o si está cargando por IDs
    if ((loadByIds && loadByIds.length > 0) || isLoadingByIdsRef.current) {
      return;
    }

    // Si opt está vacío pero refreshTrigger cambió, usar el último opt guardado
    const optToUse = opt && Object.keys(opt).length > 0 ? opt : lastOptRef.current;

    const wasRefreshTriggered = refreshTrigger !== prevRefreshTriggerRef.current;
    prevRefreshTriggerRef.current = refreshTrigger;

    // Si no hay opt y no hubo refresh trigger, no hacer nada
    if ((!opt || Object.keys(opt).length === 0) && !wasRefreshTriggered) {
      return;
    }

    userNavigatedRef.current = true;

    // Guardar el opt actual si no está vacío
    if (opt && Object.keys(opt).length > 0) {
      lastOptRef.current = opt;
    }

    const cached = getCachedFullCatalog();
    if (cached && !wasRefreshTriggered) {
      setLoadedByList(false);
      setErrorPayload(null);
      const body = { ...parseOptBody(optToUse) };
      const reverseResults = body._reverse === true;
      delete body._reverse;
      const hasFilter = Object.keys(body).length > 0;
      const result = hasFilter ? applyCatalogQuery(cached, body) : cached;
      if (!hasFilter) initialDbRef.current = cached;
      const finalResult = reverseResults ? [...result].reverse() : result;
      setDb(finalResult);
      if (onSeriesDataChange) onSeriesDataChange(finalResult);
      return;
    }

    if (isAppOffline()) {
      const source = cached || getFullCatalogSource();
      setLoadedByList(false);
      setErrorPayload(null);
      if (source) {
        const body = { ...parseOptBody(optToUse) };
        const reverseResults = body._reverse === true;
        delete body._reverse;
        const hasFilter = Object.keys(body).length > 0;
        const result = hasFilter ? applyCatalogQuery(source, body) : [...source];
        const finalResult = reverseResults ? [...result].reverse() : result;
        setDb(finalResult);
        if (onSeriesDataChange) onSeriesDataChange(finalResult);
      }
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setLoadedByList(false);

      // Carga normal - asegurar que opt.body sea un objeto válido, no una string serializada
      let urlProduction = API_BASE_URL + set.api_url;
      const requestOpt = { ...optToUse };

      // Si opt.body es una string, parsearla primero
      if (typeof requestOpt.body === 'string') {
        try {
          requestOpt.body = JSON.parse(requestOpt.body);
        } catch (e) {
          console.warn('Error parsing opt.body:', e);
          delete requestOpt.body;
        }
      }

      const reverseResults = requestOpt.body?._reverse === true;
      if (reverseResults && requestOpt.body) {
        const { _reverse, ...cleanBody } = requestOpt.body;
        requestOpt.body = cleanBody;
      }

      const [response] = await Promise.all([helpHttp.post(urlProduction, requestOpt)]);
      if (cancelled) return;
      const productionsInfo = response;

      if (!productionsInfo?.err) {
        const data = Array.isArray(productionsInfo) ? productionsInfo : productionsInfo.data || productionsInfo;
        if (isFullCatalogRequest(requestOpt)) {
          persistFullCatalog(data);
          initialDbRef.current = data;
        }
        const finalData = reverseResults ? [...data].reverse() : data;
        setDb(finalData);
        setErrorPayload(null);
        if (onSeriesDataChange) {
          onSeriesDataChange(finalData);
        }
      } else {
        setErrorPayload({ type: 'http', err: productionsInfo.err });
        // No limpiar db si hay error, mantener los datos anteriores
      }
      setLoading(false);
    };

    fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opt, refreshTrigger]);

  // Resolver ?tipo= como slug de género o demografía
  useEffect(() => {
    if (!tipoParam || tipoYear !== null || tipoDecade !== null || tipoLista !== null || tipoTop250 || tipoTop100)
      return;

    const resolveSlug = async () => {
      const slugify = (str) =>
        str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-');

      // Fast path: catalog already cached \u2192 extract genres/demographics locally, zero network calls
      const cachedCatalog = getCachedFullCatalog();
      if (cachedCatalog && cachedCatalog.length > 0) {
        const genreNames = new Set();
        const demoNames = new Set();
        cachedCatalog.forEach((item) => {
          item.genre_names?.split(',').forEach((g) => {
            const t = g.trim();
            if (t) genreNames.add(t);
          });
          if (item.demographic_name) demoNames.add(item.demographic_name);
        });

        const matchedGenre = [...genreNames].find(
          (g) => slugify(g) === tipoParam || slugify(translateEN(g)) === tipoParam
        );
        if (matchedGenre) {
          setResolvedSlugs({ es: slugify(matchedGenre), en: slugify(translateEN(matchedGenre)) });
          setOptWithHistory({
            method: 'POST',
            body: { genre_names: matchedGenre, production_ranking_number: 'ASC' },
          });
          cleanUrlParam();
          return;
        }

        const matchedDemo = [...demoNames].find(
          (d) => slugify(d) === tipoParam || slugify(translateEN(d)) === tipoParam
        );
        if (matchedDemo) {
          setResolvedSlugs({ es: slugify(matchedDemo), en: slugify(translateEN(matchedDemo)) });
          setOptWithHistory({
            method: 'POST',
            body: { demographic_name: matchedDemo, production_ranking_number: 'ASC' },
          });
          cleanUrlParam();
          return;
        }
      }

      // Slow path: catalog not cached yet \u2014 fetch genres/demographics from API
      const GENRES_DEMOS_TTL = 24 * 60 * 60 * 1000; // 24 hours
      const now = Date.now();

      let genres = [];
      let demos = [];
      const genreTs = parseInt(localStorage.getItem('options_genres_ts') || '0', 10);
      const demoTs = parseInt(localStorage.getItem('options_demographics_ts') || '0', 10);
      try {
        if (genreTs && now - genreTs < GENRES_DEMOS_TTL)
          genres = JSON.parse(localStorage.getItem('options_genres') || '[]');
      } catch {
        // Malformed cache entry -- falls through to the API fetch below.
      }
      try {
        if (demoTs && now - demoTs < GENRES_DEMOS_TTL)
          demos = JSON.parse(localStorage.getItem('options_demographics') || '[]');
      } catch {
        // Malformed cache entry -- falls through to the API fetch below.
      }

      if (genres.length === 0 || demos.length === 0) {
        const [gRes, dRes] = await Promise.all([
          helpHttp.get(`${API_BASE_URL}api/series/genres`),
          helpHttp.get(`${API_BASE_URL}api/series/demographics`),
        ]);
        if (!gRes?.err) {
          genres = gRes.genres || gRes.data || [];
          localStorage.setItem('options_genres', JSON.stringify(genres));
          localStorage.setItem('options_genres_ts', now.toString());
        }
        if (!dRes?.err) {
          demos = dRes.demographics || dRes.data || [];
          localStorage.setItem('options_demographics', JSON.stringify(demos));
          localStorage.setItem('options_demographics_ts', now.toString());
        }
      }

      const genre = genres.find(
        (g) => slugify(g.name) === tipoParam || slugify(translateEN(g.name)) === tipoParam
      );
      if (genre) {
        setResolvedSlugs({ es: slugify(genre.name), en: slugify(translateEN(genre.name)) });
        setOptWithHistory({ method: 'POST', body: { genre_names: genre.name, production_ranking_number: 'ASC' } });
        cleanUrlParam();
        return;
      }

      const demo = demos.find((d) => slugify(d.name) === tipoParam || slugify(translateEN(d.name)) === tipoParam);
      if (demo) {
        setResolvedSlugs({ es: slugify(demo.name), en: slugify(translateEN(demo.name)) });
        setOptWithHistory({
          method: 'POST',
          body: { demographic_name: demo.name, production_ranking_number: 'ASC' },
        });
        cleanUrlParam();
        return;
      }

      setOptWithHistory({ method: 'POST', body: { production_ranking_number: 'ASC' } });
      cleanUrlParam();
    };

    resolveSlug();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle ?tipo=lista,id1,id2,... — loads by specific IDs preserving URL order, no sorting
  useEffect(() => {
    if (!tipoLista) return;

    const fetchDataByListaParam = async () => {
      setLoading(true);

      try {
        if (isAppOffline()) {
          const source = getFullCatalogSource();
          const result = source ? applyCatalogQuery(source, { id: tipoLista }) : [];
          setDb(result);
          setLoadedByList(true);
          setErrorPayload(null);
          if (onSeriesDataChange) onSeriesDataChange(result);
          return;
        }

        const urlProduction = API_BASE_URL + set.api_url;
        const productionsInfo = await helpHttp.post(urlProduction, {
          body: { id: tipoLista },
        });

        if (!productionsInfo?.err) {
          const allData = Array.isArray(productionsInfo)
            ? productionsInfo
            : productionsInfo.data || productionsInfo;

          // Preserve the exact order of IDs from the URL param
          const ordered = tipoLista.map((id) => allData.find((s) => Number(s.id) === id)).filter(Boolean);
          const result = ordered.length > 0 ? ordered : allData;

          setDb(result);
          setErrorPayload(null);
          if (onSeriesDataChange) onSeriesDataChange(result);
        } else {
          setErrorPayload({ type: 'http', err: productionsInfo.err });
        }
      } catch (error) {
        console.error('Error loading by lista param:', error);
        setErrorPayload({ type: 'i18nKey', key: 'errorLoadingData' });
      } finally {
        setLoading(false);
        cleanUrlParam();
      }
    };

    fetchDataByListaParam();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle /anime/top250 — loads top 250 ranked series
  useEffect(() => {
    if (!tipoTop250) return;
    setOpt({ method: 'POST', body: { limit: 250, production_ranking_number: 'ASC', _reverse: true } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle /top100 — loads top 100 ranked series
  useEffect(() => {
    if (!tipoTop100) return;
    setOpt({ method: 'POST', body: { limit: 100, production_ranking_number: 'ASC', _reverse: true } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleErrorDoubleClick = () => {
    setErrorPayload(null);
  };

  const errorMessage = errorPayload ? resolveAppError(errorPayload, translate) : null;

  // Lógica para SEO dinámico
  const baseUrl = 'https://animecream.com';
  const canonicalUrl = tipoLista
    ? `${baseUrl}/list/${tipoLista.join(',')}`
    : tipoParam
      ? `${baseUrl}/${tipoParam}`
      : baseUrl;

  // Título dinámico basado en el contexto e idioma
  const dynamicTitle = useMemo(() => {
    const isEn = language === 'en';
    if (tipoTop250) {
      return isEn ? 'Top 250 Anime | AnimeCream' : 'Top 250 Animes | AnimeCream';
    }
    if (tipoTop100) {
      return isEn ? 'Top 100 Anime | AnimeCream' : 'Top 100 Animes | AnimeCream';
    }
    if (tipoYear) {
      return isEn ? `Anime from ${tipoYear} | AnimeCream` : `Animes de ${tipoYear} | AnimeCream`;
    }
    if (tipoDecade) {
      return isEn
        ? `Anime from the ${tipoDecade}s | AnimeCream`
        : `Animes de la década ${tipoDecade}s | AnimeCream`;
    }
    if (tipoParam) {
      const displayParam = tipoParam.charAt(0).toUpperCase() + tipoParam.slice(1);
      return isEn ? `${displayParam} Anime | AnimeCream` : `Animes de ${displayParam} | AnimeCream`;
    }
    if (filteredDb && filteredDb.length > 0) return `${filteredDb[0].production_name} | AnimeCream`;
    return 'AnimeCream';
  }, [tipoTop250, tipoTop100, tipoYear, tipoDecade, tipoParam, filteredDb, language]);

  // Descripción dinámica basada en el contexto e idioma
  const dynamicDescription = useMemo(() => {
    const isEn = language === 'en';
    if (tipoTop250) {
      return isEn
        ? 'Discover the 250 highest-ranked anime of all time. Curated rankings, reviews, and recommendations on AnimeCream.'
        : 'Descubre los 250 animes mejor rankeados de todos los tiempos. Rankings, reseñas y recomendaciones en AnimeCream.';
    }
    if (tipoTop100) {
      return isEn
        ? 'Discover the 100 highest-ranked anime of all time. Curated rankings, reviews, and recommendations on AnimeCream.'
        : 'Descubre los 100 animes mejor rankeados de todos los tiempos. Rankings, reseñas y recomendaciones en AnimeCream.';
    }
    if (tipoYear) {
      return isEn
        ? `Explore the complete list of anime released in ${tipoYear}. Reviews, rankings, and recommendations on AnimeCream.`
        : `Explora la lista completa de animes estrenados en el año ${tipoYear}. Reseñas, rankings y recomendaciones en AnimeCream.`;
    }
    if (tipoDecade) {
      return isEn
        ? `Discover the best anime from the ${tipoDecade}s. A journey through the classics and hidden gems of this era.`
        : `Descubre los mejores animes de la década de los ${tipoDecade}s. Un viaje por los clásicos y joyas ocultas de esta época.`;
    }
    if (filteredDb && filteredDb.length > 0) {
      return isEn ? filteredDb[0].production_description_en : filteredDb[0].production_description;
    }
    return isEn
      ? 'Explore the best anime series, reviews, and recommendations on AnimeCream. Your ultimate anime encyclopedia.'
      : 'Explora las mejores series de anime, reseñas y recomendaciones en AnimeCream. Tu enciclopedia de anime definitiva.';
  }, [tipoTop250, tipoTop100, tipoYear, tipoDecade, filteredDb, language]);

  return (
    <article className="grid-1-2">
      <Helmet>
        <title>{dynamicTitle}</title>
        <meta name="description" content={dynamicDescription} />
        <link rel="canonical" href={canonicalUrl} />
        {tipoLista && <meta name="robots" content="noindex, nofollow" />}

        {/* SEO Internacional */}
        {resolvedSlugs && resolvedSlugs.es !== resolvedSlugs.en ? (
          <>
            <link rel="alternate" hrefLang="es" href={`${baseUrl}/${resolvedSlugs.es}`} />
            <link rel="alternate" hrefLang="en" href={`${baseUrl}/${resolvedSlugs.en}`} />
            <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/${resolvedSlugs.en}`} />
          </>
        ) : (
          <>
            <link rel="alternate" hrefLang="es" href={canonicalUrl} />
            <link rel="alternate" hrefLang="en" href={canonicalUrl} />
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
          </>
        )}
        <meta property="og:locale" content={language === 'en' ? 'en_US' : 'es_ES'} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={dynamicTitle} />
        <meta property="og:description" content={dynamicDescription} />
        <meta
          property="og:image"
          content={
            filteredDb && filteredDb.length > 0
              ? filteredDb[0].production_image_path
              : `${baseUrl}/img/tarjeta/AnimecreamTargetaSEO.png`
          }
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={dynamicTitle} />
        <meta name="twitter:description" content={dynamicDescription} />
        <meta
          name="twitter:image"
          content={
            filteredDb && filteredDb.length > 0
              ? filteredDb[0].production_image_path
              : `${baseUrl}/img/tarjeta/AnimecreamTargetaSEO.png`
          }
        />
      </Helmet>

      {isToolbarVisible && (
        <div className="home-toolbar" onClick={handleToolbarClick}>
          <button
            className="toolbar-btn"
            onClick={toggleLanguage}
            onDoubleClick={onLanguageDoubleClick}
            title={language === 'en' ? translate('switchToSpanish') : translate('switchToEnglish')}
          >
            {language === 'en' ? 'EN' : 'ES'}
          </button>
          <button
            className="toolbar-btn"
            onClick={() => setShowRealNumbers(!showRealNumbers)}
            title={translate('index')}
          >
            IX
          </button>
          <button
            className={`toolbar-btn ${isAdvancedSearchVisible ? 'active' : ''}`}
            onClick={() => {
              setIsAdvancedSearchVisible(!isAdvancedSearchVisible);
              if (!isAdvancedSearchVisible) {
                const scrollContainer = document.querySelector('.section-tab') || window;
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            title={isAdvancedSearchVisible ? translate('closeAdvancedSearch') || 'Cerrar' : translate('search')}
          >
            {isAdvancedSearchVisible ? '✕' : '🔍'}
          </button>
          <button className="toolbar-btn" onClick={handleSortCycle} title={translate('rankingOrder')}>
            {sortOrder === null ? '⇄' : sortOrder === 'asc' ? '▲' : '▼'} {translate('sort')}
          </button>

          <button className="toolbar-btn" onClick={onShowListManager} title={translate('myLists')}>
            ☰ {translate('myLists')}
          </button>
          <button className="toolbar-btn top250-btn" onClick={handleTop250} title="Top 250">
            Top 250
          </button>
        </div>
      )}

      <SearchMethod
        setOpt={setOptWithHistory}
        t={t}
        isFormVisible={isAdvancedSearchVisible}
        setIsFormVisible={setIsAdvancedSearchVisible}
        navigation={navigation}
      />
      <section className={`ranges-container ${!isRangesExpanded ? 'collapsed' : ''}`}>
        {isRangesExpanded && (
          <div className="ranges-content">
            <RangeFilter
              label={translate('filterByYear')}
              min={allYearValue}
              max={maxYear}
              value={yearFilter < allYearValue ? allYearValue : yearFilter}
              onChange={handleYearChange}
              displayValue={yearFilter <= allYearValue ? translate('allYears') : yearFilter}
              onReset={() => handleYearChange(allYearValue)}
            />
            <RangeFilter
              label={translate('filterByDecade')}
              min={allDecadeValue}
              max={maxYear ? Math.floor(maxYear / 10) * 10 : maxDecade}
              step={10}
              value={decadeFilter < allDecadeValue ? allDecadeValue : decadeFilter}
              onChange={handleDecadeChange}
              displayValue={decadeFilter <= allDecadeValue ? translate('allYears') : `${decadeFilter}s`}
              onReset={() => handleDecadeChange(allDecadeValue)}
            />
          </div>
        )}
        <button
          className="ranges-toggle-btn-bottom"
          onClick={() => setIsRangesExpanded(!isRangesExpanded)}
          title={isRangesExpanded ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        >
          {isRangesExpanded ? '︽' : '︾'}
        </button>
        <button className="toolbar-btn top100-ranges-btn" onClick={handleTop100} title="Top 100">
          Top 100
        </button>
      </section>
      {/* Mostrar Loader siempre que esté cargando, ahora es flotante y se puede cerrar al hacer clic */}
      {loading && <Loader onClick={() => setLoading(false)} />}

      {errorMessage && (
        <Message
          key={activeLanguage}
          msg={`${translate('errorPrefix')} ${errorMessage}`}
          bgColor="#dc3545"
          onDoubleClick={handleErrorDoubleClick}
        />
      )}
      {filteredDb && filteredDb.length > 0 ? (
        <Card
          data={filteredDb}
          t={t}
          language={language}
          showRealNumbers={showRealNumbers}
          onFilterChange={setOptWithHistory}
          navigation={navigation}
          sortOrder={sortOrder}
          role={role}
          onEditSeries={onEditSeries}
          onAddToList={onAddToList}
          onFilteredDataChange={onSeriesDataChange}
        />
      ) : (
        filteredDb &&
        !loading && <div style={{ textAlign: 'center', padding: '2em' }}>{translate('noDataFound')}</div>
      )}
    </article>
  );
};

export default Home;
