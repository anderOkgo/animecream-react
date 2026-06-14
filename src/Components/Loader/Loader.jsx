import React, { useEffect } from 'react';
import './Loader.css';

const Loader = ({ onClick }) => {
  useEffect(() => {
    if (onClick) onClick();
  }, [onClick]);

  return (
    <div className="loader-container">
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
