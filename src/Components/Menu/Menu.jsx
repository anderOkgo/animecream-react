import { useState, useEffect } from 'react';
import AuthService from '../../services/auth.service';
import './Menu.css';

const Menu = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
  };

  return (
    <nav className="navbar">
      <div className="logo insetshadow">R Animecream</div>
      <div className="nav-links">
        <input type="checkbox" id="checkbox_toggle" />
        <label htmlFor="checkbox_toggle" className="hamburger">
          <span className="hamb-line"></span>
        </label>
        <ul className="menu">
          <li>
            <a href="https://cyfer.animecream.com/">Cyfer</a>
          </li>
          <li>
            <a href="https://finan.animecream.com/">Finan</a>
          </li>
          <li>
            <a href="https://www.animecream.com/">Animecream</a>
          </li>
          <li>
            <a href="https://nabu.animecream.com/">Nabu</a>
          </li>
          <li className="services">
            <a href="#">Session</a>
            <ul className="dropdown">
              {!currentUser ? (
                <li className="nav-item">
                  <a href="/" className="nav-link">
                    Login
                  </a>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <a href="/" className="nav-link" onClick={handleLogout}>
                      Logout
                    </a>
                  </li>
                </>
              )}
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Menu;
