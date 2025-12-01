import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import set from '../../helpers/set.json';
import './TablePagination.css';

function TablePagination({ currentPage, setCurrentPage, filteredData, itemsPerPage, element = '', t }) {
  const [totalPages, setTotalPages] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [isRangeEnabled, setIsRangeEnabled] = useState(false);
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    const newStartIndex = (currentPage - 1) * itemsPerPage + 1;
    const newEndIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [filteredData, itemsPerPage, currentPage]);

  useEffect(() => {
    // No hay limpieza necesaria
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

  // Touch: guardar posición inicial
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    hasMovedRef.current = false;
  };

  // Touch: detectar si hay movimiento
  const handleTouchMove = () => {
    hasMovedRef.current = true;
  };

  // Touch: si no hubo movimiento, toggle enabled/disabled
  const handleTouchEnd = (e) => {
    if (!hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      toggleRangeEnabled();
    }
    hasMovedRef.current = false;
  };

  const handleTouchCancel = () => {
    hasMovedRef.current = false;
  };

  // Desktop: click simple
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      touchStartPosRef.current = { x: e.clientX, y: e.clientY };
      hasMovedRef.current = false;
    }
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      const deltaX = Math.abs(e.clientX - touchStartPosRef.current.x);
      const deltaY = Math.abs(e.clientY - touchStartPosRef.current.y);
      if (deltaX > 5 || deltaY > 5) {
        hasMovedRef.current = true;
      }
    }
  };

  const handleMouseUp = (e) => {
    if (e.button === 0 && !hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      toggleRangeEnabled();
    }
    hasMovedRef.current = false;
  };

  return (
    <>
      <div
        onDoubleClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`pagination-range-wrapper ${!isRangeEnabled ? 'disabled' : ''}`}
        title={!isRangeEnabled ? 'Tap or click to enable' : 'Tap or click to disable'}
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
