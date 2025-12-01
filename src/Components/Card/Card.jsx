import { useEffect, useState } from 'react';
import CardRow from '../CardRow/CardRow';
import './Card.css';
import TablePagination from '../Table/TablePagination';
import TableSearch from '../Table/TableSearch';

const Card = ({ data, t, language, showRealNumbers = false, onFilterChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataset, setDataset] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const element = 'main-content';

  // Calculate start number for real numbering
  const startNumber = showRealNumbers ? (currentPage - 1) * itemsPerPage + 1 : null;

  useEffect(() => {
    if (data) {
      setCurrentPage(1);
      setFilteredData(data);
      setDataset(data);
    }
  }, [data]);

  // Handle card deletion
  const handleDeleteCard = (rankingNumber) => {
    setFilteredData((prev) => {
      const newData = prev.filter((item) => item.production_ranking_number !== rankingNumber);
      // If current page becomes empty after deletion, go to previous page
      const itemsOnCurrentPage = newData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
      if (itemsOnCurrentPage.length === 0 && currentPage > 1) {
        setCurrentPage((prevPage) => Math.max(1, prevPage - 1));
      }
      return newData;
    });
    setDataset((prev) => prev.filter((item) => item.production_ranking_number !== rankingNumber));
  };

  return (
    <div className="main-content" id="main-content">
      <div className="search-container">
        <TableSearch {...{ setCurrentPage, setFilteredData, setItemsPerPage, dataset, itemsPerPage, t }} />
      </div>
      {currentData.length > 0 ? (
        <>
          <br />
          <div className="pagination-container">
            <TablePagination {...{ currentPage, setCurrentPage, filteredData, itemsPerPage, element, t }} />
          </div>
          <span> &nbsp; </span>
          {currentData.map((el, index) => {
            const realNumber = showRealNumbers ? startNumber + index : null;
            return (
              <CardRow
                key={el.production_ranking_number}
                el={el}
                t={t}
                language={language}
                realNumber={realNumber}
                onFilterChange={onFilterChange}
                onDelete={() => handleDeleteCard(el.production_ranking_number)}
              />
            );
          })}
          <div className="pagination-container">
            <TablePagination {...{ currentPage, setCurrentPage, filteredData, itemsPerPage, element, t }} />
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>No Data Found</div>
      )}
    </div>
  );
};

export default Card;
