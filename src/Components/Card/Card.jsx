import React, { useState } from 'react';
import CardRow from '../CardRow/CardRow';
import cyfer from '../../helpers/cyfer.js';

const Card = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this according to your preference.

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div>
      {data.length > 0 ? (
        currentItems.map((el) => <CardRow key={el.production_ranking_number} el={el} />)
      ) : (
        <div>No Data</div>
      )}

      {/* Previous button */}
      <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>

      {/* Page numbers */}
      {Array.from({ length: Math.ceil(data.length / itemsPerPage) }).map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentPage(index + 1)}
          className={currentPage === index + 1 ? 'active' : ''}
        >
          {index + 1}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
      >
        Next
      </button>
    </div>
  );
};

export default Card;
