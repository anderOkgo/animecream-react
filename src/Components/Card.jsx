import React from 'react';
import CardRow from './CardRow';
import cyfer from '../helpers/cyfer.js';

const Card = ({ data }) => {
  //console.log(cyfer().dcy('PTE9Mj02PTU8-Dw3PTE8NA==', 'clave'));
  return (
    <div>
      <h3>{cyfer().cy('anderson', 'clave')}</h3>
      {data.length > 0 ? (
        data.map((el) => <CardRow key={el.production_ranking_number} el={el} />)
      ) : (
        <div>No Data</div>
      )}
    </div>
  );
};

export default Card;
