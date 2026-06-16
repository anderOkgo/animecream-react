import React, { useEffect, useRef, useState } from 'react';
import './Menu.css';
import Status from '../Status/Status';
import AuthService from '../../services/auth.service';

const Menu = ({
  init,
  proc,
  boot,
  toggleDarkMode,
  saveThemeAsDefault,
  restoreThemeDefault,
  setInit,
  onLoginClick,
}) => {
  const [currentUser, setCurrentUser] = useState(undefined);
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, [init]);

  // Update currentUser whenever init changes (login/logout)
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
  }, [init]);

  const handleStatusClick = () => {
    boot();
    toggleDarkMode();
  };

  const handleThemeDoubleClick = () => {
    // Verificar si hay una preferencia guardada
    const hasStoredPreference = localStorage.getItem('themePreference') !== null;

    // Obtener el idioma actual para mostrar el mensaje correcto
    const currentLang = localStorage.getItem('lang') || (navigator.language.split('-')[0] === 'es' ? 'es' : 'en');
    const messages = {
      en: { system: 'Theme: System Default', user: 'Theme: User Default' },
      es: { system: 'Tema: Predeterminado del Sistema', user: 'Tema: Predeterminado del Usuario' },
    };

    if (hasStoredPreference) {
      // Si hay preferencia guardada, restaurar el default del sistema
      restoreThemeDefault();
      alert(messages[currentLang]?.system || 'Theme: System Default');
    } else {
      // Si no hay preferencia guardada, guardar la actual como default
      saveThemeAsDefault();
      alert(messages[currentLang]?.user || 'Theme: User Default');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setInit(Date.now());
    setCurrentUser(undefined);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const title = 'Animecream'; // Updated menu title
  const menuItems = [
    { label: 'Finanz', url: 'https://finan.animecream.com/', isSessionNeeded: true },
    { label: 'Cyfer', url: 'https://cyfer.animecream.com/', isSessionNeeded: true },
    {
      label: 'Session',
      url: '#',
      child: [
        { isSessionNeeded: false, label: 'Login', url: '#', trigger: handleLogin },
        { isSessionNeeded: true, label: 'Logout', url: '#', trigger: handleLogout },
      ],
    },
  ];
  const checkboxRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      // El label .hamburger ya alterna el checkbox; solo cerrar al clic fuera
      if (e.target.closest('.hamburger') || e.target.closest('.navbar') !== null) {
        return;
      }
      if (checkboxRef.current) {
        checkboxRef.current.checked = false;
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [init]);

  return (
    <nav className="navbar">
      <div className="nav-links">
        <input type="checkbox" id="checkbox_toggle" ref={checkboxRef} />
        <label htmlFor="checkbox_toggle" className="hamburger" aria-label="Menu">
          <span className="hamb-line"></span>
        </label>
        <ul className="menu">
          {menuItems
            .filter((menuItem) => !menuItem.isSessionNeeded || currentUser)
            .map((menuItem, index) => (
              <React.Fragment key={index}>
                {menuItem.child ? (
                  <>
                    <li key={menuItem.label} className="services">
                      <a href={menuItem.url}>{menuItem.label}</a>
                      <ul className="dropdown">
                        {menuItem.child.map((subMenu) =>
                          subMenu.isSessionNeeded === true && currentUser ? (
                            <li key={subMenu.label}>
                              <a href={subMenu.url} onClick={subMenu.trigger}>
                                {subMenu.label}
                              </a>
                            </li>
                          ) : (
                            !subMenu.isSessionNeeded &&
                            !currentUser && (
                              <li key={subMenu.label}>
                                <a
                                  href={subMenu.url}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    subMenu.trigger && subMenu.trigger(e);
                                  }}
                                >
                                  {subMenu.label}
                                </a>
                              </li>
                            )
                          )
                        )}
                      </ul>
                    </li>
                  </>
                ) : (
                  <li key={menuItem.label}>
                    <a href={menuItem.url}>{menuItem.label}</a>
                  </li>
                )}
              </React.Fragment>
            ))}
        </ul>
      </div>
      <div className="logo insetshadow">
        <span className="icon-activity" onClick={handleStatusClick} onDoubleClick={handleThemeDoubleClick}>
          <Status {...{ init, proc }} />
        </span>
        {title}
      </div>
    </nav>
  );
};

/* Menu.propTypes = {
  init: PropTypes.any.isRequired,
  proc: PropTypes.any.isRequired,
}; */

export default Menu;
