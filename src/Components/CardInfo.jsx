import React, { useEffect, useState } from 'react';
import helpHttp from '../helpers/helpHttp';
import SearchMethod from './SearchMethod';
import Card from './Card';
import Loader from './Loader/Loader';
import Message from './Message';
import AuthService from '../services/auth.service';
import Login from './Login/Login';

const CardInfo = () => {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [productions, setProductions] = useState();
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});

  let api = helpHttp;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let urlProduction = 'https://info.animecream.com:/api/productions';
      const [productionsInfo] = await Promise.all([helpHttp.post(urlProduction, opt)]);
      setProductions(productionsInfo);
      setDb(productionsInfo);
      setLoading(false);
    };

    fetchData();
  }, [opt]);

  const currentUser = AuthService.getCurrentUser();
  return (
    <div>
      <h2></h2>
      <article className="grid-1-2">
        <SearchMethod setOpt={setOpt} />
        {loading && <Loader />}
        {error && <Message msg={`Error ${error.status}: ${error.statusText}`} bgColor="#dc3545" />}
        {!currentUser ? <Login /> : db && <Card data={db} />}
      </article>
    </div>
  );
};

export default CardInfo;
