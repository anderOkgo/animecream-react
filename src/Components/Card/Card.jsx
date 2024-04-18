import { useEffect, useState } from 'react';
import CardRow from '../CardRow/CardRow';
import './Card.css';
import TablePagination from './TablePagination';
import TableSearch from './TableSearch';

const Card = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataset, setDataset] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (data && data.length > 0) {
      setFilteredData(data);
      setDataset(data);
    }
  }, [data]);

  return (
    <div className="main-content" id="main-content">
      <div className="search-container">
        <TableSearch {...{ setCurrentPage, setFilteredData, setItemsPerPage, dataset, itemsPerPage }} />
      </div>
      {currentData.length > 0 ? (
        currentData.map((el) => <CardRow key={el.production_ranking_number} el={el} />)
      ) : (
        <div>No Data</div>
      )}
      <div className="pagination-container">
        <TablePagination {...{ currentPage, setCurrentPage, filteredData, itemsPerPage }} />
      </div>
      <br />
    </div>
  );
};

export default Card;
