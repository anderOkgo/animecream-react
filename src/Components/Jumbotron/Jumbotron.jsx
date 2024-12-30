import React from 'react';
import './Jumbotron.css';

const Jumbotron = ({ t }) => {
  return (
    <div className="jumbotron">
      <h1 className="jumbotron-title">{t('welcome')}</h1>
      <p className="jumbotron-description">{t('jumdescription')}</p>
    </div>
  );
};

export default Jumbotron;
