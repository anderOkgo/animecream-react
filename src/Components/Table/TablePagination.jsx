import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import set from '../../helpers/set.json';
import './TablePagination.css';

function TablePagination({
  currentPage,
  setCurrentPage,
  filteredData,
  itemsPerPage,
  element = '',
  t,
  navigation,
}) {
  const [totalPages, setTotalPages] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [isRangeEnabled, setIsRangeEnabled] = useState(true);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    const newStartIndex = (currentPage - 1) * itemsPerPage + 1;
    const newEndIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [filteredData, itemsPerPage, currentPage]);

  const isFirstRender = useRef(true);

  // Manejar el historial de navegación
  useEffect(() => {
    if (!navigation) return;

    // No registrar en el historial en el primer render si es la página inicial (1)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Si ya estamos en una página distinta de 1 al montar (por ej. restaurando estado), 
      // podemos registrarla o simplemente dejar que el hook de restauración lo maneje.
      if (currentPage === 1) return;
    }

    // Cuando cambia currentPage externamente, registrar en historial
    if (!isInternalChangeRef.current) {
      navigation.pushHistory('pagination', { page: currentPage, id: element });
    }
    isInternalChangeRef.current = false;
  }, [currentPage, navigation.pushHistory, element]);

  useEffect(() => {
    if (!navigation) return;

    const state = navigation.currentState;
    if (state?.type === 'pagination' && state.data?.id === element) {
      if (state.data.page !== currentPage) {
        const maxPage = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
        if (state.data.page >= 1 && state.data.page <= maxPage) {
          isInternalChangeRef.current = true;
          setCurrentPage(state.data.page);
        }
      }
    } else if (state?.type === 'initial' && currentPage !== 1) {
      // Si volvemos al estado inicial, resetear a página 1
      isInternalChangeRef.current = true;
      setCurrentPage(1);
    }
  }, [navigation.currentState, element, currentPage, setCurrentPage, filteredData, itemsPerPage]);

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
    if (!element || element === 'main-content') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const lastTapRef = useRef(0);

  const handleDoubleClick = (e) => {
    e.preventDefault();
    setIsRangeEnabled((prev) => !prev);
  };

  const handleTouchEnd = (e) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.preventDefault();
      setIsRangeEnabled((prev) => !prev);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <>
      <div className="pagination-range-row">
        <button
          onClick={() => { setCurrentPage(1); goToElement(); }}
          disabled={currentPage === 1}
          className="pagination-button pagination-edge"
          title={t('first')}
        >
          «
        </button>
        <div
          onDoubleClick={handleDoubleClick}
          onTouchEnd={handleTouchEnd}
          className={`pagination-range-wrapper ${!isRangeEnabled ? 'disabled' : ''}`}
          title={!isRangeEnabled ? 'Double click to enable' : 'Double click to disable'}
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
        </div>
        <button
          onClick={() => { setCurrentPage(totalPages); goToElement(); }}
          disabled={currentPage === totalPages}
          className="pagination-button pagination-edge"
          title={t('last')}
        >
          »
        </button>
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
