import React, { useEffect } from 'react';
import './Loader.css';

const Loader = ({ onClick }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClick) onClick();
    }, 1500);
    return () => clearTimeout(timer);
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
