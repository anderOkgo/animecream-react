import React from 'react';
import './Loader.css';

const Loader = ({ onClick }) => {
  return (
    <div className="loader-container" onClick={onClick}>
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default Loader;
