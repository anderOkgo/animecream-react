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
  const { toggleDarkMode, saveThemeAsDefault, restoreSystemDefault: restoreThemeDefault } = useTheme();
  const { language, toggleLanguage, saveLanguageAsDefault, restoreSystemDefault: restoreLanguageDefault, t } = useLanguage();
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const updateUserInfo = () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const userInfo = AuthService.getUserName(user.token);
      setUsername(userInfo?.username || null);
      setRole(userInfo?.role || null);
    } else {
      setUsername(null);
      setRole(null);
    }
  };

  useEffect(() => {
    updateUserInfo();
  }, [init]);

  // Actualizar información del usuario cuando cambie el localStorage (misma pestaña)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Solo actualizar si cambió algo relacionado con el usuario
      if (e.key && e.key.includes('user-in')) {
        updateUserInfo();
      }
    };

    // Escuchar cambios en localStorage (solo funciona entre pestañas)
    window.addEventListener('storage', handleStorageChange);
    
    // Para cambios en la misma pestaña, usar un intervalo más largo
    const interval = setInterval(() => {
      updateUserInfo();
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    // Actualizar información del usuario después del login
    updateUserInfo();
  };

  return (
    <div className="app">
      <Menu {...{ init, proc, boot, toggleDarkMode, saveThemeAsDefault, restoreThemeDefault, setInit, onLoginClick: handleLoginClick }} />
      <div className="card-area">
        {/* <Jumbotron {...{ t }} /> */}
        <Tab {...{ t, toggleLanguage, saveLanguageAsDefault, restoreLanguageDefault, language, setProc, init, role }} />
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
