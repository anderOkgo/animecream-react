import React, { useEffect, useRef, useState } from 'react';
//import PropTypes from 'prop-types';
import './Menu.css';
import Status from '../Status/Status';
import AuthService from '../../services/auth.service';

const Menu = ({ init, proc }) => {
  const [currentUser, setCurrentUser] = useState(undefined);
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    user && setCurrentUser(user);
  }, []);

  //const handleLogout = () => AuthService.logout();

  const title = '';
  const menuItems = [
    { label: 'Cyfer', url: 'https://cyfer.animecream.com/' },
    { label: 'Finanz', url: 'https://finan.animecream.com/' },
    { label: 'Animecream', url: 'https://www.animecream.com/' },
    { label: 'Nabu', url: 'https://nabu.animecream.com/' },
    /*  {
      label: 'session',
      url: '#',
      child: [
        { isSessionNeeded: false, label: 'login', url: '/' },
        { isSessionNeeded: true, label: 'logout', url: '/', trigger: handleLogout },
      ],
    }, */
  ];
  const checkboxRef = useRef(null);
  const spanRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (checkboxRef.current == e.target || spanRef.current == e.target) {
        checkboxRef.current.checked ? false : true;
      } else if (e.target.closest('.navbar') !== null) {
        //nothig to do
      } else {
        checkboxRef.current.checked = false;
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-links">
        <input type="checkbox" id="checkbox_toggle" ref={checkboxRef} />
        <label htmlFor="checkbox_toggle" className="hamburger">
          <span ref={spanRef} className="hamb-line"></span>
        </label>
        <ul className="menu">
          {menuItems.map((menuItem, index) => (
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
                              <a href={subMenu.url} onClick={subMenu?.trigger}>
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
        <span className="icon-activity">
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
