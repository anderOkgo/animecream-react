import { useState } from 'react';
import PropTypes from 'prop-types';
import set from '../../helpers/set.json';
import './TableSearch.css';

function TableSearch({ setCurrentPage, setFilteredData, setItemsPerPage, dataset, itemsPerPage }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Search functionality
  const handleSearch = (newSearchTerm) => {
    setCurrentPage(1);
    setSearchTerm(newSearchTerm);
    // Filter data based on search term
    const filteredResults = dataset.filter((item) =>
      Object.values(item).some((value) => value.toString().toLowerCase().includes(newSearchTerm.toLowerCase()))
    );
    setFilteredData(filteredResults);
  };

  return (
    <div className="search-box">
      <label>
        Rows:{' '}
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
          className="search-box-input"
        >
          {[5, 10, 20, 50, 100, 500, 1000, 10000].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <input
        className="search-box-input"
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
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
