import React from 'react';
import CrudTableRow from './CrudTableRow';
import ReactPaginate from 'react-paginate';

const CrudTable = ({ data, setDataToEdit, deleteData }) => {
  return (
    <div>
      <h3>Resultados</h3>
      {data.data.length > 0 ? (
        data.data.map((el) => (
          <CrudTableRow
            key={el.production_ranking_number}
            el={el}
            setDataToEdit={setDataToEdit}
            deleteData={deleteData}
          />
        ))
      ) : (
        <div>Sin datos</div>
      )}
    </div>
  );
};

export default CrudTable;
