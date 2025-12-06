import React, { useState, useEffect } from 'react';
import helpHttp from '../../helpers/helpHttp';
import set from '../../helpers/set.json';
import './ListView.css';
import { useLanguage } from '../../hooks/useLanguage';

const ListView = ({ listId, onBack, onLoadSeries }) => {
  const { t } = useLanguage();
  const [listData, setListData] = useState(null);
  const [seriesData, setSeriesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (listId) {
      loadListData();
    }
  }, [listId]);

  useEffect(() => {
    if (listData && listData.items && listData.items.length > 0) {
      loadSeriesData();
    } else {
      setSeriesData([]);
    }
  }, [listData]);

  const loadListData = () => {
    try {
      const stored = localStorage.getItem(listId);
      if (stored) {
        const data = JSON.parse(stored);
        setListData(data);
      }
    } catch (error) {
      console.error('Error loading list:', error);
    }
  };

  const loadSeriesData = async () => {
    if (!listData || !listData.items || listData.items.length === 0) {
      setSeriesData([]);
      return;
    }

    setLoading(true);
    try {
      const ids = listData.items.map((item) => item.id).filter(Boolean);
      
      if (ids.length === 0) {
        setSeriesData([]);
        setLoading(false);
        return;
      }

      console.log('Loading series with IDs:', ids);
      
      const postUrl = set.base_url + set.api_url;
      
      // El API espera el parámetro "id" (no "ids") como array para usar IN condition
      // Según series-read.mysql.ts línea 216: id: HDB.generateInCondition
      const response = await helpHttp.post(postUrl, {
        body: {
          id: ids, // Array de IDs - el API usa generateInCondition que espera un array
        },
      });
      
      console.log('Response from API:', response);
      
      if (!response?.err) {
        // Asegurar que response sea un array
        const seriesArray = Array.isArray(response) ? response : (response.data || []);
        
        console.log('Series loaded:', seriesArray.length, 'items');
        console.log('Expected IDs:', ids);
        
        // Si recibimos todos los resultados, filtrar solo los que necesitamos
        let filteredArray = seriesArray;
        if (seriesArray.length > ids.length) {
          console.log('Filtering results to match requested IDs...');
          filteredArray = seriesArray.filter((series) => {
            const seriesId = series.production_ranking_number || series.id;
            return ids.includes(seriesId);
          });
          console.log('Filtered to:', filteredArray.length, 'items');
        }
        
        // Crear un mapa para búsqueda rápida usando tanto id como production_ranking_number
        const seriesMap = new Map();
        filteredArray.forEach((series) => {
          const id = series.production_ranking_number || series.id;
          const dbId = series.id;
          if (id) {
            seriesMap.set(id, series);
          }
          if (dbId && dbId !== id) {
            seriesMap.set(dbId, series);
          }
        });
        
        // Ordenar según el orden de la lista
        const orderedData = listData.items
          .map((listItem) => {
            // Intentar encontrar por el ID guardado
            let found = seriesMap.get(listItem.id);
            // Si no se encuentra, intentar convertir a número
            if (!found) {
              const numId = Number(listItem.id);
              if (!isNaN(numId)) {
                found = seriesMap.get(numId);
              }
            }
            return found;
          })
          .filter(Boolean);
        
        console.log('Final ordered data:', orderedData.length, 'items');
        setSeriesData(orderedData);
      } else {
        console.error('Error loading series:', response.err);
        setSeriesData([]);
      }
    } catch (error) {
      console.error('Error loading series:', error);
      setSeriesData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      return;
    }

    const newItems = [...listData.items];
    const dragged = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(dropIndex, 0, dragged);

    const updatedList = {
      ...listData,
      items: newItems,
    };

    localStorage.setItem(listId, JSON.stringify(updatedList));
    setListData(updatedList);
    setDraggedItem(null);
  };

  const handleRemoveItem = (index) => {
    const newItems = listData.items.filter((_, i) => i !== index);
    const updatedList = {
      ...listData,
      items: newItems,
    };

    localStorage.setItem(listId, JSON.stringify(updatedList));
    setListData(updatedList);
  };

  const handleLoadSeries = () => {
    if (onLoadSeries && listData && listData.items.length > 0) {
      const ids = listData.items.map((item) => item.id);
      onLoadSeries(ids);
    }
  };

  if (!listData) {
    return <div>{t('loading') || 'Loading...'}</div>;
  }

  return (
    <div className="list-view-container">
      <div className="list-view-header">
        <button className="back-btn" onClick={onBack}>
          ← {t('back') || 'Back'}
        </button>
        <h3>{listData.name}</h3>
        <button className="load-series-btn" onClick={handleLoadSeries} disabled={listData.items.length === 0}>
          {t('loadSeries') || 'Load Series'}
        </button>
      </div>
      
      <div className="list-view-content">
        {loading ? (
          <div className="loading">{t('loading') || 'Loading...'}</div>
        ) : seriesData.length === 0 ? (
          <div className="empty-list">
            {listData.items.length === 0
              ? t('emptyList') || 'This list is empty'
              : t('loadingSeries') || 'Loading series...'}
          </div>
        ) : (
          <div className="series-list">
            {seriesData.map((series, index) => (
              <div
                key={series.production_ranking_number || series.id || index}
                className="series-item"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <span className="drag-handle">☰</span>
                <span className="series-name">
                  #{series.production_ranking_number || series.id} - {series.production_name || series.name}
                </span>
                <button
                  className="remove-item-btn"
                  onClick={() => handleRemoveItem(index)}
                  title={t('remove') || 'Remove'}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;

