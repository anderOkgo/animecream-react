import React, { useEffect, useState } from 'react';
import { helpHttp } from '../helpers/helpHttp';
import CrudForm from './CrudForm';
import CrudTable from './CrudTable';
import Loader from './Loader';
import Message from './Message';

const CrudApi = () => {
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [productions, setProductions] = useState();
  const [years, setYears] = useState();
  const [loading, setLoading] = useState(false);
  const [opt, setOpt] = useState({});

  let api = helpHttp();

  /* opt = {
    method: 'POST',
    body: {
      production_name: 'gpx',
      production_number_chapters: '1,100',
      production_description: '',
      production_year: '1990,1999',
      demographic_name: '',
      genre_names: '',
      limit: 20,
    },
  }; */
  useEffect(() => {
    const fetchData = async () => {
      let urlProduction = 'https://info.animecream.com:/api/productions';
      let urlProductionyears = 'https://info.animecream.com:/api/productions/years';

      //console.log(artistUrl, songUrl);

      //setLoading(true);
      console.log(opt);

      const [artistRes] = await Promise.all([
        helpHttp().post(urlProduction, opt),
        //helpHttp().get(urlProductionyears),
      ]);

      //console.log(artistRes, songRes);

      setProductions(artistRes);
      setDb(artistRes);
      //setYears(songRes);
      //setLoading(false);
    };

    fetchData();
  }, [opt]);

  return (
    <div>
      <h2></h2>
      <article className="grid-1-2">
        <CrudForm setOpt={setOpt} />
        {loading && <Loader />}
        {error && <Message msg={`Error ${error.status}: ${error.statusText}`} bgColor="#dc3545" />}
        {db && <CrudTable data={db} years={years} />}
      </article>
    </div>
  );
};

export default CrudApi;
