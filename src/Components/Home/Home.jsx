import React, { useEffect, useState } from 'react';
import helpHttp from '../../helpers/helpHttp';
import SearchMethod from '../SearchMethod/SearchMethod';
import Card from '../Card/Card';
import Loader from '../Loader/Loader';
import Message from '../Message/Message';
import './Home.css';
import set from '../../helpers/set.json';

const Home = ({ t, toggleLanguage, language, setProc }) => {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});
  const [showRealNumbers, setShowRealNumbers] = useState(false);

  useEffect(() => {
    try {
      var localResp = localStorage.getItem('storage');
      localResp && (localResp = JSON.parse(localResp));
      setDb(localResp);
      if (Object.keys(localResp || {}).length !== 0) {
        setDb(localResp);
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
        setError(false);
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
      }
      setLoading(false);
      setProc(false);
    };

    fetchData();
  }, [opt]);

  return (
    <article className="grid-1-2">
      <div className="lang-container">
        <span className="lang" onClick={toggleLanguage}>
          {language === 'en' ? t('switchToSpanish') : t('switchToEnglish')}
        </span>
        <span className="lang lang-numbers" onClick={() => setShowRealNumbers(!showRealNumbers)}>
          {showRealNumbers ? t('Order') : t('Order')}
        </span>
      </div>
      <SearchMethod setOpt={setOpt} t={t} />
      {false && <Loader />}
      {error && <Message msg={`Error: ${error}`} bgColor="#dc3545" />}
      {db && (
        <Card data={db} t={t} language={language} showRealNumbers={showRealNumbers} onFilterChange={setOpt} />
      )}
    </article>
  );
};

export default Home;
