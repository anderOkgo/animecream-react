import { useState } from 'react';
import PropTypes from 'prop-types';
import set from '../../helpers/set.json';
import './TableSearch.css';
import { generateUniqueId } from '../../helpers/operations';

function TableSearch({ setCurrentPage, setFilteredData, setItemsPerPage, dataset, itemsPerPage, t }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (newSearchTerm) => {
    setCurrentPage(1);
    setSearchTerm(newSearchTerm);

    const filteredResults = dataset.filter((item) =>
      Object.values(item).some((value) => value.toString().toLowerCase().includes(newSearchTerm.toLowerCase()))
    );
    setFilteredData(filteredResults);
  };

  const uniqueId = generateUniqueId();

  return (
    <div className="search-box">
      <label htmlFor={uniqueId}>
        {t('rows')}:{' '}
        <select
          id={uniqueId}
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          className="search-box-input"
        >
          {set.table_select_row_numbers.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <input
        id={uniqueId + '1'}
        className="search-box-input"
        type="search"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={t('search')}
      />
    </div>
  );
}

TableSearch.propTypes = {
  setCurrentPage: PropTypes.func.isRequired,
  setFilteredData: PropTypes.func.isRequired,
  setItemsPerPage: PropTypes.func.isRequired,
  dataset: PropTypes.array.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
};

export default TableSearch;
