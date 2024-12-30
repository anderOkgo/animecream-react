import React, { createContext, useContext, useEffect, useState } from 'react';
import { getLanguage, setLanguage } from '../helpers/translations/languageUtils';
import { translations } from '../helpers/translations/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getLanguage());

  useEffect(() => {
    // If language is updated, refresh content
    setLanguage(language);
    document.documentElement.lang = lang;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  const t = (key) => translations[language][key] || key;

  return <LanguageContext.Provider value={{ language, toggleLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
