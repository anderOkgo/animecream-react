import React from 'react';
import './Jumbotron.css'; // You can create a separate CSS file for styling

const Jumbotron = ({ title, description }) => {
  return (
    <div className="jumbotron">
      <h1 className="jumbotron-title">{title}</h1>
      <p className="jumbotron-description">{description}</p>
    </div>
  );
};

export default Jumbotron;
