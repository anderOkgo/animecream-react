import { useState, useMemo, useRef, useEffect } from 'react';
import { generateSuggestions } from '../helpers/searchUtils';

/**
 * Custom hook for managing search suggestions
 *
 * @param {Array} dataset - Dataset to generate suggestions from
 * @param {string} searchTerm - Current search term
 * @param {number} minChars - Minimum characters before showing suggestions (default: 2)
 * @param {number} maxSuggestions - Maximum number of suggestions (default: 10)
 * @returns {Object} Search suggestions state and handlers
 */
export const useSearchSuggestions = (dataset, searchTerm, minChars = 2, maxSuggestions = 10) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Generate suggestions based on search term
  const suggestions = useMemo(() => {
    return generateSuggestions(dataset, searchTerm, maxSuggestions);
  }, [dataset, searchTerm, maxSuggestions]);

  // Show suggestions when search term is long enough
  const shouldShowSuggestions = searchTerm.trim().length >= minChars;

  // Handle keyboard navigation
  const handleKeyDown = (e, onSuggestionSelect) => {
    if (!showSuggestions || suggestions.length === 0) return false;

    let handled = false;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
      handled = true;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      handled = true;
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestions[selectedIndex]);
      }
      handled = true;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      setSelectedIndex(-1);
      handled = true;
    }

    return handled;
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion, onSelect) => {
    if (onSelect) {
      onSelect(suggestion);
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Update show state based on search term - automatically show when typing
  useEffect(() => {
    const hasEnoughChars = searchTerm.trim().length >= minChars;
    const hasSuggestions = suggestions.length > 0;

    if (hasEnoughChars && hasSuggestions) {
      // Automatically show suggestions when user types and there are suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, suggestions, minChars]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  return {
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
  };
};
