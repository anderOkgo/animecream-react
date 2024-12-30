import React from 'react';
import './Jumbotron.css';
import { useLanguage } from '../../contexts/LanguageContext';

const Jumbotron = () => {
  const { t } = useLanguage();

  return (
    <div className="jumbotron">
      <h1 className="jumbotron-title">{t('welcome')}</h1>
      <p className="jumbotron-description">{t('jumdescription')}</p>
    </div>
  );
};

export default Jumbotron;
