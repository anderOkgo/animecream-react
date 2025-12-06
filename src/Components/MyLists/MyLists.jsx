import React, { useState, useEffect } from 'react';
import './MyLists.css';
import { useLanguage } from '../../hooks/useLanguage';

const MyLists = ({ onSelectList, selectedListId, onClose }) => {
  const { t } = useLanguage();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

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
      items: [],
    };

    localStorage.setItem(listId, JSON.stringify(listData));
    setNewListName('');
    setShowAddForm(false);
    loadLists();
  };

  const handleDeleteList = (listId) => {
    if (window.confirm(t('confirmDeleteList') || 'Are you sure you want to delete this list?')) {
      localStorage.removeItem(listId);
      loadLists();
      if (selectedListId === listId && onSelectList) {
        onSelectList(null);
      }
    }
  };

  const handleSelectList = (listId) => {
    if (onSelectList) {
      onSelectList(listId);
    }
  };

  return (
    <div className="my-lists-container">
      <div className="my-lists-header">
        <h3>{t('myLists') || 'My Lists'}</h3>
        <button className="close-btn" onClick={onClose} title={t('close') || 'Close'}>
          ×
        </button>
      </div>
      <div className="my-lists-content">
        {!showAddForm ? (
          <button className="btn-add-list" onClick={() => setShowAddForm(true)}>
            + {t('addList') || 'Add List'}
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
              <button onClick={handleAddList}>{t('save') || 'Save'}</button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewListName('');
                }}
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        )}

        <div className="lists-container">
          {lists.length === 0 ? (
            <p className="no-lists">{t('noLists') || 'No lists yet. Create one!'}</p>
          ) : (
            lists.map((list) => (
              <div
                key={list.id}
                className={`list-item ${selectedListId === list.id ? 'selected' : ''}`}
                onClick={() => handleSelectList(list.id)}
              >
                <div className="list-info">
                  <span className="list-name">{list.name}</span>
                  <span className="list-count">
                    ({list.items.length} {t('items') || 'items'})
                  </span>
                </div>
                <button
                  className="btn-delete-list"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list.id);
                  }}
                  title={t('deleteList') || 'Delete list'}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyLists;
