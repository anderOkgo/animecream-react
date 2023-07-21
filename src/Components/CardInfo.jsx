import React, { useEffect, useState } from 'react';
import { helpHttp } from '../helpers/helpHttp';
import SearchMethod from './SearchMethod';
import Card from './Card';
import Loader from './Loader/Loader';
import Message from './Message';

const CardInfo = () => {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [productions, setProductions] = useState();
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});

  let api = helpHttp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let urlProduction = 'https://info.animecream.com:/api/productions';
      const [productionsInfo] = await Promise.all([helpHttp().post(urlProduction, opt)]);
      setProductions(productionsInfo);
      setDb(productionsInfo);
      setLoading(false);
    };

    fetchData();
  }, [opt]);

  return (
    <div>
      <h2></h2>
      <article className="grid-1-2">
        <SearchMethod setOpt={setOpt} />
        {loading && <Loader />}
        {error && <Message msg={`Error ${error.status}: ${error.statusText}`} bgColor="#dc3545" />}
        {db && <Card data={db} />}
      </article>
    </div>
  );
};

export default CardInfo;
