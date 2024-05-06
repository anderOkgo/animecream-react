import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Table.css';
import './TablePagination.css';
import TablePagination from './TablePagination';
import set from '../../helpers/set.json';
import TableSearch from './TableSearch';

function Table({
  data = [],
  columns = [],
  orderColumnsList = false,
  hiddenColumns = [],
  onRowDoubleClick = false,
  label = 'No label',
}) {
  const [dataset, setDataset] = useState([]);
  const [header, setHeader] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(set.pagination_default_items_per_page);
  const [sortOrder, setSortOrder] = useState({ columnIndex: null, descending: false });
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper function useEffect to reorder data to print the table based on orderColumnsList array
  const reorderTableHeader = (data, orderColumnsList) => {
    return data.map((item) => {
      const reorderedItem = {};
      orderColumnsList.forEach((prop) => (reorderedItem[prop] = item[prop]));
      return reorderedItem;
    });
  };

  // reorder columns based on orderColumnsList array
  useEffect(() => {
    if (data && data.length > 0) {
      const initialData = orderColumnsList?.length ?? 0 > 0 ? reorderTableHeader(data, orderColumnsList) : data;
      setDataset(initialData);
      setFilteredData(initialData);
      setHeader(Object.keys(initialData[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Function to handle header click for sorting
  const handleHeaderClick = (columnIndex) => {
    const descending = sortOrder.columnIndex === columnIndex ? !sortOrder.descending : false;
    setSortOrder({ columnIndex, descending });
    const reorderedData = filteredData.slice().sort((a, b) => {
      const valueA = Object.values(a)[columnIndex];
      const valueB = Object.values(b)[columnIndex];
      if (descending) {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      } else {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }
    });
    setFilteredData(reorderedData);
  };

  // Render the table header with sorting capability
  const renderTableHeader = (header) => {
    const filteredHeader = header.filter((item) => !hiddenColumns.includes(item));
    return (
      <tr>
        {filteredHeader.map((item, index) => (
          <th key={index} onClick={() => handleHeaderClick(index)}>
            {item}
            {sortOrder.columnIndex === index && sortOrder.descending
              ? ' ▼'
              : sortOrder.columnIndex === index
              ? ' ▲'
              : ''}
          </th>
        ))}
      </tr>
    );
  };

  const renderTableColumns = (row) => {
    return Object.keys(row).map((key, index) => (
      <td key={index} className={hiddenColumns.includes(key) ? 'hidden-column' : ''}>
        {row[key]}
      </td>
    ));
  };

  const renderTableRows = () => {
    return currentData.map((item, index) => (
      <tr key={index} onDoubleClick={() => (onRowDoubleClick ? onRowDoubleClick(item) : false)}>
        {renderTableColumns(item)}
      </tr>
    ));
  };

  return (
    <>
      <div className="table-container">
        <h2>{label}</h2>
        <hr />
        <TableSearch {...{ setCurrentPage, setFilteredData, setItemsPerPage, dataset, itemsPerPage }} />
        <table>
          <thead>{columns.length === 0 ? renderTableHeader(header) : renderTableHeader(columns)}</thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
        <div className="pagination-container">
          <TablePagination {...{ currentPage, setCurrentPage, filteredData, itemsPerPage }} />
        </div>
        <br />
      </div>
    </>
  );
}

Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onRowDoubleClick: PropTypes.any,
  columns: PropTypes.array,
  hiddenColumns: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string,
  orderColumnsList: PropTypes.array,
  defaultItemsPerPage: PropTypes.number,
};

export default Table;
