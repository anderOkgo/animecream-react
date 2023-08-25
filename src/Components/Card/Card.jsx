import React, { useState } from 'react';
import CardRow from '../CardRow/CardRow';
import cyfer from '../../helpers/cyfer.js';
import './Card.css';

const Card = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this according to your preference.

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data ? data.slice(indexOfFirstItem, indexOfLastItem) : [];
  console.log(currentItems);

  return (
    <div className="main-content" id="main-content">
      {currentItems.length > 0 ? (
        currentItems.map((el) => <CardRow key={el.production_ranking_number} el={el} />)
      ) : (
        <div>No Data</div>
      )}

      <div className="pagination-container">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>

        {Array.from({ length: Math.ceil(data.length / itemsPerPage) }).map((_, index) => (
          <a
            href="#main-content"
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
          >
            {index + 1}
          </a>
        ))}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
          className="pagination-button"
        >
          Next
        </button>
      </div>
      <br />
    </div>
  );
};

export default Card;
