import React, { useEffect, useState } from 'react';
import helpHttp from '../../helpers/helpHttp';
import SearchMethod from '../SearchMethod/SearchMethod';
import Card from '../Card/Card';
import Loader from '../Loader/Loader';
import Message from '../Message/Message';
import AuthService from '../../services/auth.service';
import './Home.css';
import set from '../../helpers/set.json';

const Home = () => {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});

  useEffect(() => {
    try {
      var localResp = localStorage.getItem('storage');
      localResp && (localResp = JSON.parse(localResp));
      setDb((prevDB) => ({
        ...prevDB,
        ...localResp,
      }));
      console.log(localResp);
      if (Object.keys(localResp || {}).length !== 0) {
        setDb(localResp);
      }
    } catch (error) {
      console.log(error);
    }
    const fetchData = async () => {
      setLoading(true);
      let urlProduction = set.base_url + set.api_url;
      const [productionsInfo] = await Promise.all([helpHttp.post(urlProduction, opt)]);
      if (!productionsInfo?.err) {
        localStorage.setItem('storage', JSON.stringify(productionsInfo));
        setDb(productionsInfo?.err ? [] : productionsInfo);
      } else {
        const error = productionsInfo?.err?.response?.error;
        setError(error);
      }
      setLoading(false);
    };

    fetchData();
  }, [opt]);

  const currentUser = AuthService.getCurrentUser();
  return (
    <article className="grid-1-2">
      <SearchMethod setOpt={setOpt} />
      {loading && <Loader />}
      {error && <Message msg={`Error: ${Object.values(error)[0]}`} bgColor="#dc3545" />}
      {db && <Card data={db} />}
    </article>
  );
};

export default Home;
