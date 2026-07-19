import React, { useEffect, useState, useRef } from 'react';
import useSwipeableTabs from '../../hooks/useSwipeableTabs';
import Home from '../Home/Home';
import AdminPanel from '../Admin/AdminPanel';
import ListManager from '../MyLists/ListManager';

import { isAppOffline } from '../../helpers/catalogStorage';
import './Tab.css';

function Tab({
  t,
  toggleLanguage,
  saveLanguageAsDefault,
  restoreLanguageDefault,
  language,
  setProc,
  proc,
  init,
  role,
  navigation,
  setGlobalMessage,
}) {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sectionTabRef = useRef(null);
  const homeSetOptRef = useRef(null);

  const handleTabClick = (tabId) => {
    if (tabId !== selectedOption) {
      setSelectedOption(tabId);
    }
  };

  const handleEditSeries = (seriesData) => {
    if (isAppOffline()) {
      if (setGlobalMessage) {
        setGlobalMessage({ type: 'warning', key: 'Offline' });
      }
      return;
    }
    setProc(true);
    setSeriesToEdit({ ...seriesData });
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
      return addSeriesToSelectedList(series);
    } else {
      // Si no hay lista seleccionada, abrir modal para crear/seleccionar
      setShowListManager(true);
      return false;
    }
  };

  const addSeriesToSelectedList = (series) => {
    if (!selectedListId) return false;

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
          return true;
        } else {
          alert(t('alreadyInList') || 'This series is already in the list');
          return false;
        }
      }
    } catch (error) {
      console.error('Error adding to list:', error);
    }
    return false;
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

  // Función helper para obtener el contenedor con scroll activo
  const getScrollContainer = () => {
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
      scrollContainer =
        sectionTabRef.current || document.querySelector('.section-tab') || document.documentElement;
    }

    return scrollContainer;
  };

  const handleScrollToTop = () => {
    const scrollContainer = getScrollContainer();
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      setIsAtTop(true);
    }
  };

  const handleScrollToEnd = () => {
    const scrollContainer = getScrollContainer();
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
      alert(t('languageSystemDefault') || 'Language: System Default');
    } else {
      // Si no hay preferencia guardada, guardar la actual como default
      saveLanguageAsDefault();
      alert(t('languageUserDefault') || 'Language: User Default');
    }
  };

  const handleTop250Click = () => {
    if (homeSetOptRef.current) {
      const requestData = {
        method: 'POST',
        body: {
          limit: 250,
          production_ranking_number: 'ASC',
          _reverse: true,
        },
      };
      navigator.clipboard?.writeText(`${window.location.origin}/top250`);
      navigation?.pushHistory('request', { type: 'top250', data: requestData });
      homeSetOptRef.current(requestData);
      handleScrollToTop();
    }
  };

  // Fully implemented (mirrors handleTop250Click, and Home.jsx / the
  // history-restore logic below both already anticipate a 'top100' request
  // type) but never wired to a UI element -- no `.lang-top100` trigger
  // exists next to `.lang-top250` below. Left in place, not deleted:
  // flagged as a missing-wiring gap for a product decision, same class of
  // finding as module-api's Phase 2.6 `validateInitialLoad`.
  const _handleTop100Click = () => {
    if (homeSetOptRef.current) {
      const requestData = {
        method: 'POST',
        body: {
          limit: 100,
          production_ranking_number: 'ASC',
          _reverse: true,
        },
      };
      navigation?.pushHistory('request', { type: 'top100', data: requestData });
      homeSetOptRef.current(requestData);
      handleScrollToTop();
    }
  };

  const tabsData = [
    {
      id: 1,
      icon: '',
      label: t('seriesAndOvas') || 'Series & OVAs',
      component: true && (
        <Home
          {...{
            t,
            toggleLanguage,
            onLanguageDoubleClick: handleLanguageDoubleClick,
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
            onSetOptReady: (setOptFn) => {
              homeSetOptRef.current = setOptFn;
            },
            navigation,
            onShowListManager: () => setShowListManager(true),
            onScrollToggle: handleScrollToEnd,
            isAtTop,
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
          setProc={setProc}
          proc={proc}
          init={init}
          setGlobalMessage={setGlobalMessage}
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

  // Manejar navegación hacia atrás
  useEffect(() => {
    if (!navigation) return;

    const currentState = navigation.currentState;
    if (currentState) {
      switch (currentState.type) {
        case 'request':
          // Las peticiones se restauran en Home.jsx
          // Aquí solo manejamos el scroll si es necesario
          if (currentState.data?.type === 'top250' || currentState.data?.type === 'top100') {
            handleScrollToTop();
          }
          break;
        default:
          break;
      }
    }
    // `navigation` (the object itself) and `handleScrollToTop` are
    // deliberately excluded: `currentState`/`currentIndex` are the actual
    // tracked values, and `navigation` is a new object identity every
    // render, which would make this re-run on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation?.currentState, navigation?.currentIndex]);

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
                <div className={`lang-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                  <span
                    className="lang lang-sidebar-close"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    title={isSidebarOpen ? t('close') : t('open')}
                  >
                    {isSidebarOpen ? '«' : '»'}
                  </span>
                  <div
                    className="sidebar-toggle scroll-toggle-tab"
                    onClick={handleScrollToEnd}
                    onDoubleClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    title={`${isAtTop ? t('goToBottom') : t('goToTop')} · ${isSidebarOpen ? t('close') : t('open')} (${t('doubleClick')})`}
                  >
                    {isAtTop ? '↓' : '↑'}
                  </div>
                  <span
                    className="lang"
                    onClick={toggleLanguage}
                    onDoubleClick={handleLanguageDoubleClick}
                    title={language === 'en' ? t('switchToSpanish') : t('switchToEnglish')}
                  >
                    {language === 'en' ? 'EN' : 'ES'}
                  </span>
                  {selectedOption === 1 && (
                    <span
                      className="lang lang-numbers"
                      onClick={() => setShowRealNumbers(!showRealNumbers)}
                      title={t('index')}
                    >
                      IX
                    </span>
                  )}
                  <span
                    className="lang lang-advanced-search"
                    onClick={() => {
                      setIsAdvancedSearchVisible(!isAdvancedSearchVisible);
                      handleScrollToTop();
                    }}
                    title={isAdvancedSearchVisible ? t('closeAdvancedSearch') : t('openAdvancedSearch')}
                  >
                    {isAdvancedSearchVisible ? '✕' : '🔍'}
                  </span>
                  {selectedOption === 1 && (
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
                  )}
                  {selectedOption === 1 && (
                    <>
                      <span
                        className="lang lang-my-lists"
                        onClick={() => setShowListManager(true)}
                        title={t('myLists') || 'My Lists'}
                      >
                        ☰
                      </span>
                    </>
                  )}
                  {selectedOption === 1 && (
                    <>
                      <span className="lang-separator"></span>
                      <span className="lang lang-top250" onClick={handleTop250Click} title="Top 250">
                        Top 250
                      </span>
                    </>
                  )}
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
