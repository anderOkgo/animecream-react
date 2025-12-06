import { useEffect, useState, useMemo } from 'react';
import CardRow from '../CardRow/CardRow';
import './Card.css';
import TablePagination from '../Table/TablePagination';
import TableSearch from '../Table/TableSearch';

const Card = ({
  data,
  t,
  language,
  showRealNumbers = false,
  onFilterChange,
  sortOrder = null,
  role,
  onEditSeries,
  onAddToList,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataset, setDataset] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const element = 'main-content';

  // Calculate start number for real numbering
  const startNumber = showRealNumbers ? (currentPage - 1) * itemsPerPage + 1 : null;

  // Sort filtered data based on sortOrder (only if sortOrder is not null)
  const sortedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return filteredData;
    // Si sortOrder es null, mantener el orden original (orden de la API)
    if (sortOrder === null) {
      return filteredData;
    }
    // Solo ordenar si el usuario activó el botón de ordenar
    const sorted = [...filteredData].sort((a, b) => {
      const aRank = a.production_ranking_number ?? 0;
      const bRank = b.production_ranking_number ?? 0;
      return sortOrder === 'asc' ? aRank - bRank : bRank - aRank;
    });
    return sorted;
  }, [filteredData, sortOrder]);

  const currentData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          {/* <div className="pagination-container">
            <TablePagination {...{ currentPage, setCurrentPage, filteredData, itemsPerPage, element, t }} />
          </div> */}

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
                role={role}
                onEdit={onEditSeries}
                onAddToList={onAddToList}
              />
            );
          })}
          <div className="pagination-container">
            <TablePagination {...{ currentPage, setCurrentPage, filteredData, itemsPerPage, element, t }} />
            <br />
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>No Data Found</div>
      )}
    </div>
  );
};

export default Card;
