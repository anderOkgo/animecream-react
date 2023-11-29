import React, { useEffect, useRef } from 'react';
//import PropTypes from 'prop-types';
import './Menu.css';

const Menu = ({ init, proc, menuItems, title, currentUser, Status }) => {
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
                          <li key={subMenu.label} className="nav-item">
                            <a href={subMenu.url} className="nav-link" onClick={subMenu.trigger}>
                              {subMenu.label}
                            </a>
                          </li>
                        ) : (
                          !subMenu.isSessionNeeded &&
                          !currentUser && (
                            <li key={subMenu.label} className="nav-item">
                              <a href={subMenu.url} className="nav-link" onClick={subMenu?.trigger}>
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
                <li key={menuItem.label} className="nav-item">
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
  menuItems: PropTypes.array.isRequired,
  title: PropTypes.any.isRequired,
  currentUser: PropTypes.any,
  Status: PropTypes.any.isRequired,
}; */

export default Menu;
