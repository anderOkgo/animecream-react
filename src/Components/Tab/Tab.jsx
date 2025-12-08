import React, { useEffect, useState, useRef } from 'react';
import useSwipeableTabs from '../../hooks/useSwipeableTabs';
import Home from '../Home/Home';
import AdminPanel from '../Admin/AdminPanel';
import ListManager from '../MyLists/ListManager';
import './Tab.css';

function Tab({ t, toggleLanguage, saveLanguageAsDefault, restoreLanguageDefault, language, setProc, init, role }) {
  const [nTab, setnTab] = useState(2);
  const { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd } = useSwipeableTabs(1, nTab, 170);
  const [width, setWidth] = useState('20%');
  const [showRealNumbers, setShowRealNumbers] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);
  const [seriesToEdit, setSeriesToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAdvancedSearchVisible, setIsAdvancedSearchVisible] = useState(false);
  const [showListManager, setShowListManager] = useState(false);
  const [loadByIds, setLoadByIds] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [currentSeries, setCurrentSeries] = useState([]);
  const [isAtTop, setIsAtTop] = useState(true);
  const sectionTabRef = useRef(null);

  const handleTabClick = (tabId) => {
    setSelectedOption(tabId);
  };

  const handleEditSeries = (seriesData) => {
    setSeriesToEdit(seriesData);
    if (role === 'admin') {
      setSelectedOption(2);
    }
  };

  const handleEditCancel = () => {
    setSeriesToEdit(null);
  };

  const handleRefreshSeries = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAddToList = (series) => {
    // Si hay una lista seleccionada, agregar directamente
    if (selectedListId) {
      addSeriesToSelectedList(series);
    } else {
      // Si no hay lista seleccionada, abrir modal para crear/seleccionar
      setShowListManager(true);
    }
  };

  const addSeriesToSelectedList = (series) => {
    if (!selectedListId) return;

    try {
      const stored = localStorage.getItem(selectedListId);
      if (stored) {
        const listData = JSON.parse(stored);
        const items = listData.items || [];
        
        // Verificar si ya existe
        const exists = items.some((item) => item.id === series.id);
        if (!exists) {
          items.push({ id: series.id, name: series.name });
          listData.items = items;
          localStorage.setItem(selectedListId, JSON.stringify(listData));
          // Mostrar mensaje de confirmación breve
          const listName = listData.name || 'list';
          // Usar un toast o mensaje discreto (por ahora alert simple)
          // En el futuro se puede mejorar con un componente de notificación
        } else {
          alert(t('alreadyInList') || 'This series is already in the list');
        }
      }
    } catch (error) {
      console.error('Error adding to list:', error);
    }
  };

  const handleListSelected = (listId) => {
    setSelectedListId(listId);
    if (listId) {
      localStorage.setItem('selectedListId', listId);
    } else {
      localStorage.removeItem('selectedListId');
    }
  };

  const handleLoadSeriesFromList = (ids) => {
    if (ids && ids.length > 0) {
      setShowListManager(false);
      // Actualizar loadByIds directamente, el useEffect en Home se encargará de la carga
      setLoadByIds(ids);
    }
  };

  const handleScrollToEnd = () => {
    // Buscar el contenedor con scroll activo usando el selectedOption
    const radioInput = document.getElementById(`tab-${selectedOption}`);
    let scrollContainer = null;
    
    if (radioInput) {
      // Encontrar el panel-tab que sigue al label-tab que sigue al radio checked
      const labelTab = radioInput.nextElementSibling;
      if (labelTab && labelTab.classList.contains('label-tab')) {
        const panelTab = labelTab.nextElementSibling;
        if (panelTab && panelTab.classList.contains('panel-tab')) {
          scrollContainer = panelTab.querySelector('.section-tab');
        }
      }
    }
    
    // Fallback: usar el ref o buscar cualquier section-tab
    if (!scrollContainer) {
      scrollContainer = sectionTabRef.current || document.querySelector('.section-tab') || document.documentElement;
    }
    
    if (scrollContainer) {
      if (isAtTop) {
        // Ir al final del contenedor
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
        setIsAtTop(false);
      } else {
        // Ir al inicio del contenedor
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        setIsAtTop(true);
      }
    }
  };

  const handleLanguageDoubleClick = () => {
    // Verificar si hay una preferencia guardada
    const hasStoredPreference = localStorage.getItem('lang') !== null;
    
    if (hasStoredPreference) {
      // Si hay preferencia guardada, restaurar el default del sistema
      restoreLanguageDefault();
    } else {
      // Si no hay preferencia guardada, guardar la actual como default
      saveLanguageAsDefault();
    }
  };

  const tabsData = [
    {
      id: 1,
      icon: '',
      label: t('series') || 'Series',
          component: true && (
        <Home
          {...{
            t,
            toggleLanguage,
            language,
            setProc,
            showRealNumbers,
            setShowRealNumbers,
            sortOrder,
            setSortOrder,
            role,
            onEditSeries: handleEditSeries,
            refreshTrigger,
            isAdvancedSearchVisible,
            setIsAdvancedSearchVisible,
            onAddToList: handleAddToList,
            loadByIds: loadByIds,
            onSeriesDataChange: setCurrentSeries,
          }}
        />
      ),
    },
  ];

  if (role === 'admin') {
    tabsData.push({
      id: 2,
      icon: '',
      label: t('admin') || 'Admin',
      component: true && (
        <AdminPanel
          t={t}
          seriesToEdit={seriesToEdit}
          onEditCancel={handleEditCancel}
          onEditComplete={() => {
            setSeriesToEdit(null);
            handleRefreshSeries();
            setSelectedOption(1); // Switch to Series tab
          }}
        />
      ),
    });
  }

  useEffect(() => {
    setnTab(tabsData.length);
    const per = 100 / tabsData.length;
    setWidth(per + '%');
    // Si el tab seleccionado es el de admin y ya no es admin, volver al tab 1
    if (selectedOption === 2 && role !== 'admin') {
      setSelectedOption(1);
    }
  }, [tabsData.length, role, selectedOption, setSelectedOption]);

  // Cargar lista seleccionada al montar
  useEffect(() => {
    const savedListId = localStorage.getItem('selectedListId');
    if (savedListId) {
      // Verificar que la lista aún existe
      const listData = localStorage.getItem(savedListId);
      if (listData) {
        setSelectedListId(savedListId);
      } else {
        localStorage.removeItem('selectedListId');
      }
    }
  }, []);

  return (
    <div className="area-tab" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {tabsData.map((tab) => (
        <React.Fragment key={tab.id}>
          <input
            onChange={() => handleTabClick(tab.id)}
            onClick={() => handleTabClick(tab.id)}
            checked={selectedOption === tab.id}
            value={tab.id}
            className="radio-tab"
            name="tab"
            type="radio"
            id={`tab-${tab.id}`}
          />
          <label className="label-tab" style={{ width: width }} htmlFor={`tab-${tab.id}`}>
            <pre>
              <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
              <p className="small-text">{tab.label}</p>
            </pre>
          </label>
          <div className="panel-tab">
            <div className="section-tab" ref={selectedOption === tab.id ? sectionTabRef : null}>
              <div className="container-tab">
                <div className="lang-container">
                  <span 
                    className="lang" 
                    onClick={toggleLanguage} 
                    onDoubleClick={handleLanguageDoubleClick}
                    title={language === 'en' ? t('switchToSpanish') : t('switchToEnglish')}
                  >
                    {language === 'en' ? 'EN' : 'ES'}
                  </span>
                  <span className="lang lang-numbers" onClick={() => setShowRealNumbers(!showRealNumbers)} title={t('index')}>
                    IX
                  </span>
                  <span
                    className="lang lang-sort"
                    onClick={() => {
                      if (sortOrder === null) {
                        setSortOrder('asc');
                      } else if (sortOrder === 'asc') {
                        setSortOrder('desc');
                      } else {
                        setSortOrder(null);
                      }
                    }}
                    title={t('rankingOrder')}
                  >
                    {sortOrder === null ? '⇄' : sortOrder === 'asc' ? '▲' : '▼'}
                  </span>
                  {selectedOption === 1 && (
                    <>
                      <span
                        className="lang lang-advanced-search"
                        onClick={() => setIsAdvancedSearchVisible(!isAdvancedSearchVisible)}
                        title={isAdvancedSearchVisible ? t('closeAdvancedSearch') : t('openAdvancedSearch')}
                      >
                        {isAdvancedSearchVisible ? '✕' : '🔍'}
                      </span>
                  <span
                    className="lang lang-my-lists"
                    onClick={() => setShowListManager(true)}
                    title={t('myLists') || 'My Lists'}
                  >
                    📋
                  </span>
                    </>
                  )}
                  <span
                    className="lang lang-scroll"
                    onClick={handleScrollToEnd}
                    title={isAtTop ? (t('goToBottom') || 'Go to bottom') : (t('goToTop') || 'Go to top')}
                  >
                    {isAtTop ? '↓' : '↑'}
                  </span>
                </div>
                {tab.component}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
      {showListManager && (
        <ListManager
          onClose={() => setShowListManager(false)}
          onLoadSeries={handleLoadSeriesFromList}
          selectedListId={selectedListId}
          onListSelected={handleListSelected}
          currentSeries={currentSeries}
        />
      )}
    </div>
  );
}

export default Tab;
