import { useEffect, useState } from 'react';
import CardRow from '../CardRow/CardRow';
import './Card.css';
import TablePagination from './TablePagination';
import TableSearch from './TableSearch';

const Card = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const indexOfLastItem = currentPage * itemsPerPage;
  const [dataset, setDataset] = useState([]);
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [filteredData, setFilteredData] = useState([]);
  const currentItems = data.length !== undefined ? filteredData.slice(indexOfFirstItem, indexOfLastItem) : [];

  useEffect(() => {
    if (data && data.length > 0) {
      setFilteredData(data);
      setDataset(data);
    }
  }, [data]);

  return (
    <div className="main-content" id="main-content">
      <TableSearch
        setCurrentPage={setCurrentPage}
        setFilteredData={setFilteredData}
        setItemsPerPage={setItemsPerPage}
        dataset={dataset}
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
          filteredData={filteredData}
          itemsPerPage={itemsPerPage}
        />
      </div>
      <br />
    </div>
  );
};

export default Card;
