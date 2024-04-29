import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import './TablePagination.css';
import set from '../../helpers/set.json';

function TablePagination({ currentPage, setCurrentPage, filteredData, itemsPerPage }) {
  const [totalPages, setTotalPages] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  useEffect(() => {
    // Calculate total pages whenever filtered data changes
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    // Calculate startIndex and endIndex whenever currentPage or itemsPerPage changes
    const newStartIndex = (currentPage - 1) * itemsPerPage + 1;
    const newEndIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [filteredData, itemsPerPage, currentPage]);

  const renderPaginationButtons = () => {
    const maxButtons = set.pagination_max_buttons;
    const buttons = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => {
            setCurrentPage(i);
            goTop();
          }}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  const goTop = () => {
    window.scrollTo({
      top: 900,
      behavior: 'smooth',
    });
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    goTop();
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    goTop();
  };

  const handleRangeChange = (e) => {
    setCurrentPage(parseInt(e.target.value));
  };

  return (
    <>
      <input
        type="range"
        min="1"
        max={totalPages}
        value={currentPage}
        onChange={handleRangeChange}
        className="pagination-range"
      />
      <small className="pagination-label">
        Showing {startIndex}-{endIndex} of {filteredData.length} records
      </small>
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">
          Prev
        </button>
        {renderPaginationButtons()}
        <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-button">
          Next
        </button>
      </div>
    </>
  );
}

TablePagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  filteredData: PropTypes.any.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
};

export default TablePagination;
