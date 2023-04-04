import React from 'react';
import CardRow from './CardRow';

const Card = ({ data }) => {
  return (
    <div>
      <h3>Results</h3>
      {data.data.length > 0 ? (
        data.data.map((el) => <CardRow key={el.production_ranking_number} el={el} />)
      ) : (
        <div>No Data</div>
      )}
    </div>
  );
};

export default Card;
