import React, { useEffect, useState } from 'react';
import helpHttp from '../../helpers/helpHttp';
import SearchMethod from '../SearchMethod/SearchMethod';
import Card from '../Card/Card';
import Loader from '../Loader/Loader';
import Message from '../Message/Message';
import AuthService from '../../services/auth.service';
import './CardInfo.css';
const CardInfo = () => {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});

  let api = helpHttp;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let urlProduction = 'https://info.animecream.com/api/series';
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
        <div className="search-method">
          <SearchMethod setOpt={setOpt} />
        </div>
        {loading && <Loader />}
        {error && <Message msg={`Error ${error.status}: ${error.statusText}`} bgColor="#dc3545" />}
        {db && (
          <div className="card">
            <Card data={db} />
          </div>
        )}
      </article>
    </div>
  );
};

export default CardInfo;
