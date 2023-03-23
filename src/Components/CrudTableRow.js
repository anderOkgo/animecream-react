import React from 'react';

const CrudTableRow = ({ el, setDataToEdit, deleteData }) => {
  let { production_name, production_year, production_ranking_number } = el;
  //alert('again');

  return (
    <tr>
      <td>{production_name}</td>
      <td>{production_year}</td>
      <td>
        <button onClick={() => setDataToEdit(el)}>Editar</button>
        <button onClick={() => deleteData(production_ranking_number)}>Eliminar</button>
      </td>
    </tr>
  );
};

export default CrudTableRow;
