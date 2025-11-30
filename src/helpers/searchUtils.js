/**
 * Utility functions for search functionality
 */

/**
 * Filters dataset based on search term
 * Supports:
 * - AND search: comma-separated terms (e.g., "action,drama")
 * - OR search: plus-separated terms (e.g., "action+drama")
 *
 * @param {Array} dataset - Array of items to search through
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered results
 */
export const filterDataset = (dataset, searchTerm) => {
  const trimmedTerm = searchTerm.trim().toLowerCase();

  if (!trimmedTerm) {
    return dataset;
  }

  if (trimmedTerm.includes('+')) {
    // OR search
    const terms = trimmedTerm
      .split('+')
      .map((term) => term.trim())
      .filter((term) => term.length > 0);

    return dataset.filter((item) => {
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

    return dataset.filter((item) => {
      const itemString = Object.values(item)
        .filter((val) => val !== null && val !== undefined)
        .map((val) => val.toString().toLowerCase())
        .join(' ');
      return terms.every((term) => itemString.includes(term));
    });
  }
};

/**
 * Generates search suggestions from dataset
 *
 * @param {Array} dataset - Array of items to extract suggestions from
 * @param {string} searchTerm - Current search term
 * @param {number} maxSuggestions - Maximum number of suggestions to return (default: 10)
 * @returns {Array<string>} Array of unique suggestions
 */
export const generateSuggestions = (dataset, searchTerm, maxSuggestions = 10) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  const trimmedTerm = searchTerm.trim().toLowerCase();
  const suggestionsSet = new Set();

  dataset.forEach((item) => {
    // Production names
    if (item.production_name && item.production_name.toLowerCase().includes(trimmedTerm)) {
      suggestionsSet.add(item.production_name);
    }

    // Genres
    if (item.genre_names) {
      item.genre_names.split(',').forEach((genre) => {
        const genreTrimmed = genre.trim();
        if (genreTrimmed.toLowerCase().includes(trimmedTerm)) {
          suggestionsSet.add(genreTrimmed);
        }
      });
    }

    // Demographics
    if (item.demographic_name && item.demographic_name.toLowerCase().includes(trimmedTerm)) {
      suggestionsSet.add(item.demographic_name);
    }

    // Years
    if (item.production_year && item.production_year.toString().includes(trimmedTerm)) {
      suggestionsSet.add(item.production_year.toString());
    }
  });

  return Array.from(suggestionsSet).slice(0, maxSuggestions);
};
