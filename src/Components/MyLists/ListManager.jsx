import React, { useState, useEffect } from 'react';
import './ListManager.css';
import { useLanguage } from '../../hooks/useLanguage';

const ListManager = ({ onClose, onLoadSeries, selectedListId: initialSelectedListId, onListSelected }) => {
  const { t } = useLanguage();
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(initialSelectedListId || null);
  const [listData, setListData] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRealIndexes, setShowRealIndexes] = useState(false);

  useEffect(() => {
    loadLists();
    // Si hay una lista inicial seleccionada, cargarla
    if (initialSelectedListId) {
      setSelectedListId(initialSelectedListId);
    }
  }, [initialSelectedListId]);

  useEffect(() => {
    if (selectedListId) {
      loadListData(selectedListId);
    } else {
      setListData(null);
    }
  }, [selectedListId]);


  const loadLists = () => {
    const savedLists = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('list_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          savedLists.push({
            id: key,
            name: data.name || key.replace('list_', ''),
            items: data.items || [],
          });
        } catch (error) {
          console.error('Error loading list:', error);
        }
      }
    }
    setLists(savedLists);
  };

  const loadListData = (listId) => {
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

  // Función removida: loadSeriesData
  // No se hacen peticiones al API desde el modal
  // Solo se trabaja con localStorage

  const handleListChange = (e) => {
    const listId = e.target.value || null;
    setSelectedListId(listId);
    if (onListSelected) {
      onListSelected(listId);
    }
  };

  const handleAddList = () => {
    if (newListName.trim() === '') {
      alert(t('listNameRequired') || 'List name is required');
      return;
    }

    const listId = `list_${Date.now()}`;
    const listData = {
      name: newListName.trim(),
      items: [],
    };

    localStorage.setItem(listId, JSON.stringify(listData));
    setNewListName('');
    setShowAddForm(false);
    loadLists();
    setSelectedListId(listId);
    if (onListSelected) {
      onListSelected(listId);
    }
  };

  const handleDeleteList = () => {
    if (selectedListId && window.confirm(t('confirmDeleteList') || 'Are you sure you want to delete this list?')) {
      localStorage.removeItem(selectedListId);
      // Si la lista eliminada era la seleccionada, limpiar la selección
      if (onListSelected) {
        onListSelected(null);
      }
      loadLists();
      setSelectedListId(null);
      setListData(null);
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
    
    if (draggedItem === null || draggedItem === dropIndex || !listData) {
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

    localStorage.setItem(selectedListId, JSON.stringify(updatedList));
    setListData(updatedList);
    setDraggedItem(null);
  };

  const handleRemoveItem = (index) => {
    if (!listData) return;
    
    const newItems = listData.items.filter((_, i) => i !== index);
    const updatedList = {
      ...listData,
      items: newItems,
    };

    localStorage.setItem(selectedListId, JSON.stringify(updatedList));
    setListData(updatedList);
  };

  const handleLoadSeries = () => {
    if (onLoadSeries && listData && listData.items.length > 0) {
      // Enviar los IDs en el orden exacto que están en la lista (localStorage)
      const ids = listData.items.map((item) => item.id).filter(Boolean);
      onLoadSeries(ids);
      if (onClose) {
        onClose();
      }
    }
  };

  // Alternar entre mostrar índices calculados o IDs originales
  const handleToggleIndexes = () => {
    setShowRealIndexes(!showRealIndexes);
  };

  // Copiar lista al portapapeles
  const handleCopyList = async () => {
    if (!listData || !listData.items || listData.items.length === 0) return;

    // Formatear la lista como texto (usar el formato actual según showRealIndexes)
    const listText = listData.items
      .map((item, index) => {
        if (showRealIndexes) {
          return `${index + 1}. ${item.name}`;
        } else {
          return `#${item.id} - ${item.name}`;
        }
      })
      .join('\n');

    const fullText = `${listData.name}\n\n${listText}`;

    try {
      await navigator.clipboard.writeText(fullText);
      alert(t('listCopied') || 'List copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert(t('listCopied') || 'List copied to clipboard!');
      } catch (err) {
        alert(t('copyError') || 'Error copying to clipboard');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="list-manager-overlay" onClick={onClose}>
      <div className="list-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="list-manager-header">
          <h3>{t('myLists') || 'My Lists'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="list-manager-content">
          <div className="list-selector-section">
            <div className="list-selector-controls">
              <select
                className="list-select"
                value={selectedListId || ''}
                onChange={handleListChange}
              >
                <option value="">{t('selectList') || 'Select List'}</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.items.length} {t('items') || 'items'})
                  </option>
                ))}
              </select>
              
              {!showAddForm ? (
                <button className="btn-add-list" onClick={() => setShowAddForm(true)}>
                  + {t('addList') || 'Add List'}
                </button>
              ) : (
                <div className="add-list-form-inline">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder={t('listName') || 'List name'}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddList();
                      }
                    }}
                    autoFocus
                  />
                  <button onClick={handleAddList}>{t('create') || 'Create'}</button>
                  <button onClick={() => {
                    setShowAddForm(false);
                    setNewListName('');
                  }}>
                    {t('cancel') || 'Cancel'}
                  </button>
                </div>
              )}
              
              {selectedListId && (
                <>
                  {listData && (
                    <>
                      <button 
                        className={`btn-recalculate-index ${showRealIndexes ? 'active' : ''}`}
                        onClick={handleToggleIndexes} 
                        disabled={listData.items.length === 0}
                        title={showRealIndexes ? (t('showOriginalIds') || 'Show original IDs') : (t('showCalculatedIndexes') || 'Show calculated indexes')}
                      >
                        {t('index') || '#'}
                      </button>
                      <button 
                        className="btn-copy-list" 
                        onClick={handleCopyList} 
                        disabled={listData.items.length === 0}
                        title={t('copyList') || 'Copy list to clipboard'}
                      >
                        📋
                      </button>
                      <button 
                        className="btn-load-series" 
                        onClick={handleLoadSeries} 
                        disabled={listData.items.length === 0}
                      >
                        {t('loadSeries') || 'Load Series'}
                      </button>
                    </>
                  )}
                  <button className="btn-delete-list" onClick={handleDeleteList} title={t('deleteList') || 'Delete list'}>
                    ×
                  </button>
                </>
              )}
            </div>
          </div>

          {selectedListId && listData && (
            <div className="list-items-section">
              <div className="list-items-header">
                <h4>{listData.name}</h4>
              </div>
              
              {listData.items.length === 0 ? (
                <div className="empty-list">{t('emptyList') || 'This list is empty'}</div>
              ) : (
                <div className="list-items-simple">
                  {listData.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="list-item-simple"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <span className="drag-handle">☰</span>
                      <span className="item-name">
                        {showRealIndexes ? `${index + 1}. ` : `#${item.id} - `}{item.name}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ListManager;

