import React from 'react';
import CrudTableRow from './CrudTableRow';

const CrudTable = ({ data, setDataToEdit, deleteData }) => {
  //alert(data.data.length);
  return (
    <div>
      <h3>Resultados</h3>
      {data.data.length > 0 ? (
        data.data.map((el) => (
          <CrudTableRow key={el.id} el={el} setDataToEdit={setDataToEdit} deleteData={deleteData} />
        ))
      ) : (
        <div>Sin datos</div>
      )}
    </div>
  );
};

export default CrudTable;
