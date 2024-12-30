import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import set from '../../helpers/set.json';
import './TablePagination.css';

function TablePagination({ currentPage, setCurrentPage, filteredData, itemsPerPage, element = '' }) {
  const { t } = useLanguage();

  const [totalPages, setTotalPages] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
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
