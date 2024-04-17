import React, { useState } from 'react';
import CardRow from '../CardRow/CardRow';
import './Card.css';
import TablePagination from './TablePagination';
import TableSearch from './TableSearch';

const Card = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.length !== undefined ? data.slice(indexOfFirstItem, indexOfLastItem) : [];
  const [filteredData, setFilteredData] = useState([]);

  return (
    <div className="main-content" id="main-content">
      <TableSearch
        setCurrentPage={setCurrentPage}
        setFilteredData={setFilteredData}
        setItemsPerPage={setItemsPerPage}
        dataset={data}
        itemsPerPage={itemsPerPage}
      />
      {currentItems.length > 0 ? (
        currentItems.map((el) => <CardRow key={el.production_ranking_number} el={el} />)
      ) : (
        <div>No Data</div>
      )}
      <div className="pagination-container">
        <TablePagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          filteredData={data}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

export default Card;
