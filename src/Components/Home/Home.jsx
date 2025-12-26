import React, { useEffect, useState, useRef } from 'react';
import helpHttp from '../../helpers/helpHttp';
import SearchMethod from '../SearchMethod/SearchMethod';
import Card from '../Card/Card';
import Loader from '../Loader/Loader';
import Message from '../Message/Message';
import './Home.css';
import set from '../../helpers/set.json';

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
}) => {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});
  const isRestoringRef = useRef(false);

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

  // Restaurar peticiones cuando se navega hacia atrás
  useEffect(() => {
    if (!navigation) return;

    const currentState = navigation.currentState;
    if (currentState && currentState.type === 'request' && currentState.data?.data) {
      // Restaurar la petición anterior sin agregar al historial
      isRestoringRef.current = true;
      setOpt(currentState.data.data);
      // Resetear el flag después de un breve delay
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 50);
    }
  }, [navigation?.currentState, navigation?.currentIndex]);
  const [loadByIds, setLoadByIds] = useState(externalLoadByIds);
  const isLoadingByIdsRef = useRef(false);
  const hasInitialLoad = useRef(false);
  const lastOptRef = useRef({}); // Guardar el último opt usado para recargar

  // Sincronizar db con onSeriesDataChange siempre que cambie
  useEffect(() => {
    if (db && Array.isArray(db) && db.length > 0 && onSeriesDataChange) {
      onSeriesDataChange(db);
    }
  }, [db, onSeriesDataChange]);

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
          setError(null);
          // Notificar cambios en los datos de series
          if (onSeriesDataChange) {
            onSeriesDataChange(filtered);
          }
        } else {
          let error = '';
          if (typeof productionsInfo?.err?.message === 'object') {
            error = Object.values(productionsInfo.err.message)
              .map((err) => t(err))
              .join(', ');
          } else {
            error = t(productionsInfo?.err?.message || 'errorGeneric');
          }
          setError(error);
        }
      } catch (error) {
        console.error('Error loading by IDs:', error);
        setError(t('errorLoadingSeriesByIds'));
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
      var localResp = localStorage.getItem('storage');
      if (localResp) {
        localResp = JSON.parse(localResp);
        if (localResp && (Array.isArray(localResp) ? localResp.length > 0 : Object.keys(localResp).length > 0)) {
          // Mostrar datos del localStorage temporalmente
          setDb(localResp);
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
          setDb(data);
          setError(null);
          // Notificar cambios en los datos de series
          if (onSeriesDataChange) {
            onSeriesDataChange(data);
          }
        } else {
          setError(t(productionsInfo?.err?.message || 'errorGeneric'));
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError(t('errorLoadingData'));
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
        setError(null);
        // Notificar cambios en los datos de series
        if (onSeriesDataChange) {
          onSeriesDataChange(data);
        }
      } else {
        let error = '';
        if (typeof productionsInfo?.err?.message === 'object') {
          error = Object.values(productionsInfo.err.message)
            .map((err) => t(err))
            .join(', ');
        } else {
          error = t(productionsInfo?.err?.message || 'errorGeneric');
        }
        setError(error);
        // No limpiar db si hay error, mantener los datos anteriores
      }
      setLoading(false);
      setProc(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opt, refreshTrigger]);

  const handleErrorDoubleClick = () => {
    setError(null);
  };

  return (
    <article className="grid-1-2">
      <SearchMethod
        setOpt={setOptWithHistory}
        t={t}
        isFormVisible={isAdvancedSearchVisible}
        setIsFormVisible={setIsAdvancedSearchVisible}
        navigation={navigation}
      />
      {false && <Loader />}
      {error && <Message msg={`${t('errorPrefix')} ${error}`} bgColor="#dc3545" onDoubleClick={handleErrorDoubleClick} />}
      {db && (
        <Card
          data={db}
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
