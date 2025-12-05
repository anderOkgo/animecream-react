import './App.css';
import Tab from './Components/Tab/Tab';
import Menu from './Components/Menu/Menu';
import Jumbotron from './Components/Jumbotron/Jumbotron';
import Login from './Components/Auth/Login/Login';
import { useAlive } from './hooks/useAlive';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import AuthService from './services/auth.service';
import { useState, useEffect } from 'react';

const App = () => {
  const { init, setInit, proc, setProc, boot } = useAlive();
  const { toggleDarkMode } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const userInfo = AuthService.getUserName(user.token);
      setUsername(userInfo?.username || null);
      setRole(userInfo?.role || null);
    } else {
      setUsername(null);
      setRole(null);
    }
  }, [init]);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  return (
    <div className="app">
      <Menu {...{ init, proc, boot, toggleDarkMode, setInit, onLoginClick: handleLoginClick }} />
      <div className="card-area">
        {/* <Jumbotron {...{ t }} /> */}
        <Tab {...{ t, toggleLanguage, language, setProc, init, role }} />
        {showLogin && (
          <div
            className="login-overlay"
            onClick={(e) => {
              if (e.target.classList.contains('login-overlay')) {
                setShowLogin(false);
              }
            }}
          >
            <div className="login-container">
              <button className="login-close" onClick={() => setShowLogin(false)} title="Cerrar">
                ×
              </button>
              <h2 className="title">{t('login')}</h2>
              <Login {...{ t, init, setInit, setProc, onLoginSuccess: handleLoginSuccess }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
