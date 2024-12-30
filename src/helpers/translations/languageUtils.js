export const getLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return localStorage.getItem('lang') || (browserLang === 'es' ? 'es' : 'en');
};

export const setLanguageLocal = (lang) => {
  localStorage.setItem('lang', lang);
};
