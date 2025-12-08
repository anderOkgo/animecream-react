import React, { useState, useEffect } from 'react';
import './AddToListModal.css';
import { useLanguage } from '../../hooks/useLanguage';

const AddToListModal = ({ seriesId, seriesName, onClose, onAdd }) => {
  const { t } = useLanguage();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const savedLists = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('list_')) {
        try {
          const listData = JSON.parse(localStorage.getItem(key));
          savedLists.push({
            id: key,
            name: listData.name || key.replace('list_', ''),
            items: listData.items || [],
          });
        } catch (error) {
          console.error('Error loading list:', error);
        }
      }
    }
    setLists(savedLists);
  };

  const handleAddList = () => {
    if (newListName.trim() === '') {
      alert(t('listNameRequired') || 'List name is required');
      return;
    }

    const listId = `list_${Date.now()}`;
    const listData = {
      name: newListName.trim(),
      items: [{ id: seriesId, name: seriesName }],
    };

    localStorage.setItem(listId, JSON.stringify(listData));
    setNewListName('');
    setShowAddForm(false);
    loadLists();
    setSelectedListId(listId);
    
    if (onAdd) {
      onAdd(listId, seriesId, seriesName);
    }
  };

  const handleSelectList = (listId) => {
    setSelectedListId(listId);
    
    // Agregar a la lista seleccionada
    try {
      const stored = localStorage.getItem(listId);
      if (stored) {
        const listData = JSON.parse(stored);
        const items = listData.items || [];
        
        // Verificar si ya existe
        const exists = items.some((item) => item.id === seriesId);
        if (!exists) {
          items.push({ id: seriesId, name: seriesName });
          listData.items = items;
          localStorage.setItem(listId, JSON.stringify(listData));
          
          if (onAdd) {
            onAdd(listId, seriesId, seriesName);
          }
        } else {
          alert(t('alreadyInList') || 'This series is already in the list');
        }
      }
    } catch (error) {
      console.error('Error adding to list:', error);
    }
  };

  return (
    <div className="add-to-list-overlay" onClick={onClose}>
      <div className="add-to-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-to-list-header">
          <h3>{t('addToList') || 'Add to List'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="add-to-list-content">
          <p className="series-info">
            {t('adding') || 'Adding'}: <strong>{seriesName}</strong>
          </p>
          
          {!showAddForm ? (
            <button className="btn-add-list" onClick={() => setShowAddForm(true)}>
              + {t('createNewList') || 'Create New List'}
            </button>
          ) : (
            <div className="add-list-form">
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
              <div className="add-list-buttons">
                <button onClick={handleAddList}>{t('create') || 'Create'}</button>
                <button onClick={() => {
                  setShowAddForm(false);
                  setNewListName('');
                }}>
                  {t('cancel') || 'Cancel'}
                </button>
              </div>
            </div>
          )}

          <div className="lists-container">
            {lists.length === 0 ? (
              <p className="no-lists">{t('noLists') || 'No lists yet. Create one!'}</p>
            ) : (
              lists.map((list) => {
                const isInList = list.items.some((item) => item.id === seriesId);
                return (
                  <div
                    key={list.id}
                    className={`list-item ${selectedListId === list.id ? 'selected' : ''} ${isInList ? 'in-list' : ''}`}
                    onClick={() => !isInList && handleSelectList(list.id)}
                  >
                    <div className="list-info">
                      <span className="list-name">{list.name}</span>
                      <span className="list-count">({list.items.length} {t('items') || 'items'})</span>
                    </div>
                    {isInList && (
                      <span className="in-list-badge">{t('alreadyAdded') || 'Added'}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToListModal;





