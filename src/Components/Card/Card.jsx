import React from 'react';
import CardRow from '../CardRow/CardRow';
import cyfer from '../../helpers/cyfer.js';

const Card = ({ data }) => {
  return (
    <div>
      {data.length > 0 ? (
        data.map((el) => <CardRow key={el.production_ranking_number} el={el} />)
      ) : (
        <div>No Data</div>
      )}
    </div>
  );
};

export default Card;
