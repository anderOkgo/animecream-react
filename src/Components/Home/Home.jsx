import React, { useEffect, useState } from 'react';
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
}) => {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});

  useEffect(() => {
    // Resetear orden a default cuando cambia la consulta
    if (setSortOrder) {
      setSortOrder(null);
    }
  }, [opt, setSortOrder]);

  useEffect(() => {
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
      let urlProduction = set.base_url + set.api_url;
      const [productionsInfo] = await Promise.all([helpHttp.post(urlProduction, opt)]);
      if (!productionsInfo?.err) {
        localStorage.setItem('storage', JSON.stringify(productionsInfo));
        setDb(productionsInfo?.err ? [] : productionsInfo);
        setError(null);
      } else {
        let error = '';
        if (typeof productionsInfo?.err?.message === 'object') {
          error = Object.values(productionsInfo.err.message)
            .map((err) => t(err))
            .join(', ');
        } else {
          error = t(productionsInfo?.err?.message || 'Error');
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
        setOpt={setOpt}
        t={t}
        isFormVisible={isAdvancedSearchVisible}
        setIsFormVisible={setIsAdvancedSearchVisible}
      />
      {false && <Loader />}
      {error && <Message msg={`Error: ${error}`} bgColor="#dc3545" onDoubleClick={handleErrorDoubleClick} />}
      {db && (
        <Card
          data={db}
          t={t}
          language={language}
          showRealNumbers={showRealNumbers}
          onFilterChange={setOpt}
          sortOrder={sortOrder}
          role={role}
          onEditSeries={onEditSeries}
        />
      )}
    </article>
  );
};

export default Home;
