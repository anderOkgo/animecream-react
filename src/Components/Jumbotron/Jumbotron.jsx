import React from 'react';
import './Jumbotron.css';

const Jumbotron = ({ t }) => {
  return (
    <div className="jumbotron">
      <p className="jumbotron-description">{t('jumdescription')}</p>
    </div>
  );
};

export default Jumbotron;
