import './App.css';
import Tab from './Components/Tab/Tab';
import Menu from './Components/Menu/Menu';
import Jumbotron from './Components/Jumbotron/Jumbotron';
import Login from './Components/Auth/Login/Login';
import Loader from './Components/Loader/Loader';
import Message from './Components/Message/Message';
import { useAlive } from './hooks/useAlive';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';
import { useNavigationHistory } from './hooks/useNavigationHistory';
import AuthService from './services/auth.service';
import { useState, useEffect } from 'react';

const App = () => {
  const { init, setInit, proc, setProc, boot } = useAlive();
  const { toggleDarkMode, saveThemeAsDefault, restoreSystemDefault: restoreThemeDefault } = useTheme();
  const {
    language,
    toggleLanguage,
    saveLanguageAsDefault,
    restoreSystemDefault: restoreLanguageDefault,
    t,
  } = useLanguage();
  const navigation = useNavigationHistory();
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [globalMessage, setGlobalMessage] = useState(null);


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

  // Actualizar información del usuario cuando cambie el localStorage (entre pestañas)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Solo actualizar si cambió algo relacionado con el usuario
      if (e.key && e.key.includes('user-in')) {
        updateUserInfo();
      }
    };

    // Escuchar cambios en localStorage (solo funciona entre pestañas)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    updateUserInfo();
  };

  // Auto-dismiss global message after 5 seconds (unless it's an emergency)
  useEffect(() => {
    if (globalMessage && !globalMessage.isEmergency) {
      const timer = setTimeout(() => {
        setGlobalMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [globalMessage]);

  // Sistema de auto-reparación para errores críticos (Caché/Red)
  useEffect(() => {
    const handleCriticalError = (event) => {
      const errorText = event.reason?.message || event.message || '';
      // Detectar errores de Response, Red o Archivos de JS perdidos (Vite)
      if (
        errorText.includes('Response') ||
        errorText.includes('Failed to fetch') ||
        errorText.includes('Loading chunk')
      ) {
        setGlobalMessage({
          type: 'warning',
          key: 'loadingErrorRepair',
          isEmergency: true,
        });
      }
    };

    window.addEventListener('unhandledrejection', handleCriticalError);
    window.addEventListener('error', handleCriticalError);
    return () => {
      window.removeEventListener('unhandledrejection', handleCriticalError);
      window.removeEventListener('error', handleCriticalError);
    };
  }, []);

  const handleEmergencyRepair = async () => {
    setProc(true);
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (let reg of regs) await reg.unregister();
      }
      window.location.reload(true);
    } catch (err) {
      setProc(false);
      setGlobalMessage({ type: 'error', key: 'repairError' });
    }
  };

  return (
    <div className="app">
      <Menu
        {...{
          init,
          proc,
          boot,
          toggleDarkMode,
          saveThemeAsDefault,
          restoreThemeDefault,
          setInit,
          onLoginClick: handleLoginClick,
        }}
      />
      <div className="card-area">
        {/* <Jumbotron {...{ t }} /> */}
        <Tab
          {...{
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
          }}
        />
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
              <button className="login-close" onClick={() => setShowLogin(false)} title={t('close')}>
                ×
              </button>
              <h2 className="title">{t('login')}</h2>
              <Login {...{ t, init, setInit, setProc, proc, onLoginSuccess: handleLoginSuccess }} />
            </div>
          </div>
        )}
      </div>
      {!!proc && <Loader />}
      {globalMessage && (
        <Message
          msg={globalMessage.key ? t(globalMessage.key) : globalMessage.text}
          bgColor={
            globalMessage.type === 'success'
              ? 'var(--color-success)'
              : globalMessage.type === 'error'
                ? 'var(--color-danger)'
                : globalMessage.type === 'warning'
                  ? 'var(--color-warning)'
                  : 'var(--brand-primary)'
          }
          textColor={globalMessage.type === 'warning' ? '#1a1a1a' : undefined}
          onDoubleClick={() => {
            if (globalMessage.isEmergency) {
              handleEmergencyRepair();
            } else {
              setGlobalMessage(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
