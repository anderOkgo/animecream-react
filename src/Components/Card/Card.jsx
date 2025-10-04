import { useEffect, useState } from 'react';
import CardRow from '../CardRow/CardRow';
import './Card.css';
import TablePagination from '../Table/TablePagination';
import TableSearch from '../Table/TableSearch';

const Card = ({ data, t, language }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataset, setDataset] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const element = 'main-content';

  useEffect(() => {
    if (data) {
      setCurrentPage(1);
      setFilteredData(data);
      setDataset(data);
    }
  }, [data]);

  return (
    <div className="main-content" id="main-content">
      <div className="search-container">
        <TableSearch {...{ setCurrentPage, setFilteredData, setItemsPerPage, dataset, itemsPerPage, t }} />
      </div>
      {currentData.length > 0 ? (
        <>
          <br />
          {currentData.map((el) => (
            <CardRow key={el.production_ranking_number} el={el} t={t} language={language} />
          ))}
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
