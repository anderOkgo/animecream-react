import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLanguage, translateEN } from '../../hooks/useLanguage';
import helpHttp from '../../helpers/helpHttp';
import SearchMethod from '../SearchMethod/SearchMethod';
import Card from '../Card/Card';
import Loader from '../Loader/Loader';
import Message from '../Message/Message';
import './Home.css';
import set from '../../helpers/set.json';
import RangeFilter from '../SearchMethod/RangeFilter';
import '../SearchMethod/RangeFilter.css';
import initialData from '../../helpers/initialData';
import { Helmet } from 'react-helmet-async';

const formatHttpErrMessage = (err, translate) => {
  if (!err) {
    return '';
  }
  if (typeof err.message === 'object' && err.message !== null) {
    return Object.values(err.message)
      .map((msg) => translate(msg))
      .join(', ');
  }
  return translate(err.message ?? 'errorGeneric');
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
  setProc,
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
  onScrollToggle,
  isAtTop,
}) => {
  const { t: translate, language: activeLanguage } = useLanguage();
  const [loadByIds, setLoadByIds] = useState(externalLoadByIds);
  const [loadedByList, setLoadedByList] = useState(false);
  const isLoadingByIdsRef = useRef(false);
  const hasInitialLoad = useRef(false);
  const lastOptRef = useRef({});

  const hasCleanedUrlRef = useRef(false);

  const tipoParam = useMemo(() => {
    // Soporte para rutas limpias tipo /producciones/accion → tipo=accion
    const pathname = window.location.pathname;
    const prodMatch = pathname.match(/^\/producciones\/([^/]+)\/?$/);
    if (prodMatch) {
      // Reemplazar la ruta limpia por / internamente (sin recargar)
      window.history.replaceState(null, '', '/');
      return prodMatch[1].trim().toLowerCase();
    }
    // Fallback: query param ?tipo=
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

  const initialSeed = useMemo(() => {
    try {
      const cached = localStorage.getItem('storage_initial') || localStorage.getItem('storage');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

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
        str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
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
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const setOptWithHistory = (requestData) => {
    if (navigation && !isRestoringRef.current) {
      navigation.pushHistory('request', { type: 'filter', data: requestData });
    }
    setOpt(requestData);
  };

  const cleanUrlParam = () => {
    if (tipoParam && !hasCleanedUrlRef.current) {
      hasCleanedUrlRef.current = true;
      window.history.replaceState(null, '', '/');
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
      },
    };
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
            const localResp = localStorage.getItem('storage_initial');
            if (localResp) {
              const data = JSON.parse(localResp);
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
  }, [navigation.currentState, onSeriesDataChange]);

  // Filtrar la información actual localmente (según lo solicitado por el usuario)
  const filteredDb = useMemo(() => {
    if (!db) return null;
    let filtered = [...db];

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
    const isOptActive = opt && Object.keys(opt).length > 0;
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

    // Cargar datos del localStorage primero para mostrar contenido inmediatamente
    try {
      var localResp = localStorage.getItem('storage');
      if (localResp) {
        localResp = JSON.parse(localResp);
        // Solo establecer si hay datos válidos
        if (localResp && (Array.isArray(localResp) ? localResp.length > 0 : Object.keys(localResp).length > 0)) {
          setDb(localResp);
        }
      }
    } catch (error) {
      console.log(error);
    }

    const fetchDataByIds = async () => {
      isLoadingByIdsRef.current = true;
      setLoading(true);
      setProc(true);

      try {
        const urlProduction = set.base_url + set.api_url;
        // Asegurar que los IDs sean números
        const ids = loadByIds
          .filter(Boolean)
          .map((id) => (typeof id === 'string' ? parseInt(id, 10) : Number(id)))
          .filter((id) => !isNaN(id) && id > 0);

        console.log('Home: Loading series with IDs:', ids);

        if (ids.length === 0) {
          throw new Error('No valid IDs to load');
        }

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

          // Filtrar solo los que necesitamos
          let filtered = allData;
          if (allData.length > ids.length) {
            console.log('Home: Filtering results from', allData.length, 'to', ids.length);
            filtered = allData.filter((series) => {
              const seriesId = Number(series.id || series.production_ranking_number);
              return ids.includes(seriesId);
            });
          }

          localStorage.setItem('storage', JSON.stringify(filtered));
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
        setProc(false);
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

    // Si ?tipo= es un slug de género/demografía, saltar carga completa
    // El efecto de resolución de slug hará la llamada API filtrada
    if (tipoParam && !tipoYear && !tipoDecade) {
      hasInitialLoad.current = true;
      try {
        const cached = localStorage.getItem('storage_initial') || localStorage.getItem('storage');
        if (cached) {
          const data = JSON.parse(cached);
          if (Array.isArray(data) && data.length > 0) {
            setDb(data);
            initialDbRef.current = data;
            if (onSeriesDataChange) onSeriesDataChange(data);
          }
        }
      } catch {}
      return;
    }

    // Cargar datos del localStorage primero (solo como preview mientras carga)
    try {
      var localResp = localStorage.getItem('storage_initial') || localStorage.getItem('storage');
      if (localResp) {
        localResp = JSON.parse(localResp);
        if (localResp && (Array.isArray(localResp) ? localResp.length > 0 : Object.keys(localResp).length > 0)) {
          // Mostrar datos del localStorage temporalmente
          setDb(localResp);
          initialDbRef.current = localResp;
          // Notificar las series actuales desde localStorage
          if (onSeriesDataChange) {
            onSeriesDataChange(localResp);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }

    // Siempre hacer carga inicial completa del API al recargar
    hasInitialLoad.current = true;
    const fetchInitialData = async () => {
      setLoading(true);
      setProc(true);
      try {
        const urlProduction = set.base_url + set.api_url;
        const response = await helpHttp.post(urlProduction, {});
        const productionsInfo = response;

        if (!productionsInfo?.err) {
          const data = Array.isArray(productionsInfo) ? productionsInfo : productionsInfo.data || productionsInfo;
          localStorage.setItem('storage', JSON.stringify(data));
          localStorage.setItem('storage_initial', JSON.stringify(data));
          setDb(data);
          initialDbRef.current = data;
          setErrorPayload(null);
          if (onSeriesDataChange) {
            onSeriesDataChange(data);
          }
          if (tipoParam) cleanUrlParam();
        } else {
          setErrorPayload({ type: 'http', err: productionsInfo.err });
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setErrorPayload({ type: 'i18nKey', key: 'errorLoadingData' });
      } finally {
        setLoading(false);
        setProc(false);
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

    // Si no hay opt y no hay refreshTrigger, no hacer nada
    if ((!opt || Object.keys(opt).length === 0) && (!refreshTrigger || refreshTrigger === 0)) {
      return;
    }

    // Guardar el opt actual si no está vacío
    if (opt && Object.keys(opt).length > 0) {
      lastOptRef.current = opt;
    }

    // Cargar datos del localStorage primero para mostrar contenido inmediatamente
    try {
      var localResp = localStorage.getItem('storage');
      if (localResp) {
        localResp = JSON.parse(localResp);
        // Solo establecer si hay datos válidos
        if (localResp && (Array.isArray(localResp) ? localResp.length > 0 : Object.keys(localResp).length > 0)) {
          setDb(localResp);
        }
      }
    } catch (error) {
      console.log(error);
    }

    const fetchData = async () => {
      setLoading(true);
      setProc(true);
      setLoadedByList(false);

      // Carga normal - asegurar que opt.body sea un objeto válido, no una string serializada
      let urlProduction = set.base_url + set.api_url;
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

      const [response] = await Promise.all([helpHttp.post(urlProduction, requestOpt)]);
      const productionsInfo = response;

      if (!productionsInfo?.err) {
        const data = Array.isArray(productionsInfo) ? productionsInfo : productionsInfo.data || productionsInfo;
        localStorage.setItem('storage', JSON.stringify(data));
        setDb(data);
        setErrorPayload(null);
        // Notificar cambios en los datos de series
        if (onSeriesDataChange) {
          onSeriesDataChange(data);
        }
      } else {
        setErrorPayload({ type: 'http', err: productionsInfo.err });
        // No limpiar db si hay error, mantener los datos anteriores
      }
      setLoading(false);
      setProc(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opt, refreshTrigger]);

  // Resolver ?tipo= como slug de género o demografía
  useEffect(() => {
    if (!tipoParam || tipoYear !== null || tipoDecade !== null || tipoLista !== null) return;

    const resolveSlug = async () => {
      const slugify = (str) =>
        str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-');

      let genres = [];
      let demos = [];
      try {
        genres = JSON.parse(localStorage.getItem('options_genres') || '[]');
      } catch {}
      try {
        demos = JSON.parse(localStorage.getItem('options_demographics') || '[]');
      } catch {}

      if (genres.length === 0 || demos.length === 0) {
        const [gRes, dRes] = await Promise.all([
          helpHttp.get(`${set.base_url}api/series/genres`),
          helpHttp.get(`${set.base_url}api/series/demographics`),
        ]);
        if (!gRes?.err) genres = gRes.genres || gRes.data || [];
        if (!dRes?.err) demos = dRes.demographics || dRes.data || [];
      }

      const genre = genres.find(
        (g) => slugify(g.name) === tipoParam || slugify(translateEN(g.name)) === tipoParam
      );
      if (genre) {
        setOptWithHistory({ method: 'POST', body: { genre_names: genre.name, production_ranking_number: 'ASC' } });
        cleanUrlParam();
        return;
      }

      const demo = demos.find((d) => slugify(d.name) === tipoParam || slugify(translateEN(d.name)) === tipoParam);
      if (demo) {
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
      setProc(true);

      try {
        const urlProduction = set.base_url + set.api_url;
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

          localStorage.setItem('storage', JSON.stringify(result));
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
        setProc(false);
        cleanUrlParam();
      }
    };

    fetchDataByListaParam();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleErrorDoubleClick = () => {
    setErrorPayload(null);
  };

  const errorMessage = errorPayload ? resolveAppError(errorPayload, translate) : null;

  // Lógica para SEO dinámico
  const baseUrl = 'https://animecream.com';
  const canonicalUrl = tipoParam ? `${baseUrl}/producciones/${tipoParam}` : baseUrl;
  
  // Título dinámico basado en el contexto e idioma
  const dynamicTitle = useMemo(() => {
    const isEn = language === 'en';
    if (tipoYear) {
      return isEn ? `Anime from ${tipoYear} | AnimeCream` : `Animes de ${tipoYear} | AnimeCream`;
    }
    if (tipoDecade) {
      return isEn ? `Anime from the ${tipoDecade}s | AnimeCream` : `Animes de la década ${tipoDecade}s | AnimeCream`;
    }
    if (tipoParam) {
      const displayParam = tipoParam.charAt(0).toUpperCase() + tipoParam.slice(1);
      return isEn ? `${displayParam} Anime | AnimeCream` : `Animes de ${displayParam} | AnimeCream`;
    }
    if (filteredDb && filteredDb.length > 0) return `${filteredDb[0].production_name} | AnimeCream`;
    return 'AnimeCream';
  }, [tipoYear, tipoDecade, tipoParam, filteredDb, language]);

  // Descripción dinámica basada en el contexto e idioma
  const dynamicDescription = useMemo(() => {
    const isEn = language === 'en';
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
  }, [tipoYear, tipoDecade, filteredDb, language]);

  return (
    <article className="grid-1-2">
      <Helmet>
        <title>{dynamicTitle}</title>
        <meta name="description" content={dynamicDescription} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* SEO Internacional */}
        <link rel="alternate" hrefLang="es" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        <meta property="og:locale" content={language === 'en' ? 'en_US' : 'es_ES'} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={dynamicTitle} />
        <meta property="og:description" content={dynamicDescription} />
        <meta
          property="og:image"
          content={filteredDb && filteredDb.length > 0 ? filteredDb[0].production_image_path : `${baseUrl}/logo.png`}
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={dynamicTitle} />
        <meta name="twitter:description" content={dynamicDescription} />
        <meta
          name="twitter:image"
          content={filteredDb && filteredDb.length > 0 ? filteredDb[0].production_image_path : `${baseUrl}/logo.png`}
        />
      </Helmet>

      {isToolbarVisible && (
        <div className="home-toolbar" onDoubleClick={() => setIsToolbarVisible(false)}>
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
      {/* Renderizar siempre que haya datos, sin importar si está cargando o no */}
      {filteredDb && filteredDb.length > 0 && (
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
      )}
    </article>
  );
};

export default Home;
