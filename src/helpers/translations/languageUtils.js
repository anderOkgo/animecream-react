// Get the currently selected language (default to 'en' if not set)
export const getLanguage = () => {
  const browserLang = navigator.language.split('-')[0]; // e.g., "en-US" -> "en"
  return localStorage.getItem('lang') || (browserLang === 'es' ? 'es' : 'en');
};

// Set the selected language and optionally reload the page to apply changes
export const setLanguage = (lang) => {
  localStorage.setItem('lang', lang);
  window.location.reload(); // Reload to re-render the app in the new language
};
