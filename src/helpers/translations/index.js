import en from './en';
import es from './es';

const translations = { en, es };

export const getTranslation = (key, lang = 'en') => {
  return translations[lang]?.[key] || key;
};
