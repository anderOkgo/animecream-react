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

    const trimmedTerm = newSearchTerm.trim().toLowerCase();

    if (!trimmedTerm) {
      setFilteredData(dataset);
      return;
    }

    let filteredResults = [];

    if (trimmedTerm.includes('+')) {
      // OR search
      const terms = trimmedTerm
        .split('+')
        .map((term) => term.trim())
        .filter((term) => term.length > 0);

      filteredResults = dataset.filter((item) => {
        const itemString = Object.values(item)
          .filter((val) => val !== null && val !== undefined)
          .map((val) => val.toString().toLowerCase())
          .join(' ');
        return terms.some((term) => itemString.includes(term));
      });
    } else {
      // AND search
      const terms = trimmedTerm
        .split(',')
        .map((term) => term.trim())
        .filter((term) => term.length > 0);

      filteredResults = dataset.filter((item) => {
        const itemString = Object.values(item)
          .filter((val) => val !== null && val !== undefined)
          .map((val) => val.toString().toLowerCase())
          .join(' ');
        return terms.every((term) => itemString.includes(term));
      });
    }

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
  t: PropTypes.func.isRequired,
};

export default TableSearch;
