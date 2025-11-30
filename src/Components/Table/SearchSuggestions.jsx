import PropTypes from 'prop-types';
import './TableSearch.css';

/**
 * Component for displaying search suggestions dropdown
 */
function SearchSuggestions({ suggestions, selectedIndex, onSuggestionClick, onSuggestionHover, suggestionsRef }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="search-suggestions" ref={suggestionsRef}>
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSuggestionClick(suggestion)}
          onMouseEnter={() => onSuggestionHover(index)}
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
}

SearchSuggestions.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedIndex: PropTypes.number.isRequired,
  onSuggestionClick: PropTypes.func.isRequired,
  onSuggestionHover: PropTypes.func.isRequired,
  suggestionsRef: PropTypes.object,
};

export default SearchSuggestions;
