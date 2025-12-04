import React, { useEffect, useState } from 'react';
import useSwipeableTabs from '../../hooks/useSwipeableTabs';
import Home from '../Home/Home';
import AdminPanel from '../Admin/AdminPanel';
import './Tab.css';

function Tab({ t, toggleLanguage, language, setProc, init, role }) {
  const [nTab, setnTab] = useState(2);
  const { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd } = useSwipeableTabs(nTab, 170);
  const [width, setWidth] = useState('20%');
  const [showRealNumbers, setShowRealNumbers] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);
  const [seriesToEdit, setSeriesToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const tabsData = [
    {
      id: 1,
      icon: '📚',
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
          }}
        />
      ),
    },
  ];

  if (role === 'admin') {
    tabsData.push({
      id: 2,
      icon: '⚙️',
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
            <div className="section-tab">
              <div className="container-tab">
                <div className="lang-container">
                  <span className="lang" onClick={toggleLanguage}>
                    {language === 'en' ? t('switchToSpanish') : t('switchToEnglish')}
                  </span>
                  <span className="lang lang-numbers" onClick={() => setShowRealNumbers(!showRealNumbers)}>
                    {showRealNumbers ? t('index') : t('index')}
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
                  >
                    {sortOrder === null ? '↔' : sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                </div>
                {tab.component}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Tab;
