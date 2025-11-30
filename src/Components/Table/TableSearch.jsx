import { useState } from 'react';
import PropTypes from 'prop-types';
import set from '../../helpers/set.json';
import { generateUniqueId } from '../../helpers/operations';
import { filterDataset } from '../../helpers/searchUtils';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
import SearchSuggestions from './SearchSuggestions';
import './TableSearch.css';

function TableSearch({ setCurrentPage, setFilteredData, setItemsPerPage, dataset, itemsPerPage, t }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Use custom hook for suggestions
  const {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectedIndex,
    setSelectedIndex,
    suggestionsRef,
    inputRef,
    handleKeyDown,
    selectSuggestion,
    shouldShowSuggestions,
  } = useSearchSuggestions(dataset, searchTerm);

  // Perform search and update filtered data
  const performSearch = (searchValue) => {
    setCurrentPage(1);
    const filteredResults = filterDataset(dataset, searchValue);
    setFilteredData(filteredResults);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    performSearch(value);
    // The hook's useEffect will automatically handle showing/hiding suggestions
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion);
    performSearch(suggestion);
  };

  // Handle keyboard navigation for suggestions
  const handleInputKeyDown = (e) => {
    const handled = handleKeyDown(e, (suggestion) => {
      selectSuggestion(suggestion, handleSuggestionSelect);
    });

    // If not handled by suggestions, allow default behavior
    if (!handled) {
      // You can add additional keyboard handling here if needed
    }
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
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          id={uniqueId + '1'}
          className="search-box-input"
          type="search"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (shouldShowSuggestions && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={t('search')}
        />
        {showSuggestions && (
          <SearchSuggestions
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            onSuggestionClick={(suggestion) => selectSuggestion(suggestion, handleSuggestionSelect)}
            onSuggestionHover={setSelectedIndex}
            suggestionsRef={suggestionsRef}
          />
        )}
      </div>
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
