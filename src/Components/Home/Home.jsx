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
    const fetchData = async () => {
      setLoading(true);
      let urlProduction = set.base_url + set.api_url;
      const [productionsInfo] = await Promise.all([helpHttp.post(urlProduction, opt)]);
      const error = productionsInfo?.err?.response.error;
      setError(error);
      setDb(productionsInfo?.err ? [] : productionsInfo);
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
