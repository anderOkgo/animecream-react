import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import helpHttp from '../../helpers/helpHttp';
import SearchMethod from '../SearchMethod/SearchMethod';
import Card from '../Card/Card';
import Loader from '../Loader/Loader';
import Message from '../Message/Message';
import './Home.css';
import set from '../../helpers/set.json';
import RangeFilter from '../SearchMethod/RangeFilter';
import '../SearchMethod/RangeFilter.css';

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
  const [db, setDb] = useState(null);
  const [errorPayload, setErrorPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});
  const isRestoringRef = useRef(false);
  const initialDbRef = useRef(null); // Ref para guardar los datos de la carga inicial

  // Calcular límites de años dinámicamente basados en la data
  const { minYear, maxYear, minDecade, maxDecade } = useMemo(() => {
    const fallbackYear = new Date().getFullYear();
    if (!db || db.length === 0) {
      return { minYear: 1950, maxYear: fallbackYear, minDecade: 1940, maxDecade: 2020 };
    }
    const years = db.map((item) => parseInt(item.production_year, 10)).filter((y) => !isNaN(y) && y > 0);

    if (years.length === 0) {
      return { minYear: 1950, maxYear: fallbackYear, minDecade: 1940, maxDecade: 2020 };
    }

    const min = Math.min(...years);
    const max = Math.max(...years);
    const minD = Math.floor(min / 10) * 10;
    const maxD = Math.floor(max / 10) * 10;

    return { minYear: min, maxYear: max, minDecade: minD, maxDecade: maxD };
  }, [db]);

  const allYearValue = useMemo(() => minYear - 1, [minYear]);
  const allDecadeValue = useMemo(() => minDecade - 10, [minDecade]);

  const [yearFilter, setYearFilter] = useState(1949); // Default sync with initial fallback
  const [decadeFilter, setDecadeFilter] = useState(1940); // Default sync with initial fallback

  // Wrapper para setOpt que agrega al historial
  const setOptWithHistory = (requestData) => {
    if (navigation && !isRestoringRef.current) {
      navigation.pushHistory('request', { type: 'filter', data: requestData });
    }
    setOpt(requestData);
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
              setDb(null); // Fallback si no hay nada
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
  const [loadByIds, setLoadByIds] = useState(externalLoadByIds);
  const isLoadingByIdsRef = useRef(false);
  const hasInitialLoad = useRef(false);
  const lastOptRef = useRef({}); // Guardar el último opt usado para recargar

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

    return filtered;
  }, [db, yearFilter, decadeFilter, allYearValue, allDecadeValue]);

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
          // Guardar todos los datos en localStorage
          localStorage.setItem('storage', JSON.stringify(data));
          localStorage.setItem('storage_initial', JSON.stringify(data)); // Guardar copia fija de la carga inicial
          setDb(data);
          initialDbRef.current = data;
          setErrorPayload(null);
          // Notificar cambios en los datos de series
          if (onSeriesDataChange) {
            onSeriesDataChange(data);
          }
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

  const handleErrorDoubleClick = () => {
    setErrorPayload(null);
  };

  const errorMessage = errorPayload ? resolveAppError(errorPayload, translate) : null;

  return (
    <article className="grid-1-2">
      <div className="home-toolbar">
        <button
          className="toolbar-btn"
          onClick={toggleLanguage}
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
        <button className="toolbar-btn" onClick={handleSortCycle} title={translate('rankingOrder')}>
          {sortOrder === null ? '⇄' : sortOrder === 'asc' ? '▲' : '▼'} {translate('sort')}
        </button>

        <button className="toolbar-btn" onClick={onShowListManager} title={translate('myLists')}>
          ☰ {translate('myLists')}
        </button>
        <button
          className={`toolbar-btn ${isAdvancedSearchVisible ? 'active' : ''}`}
          onClick={() => {
            setIsAdvancedSearchVisible(!isAdvancedSearchVisible);
            if (!isAdvancedSearchVisible) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          title={translate('search')}
        >
          🔍 {translate('search')}
        </button>
        <button className="toolbar-btn top250-btn" onClick={handleTop250} title="Top 250">
          Top 250
        </button>
      </div>

      <SearchMethod
        setOpt={setOptWithHistory}
        t={t}
        isFormVisible={isAdvancedSearchVisible}
        setIsFormVisible={setIsAdvancedSearchVisible}
        navigation={navigation}
      />
      <section className="ranges-container">
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
      </section>
      {false && <Loader />}
      {errorMessage && (
        <Message
          key={activeLanguage}
          msg={`${translate('errorPrefix')} ${errorMessage}`}
          bgColor="#dc3545"
          onDoubleClick={handleErrorDoubleClick}
        />
      )}
      {filteredDb && (
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
