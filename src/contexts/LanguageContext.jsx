import React, { createContext, useContext, useEffect, useState } from 'react';
import { getLanguage, setLanguageLocal } from '../helpers/translations/languageUtils';
import { translations } from '../helpers/translations/';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getLanguage());

  useEffect(() => {
    setLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  const t = (key) => translations[language][key] || key;

  return <LanguageContext.Provider value={{ language, toggleLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
