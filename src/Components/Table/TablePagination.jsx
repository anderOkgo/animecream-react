import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import set from '../../helpers/set.json';
import './TablePagination.css';

function TablePagination({ currentPage, setCurrentPage, filteredData, itemsPerPage, element = '', t }) {
  const [totalPages, setTotalPages] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [isRangeEnabled, setIsRangeEnabled] = useState(false);
  const lastTouchTimeRef = useRef(0);
  const touchTimeoutRef = useRef(null);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    const newStartIndex = (currentPage - 1) * itemsPerPage + 1;
    const newEndIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [filteredData, itemsPerPage, currentPage]);

  useEffect(() => {
    // Limpiar timeout al desmontar
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

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
            goToElement();
          }}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  const goToElement = () => {
    const gelement = document.getElementById(element);
    if (gelement) gelement.scrollIntoView();
    document.documentElement.scrollTo({ top: 0 });
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    goToElement();
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    goToElement();
  };

  const handleRangeChange = (e) => {
    setCurrentPage(parseInt(e.target.value));
  };

  const toggleRangeEnabled = () => {
    setIsRangeEnabled((prev) => {
      const newValue = !prev;
      console.log('Range enabled:', newValue); // Debug
      return newValue;
    });
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleRangeEnabled();
  };

  const handleTouchStart = (e) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastTouchTimeRef.current;

    // Detectar doble toque (menos de 400ms entre toques)
    if (timeDiff < 400 && timeDiff > 0) {
      e.preventDefault();
      e.stopPropagation();
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
      toggleRangeEnabled();
      lastTouchTimeRef.current = 0; // Reset para evitar toques múltiples
    } else {
      lastTouchTimeRef.current = currentTime;
      // Reset después de 500ms si no hay segundo toque
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      touchTimeoutRef.current = setTimeout(() => {
        lastTouchTimeRef.current = 0;
      }, 500);
    }
  };

  return (
    <>
      <div
        onDoubleClick={handleClick}
        onTouchStart={handleTouchStart}
        className={`pagination-range-wrapper ${!isRangeEnabled ? 'disabled' : ''}`}
        title={!isRangeEnabled ? 'Double click/tap to enable' : 'Double click/tap to disable'}
      >
        <input
          type="range"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={handleRangeChange}
          disabled={!isRangeEnabled}
          className="pagination-range"
          style={{ pointerEvents: !isRangeEnabled ? 'none' : 'auto' }}
        />
        {!isRangeEnabled && <span className="range-status-indicator"></span>}
        {isRangeEnabled && <span className="range-status-indicator enabled"></span>}
      </div>
      <small className="pagination-label">
        {t('showing')} {startIndex}-{endIndex} {t('of')} {filteredData.length} {t('records')}
      </small>
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">
          {t('prev')}
        </button>
        {renderPaginationButtons()}
        <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-button">
          {t('next')}
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
  element: PropTypes.string,
};

export default TablePagination;
