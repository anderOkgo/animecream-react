import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import helpHttp from '../helpers/helpHttp';

const YearAside = () => {
  const [years, setYears] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      let urlProductionyears = 'https://info.animecream.com:/api/productions/years';
      const [artistRes] = await Promise.all([helpHttp.get(urlProductionyears)]);
      console.log(artistRes[0]);
      setYears(artistRes[0]);
    };

    fetchData();
  }, []);

  return (
    <div>
      {years &&
        years.years.split(',').map((genre) => (
          <Button key={genre} variant="text" size="small">
            {genre}
          </Button>
        ))}
    </div>
  );
};

export default YearAside;
