import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook para manejar el historial de navegación interno en PWA
 * Evita que el botón "atrás" del dispositivo cierre la aplicación
 */
export const useNavigationHistory = () => {
  const [history, setHistory] = useState([{ type: 'initial', data: null }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const historyRef = useRef([{ type: 'initial', data: null }]);
  const currentIndexRef = useRef(0);
  const isNavigatingRef = useRef(false);
  const pushHistoryLockRef = useRef(false);
  const isProcessingPopStateRef = useRef(false);

  // Sincronizar refs con state inmediatamente después de cada update de state
  // para que pushHistory siempre tenga el valor más reciente
  const updateState = useCallback((newHistory, newIndex) => {
    historyRef.current = newHistory;
    currentIndexRef.current = newIndex;
    setHistory(newHistory);
    setCurrentIndex(newIndex);
  }, []);

  const pushHistory = useCallback(
    (type, data = null) => {
      // No agregar si estamos navegando programáticamente o procesando popstate
      if (isNavigatingRef.current || isProcessingPopStateRef.current || pushHistoryLockRef.current) {
        if (isNavigatingRef.current) {
          isNavigatingRef.current = false;
        }
        return;
      }

      const currentState = historyRef.current[currentIndexRef.current];
      const newDataStr = JSON.stringify(data);

      // Verificar si la entrada actual es igual
      if (currentState) {
        const currentDataStr = JSON.stringify(currentState.data);
        if (currentState.type === type && currentDataStr === newDataStr) {
          return;
        }
      }

      // Agregar nueva entrada
      pushHistoryLockRef.current = true;

      const newHistory = historyRef.current.slice(0, currentIndexRef.current + 1);
      const newIndex = newHistory.length;
      const newEntry = { type, data, timestamp: Date.now() };
      newHistory.push(newEntry);

      window.history.pushState({ index: newIndex, type, data }, '', window.location.href);

      updateState(newHistory, newIndex);

      setTimeout(() => {
        pushHistoryLockRef.current = false;
      }, 100);
    },
    [updateState]
  );

  const replaceHistory = useCallback(
    (type, data = null) => {
      const newHistory = [...historyRef.current];
      const newEntry = { type, data, timestamp: Date.now() };
      newHistory[currentIndexRef.current] = newEntry;

      window.history.replaceState(
        { index: currentIndexRef.current, type, data },
        '',
        window.location.href
      );

      updateState(newHistory, currentIndexRef.current);
    },
    [updateState]
  );

  const goBack = useCallback(() => {
    if (currentIndexRef.current > 0) {
      isNavigatingRef.current = true;
      const newIndex = currentIndexRef.current - 1;
      // No actualizamos state aquí, esperamos al popstate
      window.history.go(-1);
      return historyRef.current[newIndex];
    }
    return null;
  }, []);

  const goForward = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      isNavigatingRef.current = true;
      const newIndex = currentIndexRef.current + 1;
      // No actualizamos state aquí, esperamos al popstate
      window.history.go(1);
      return historyRef.current[newIndex];
    }
    return null;
  }, []);

  useEffect(() => {
    const handlePopState = (event) => {
      if (isProcessingPopStateRef.current) {
        return;
      }

      isProcessingPopStateRef.current = true;

      if (event.state?.index !== undefined) {
        const stateIndex = event.state.index;

        if (stateIndex >= 0 && stateIndex < historyRef.current.length) {
          isNavigatingRef.current = true;
          setCurrentIndex(stateIndex);
          currentIndexRef.current = stateIndex;
          setTimeout(() => {
            isProcessingPopStateRef.current = false;
          }, 50);
          return;
        }
      } else if (currentIndexRef.current > 0) {
        isNavigatingRef.current = true;
        const newIndex = currentIndexRef.current - 1;
        setCurrentIndex(newIndex);
        currentIndexRef.current = newIndex;
        setTimeout(() => {
          isProcessingPopStateRef.current = false;
        }, 50);
        return;
      }

      setTimeout(() => {
        isProcessingPopStateRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);

    // Inicializar estado de browser si es necesario
    if (window.history.state === null) {
      window.history.replaceState({ index: 0, type: 'initial', data: null }, '', window.location.href);
    } else if (window.history.state.index !== undefined) {
      // Si ya hay un estado con índice (por ej. tras un refresh),
      // sincronizar nuestro índice inicial para evitar saltos.
      // Pero como React history empieza de nuevo, reemplazamos el estado actual.
      window.history.replaceState({ index: 0, type: 'initial', data: null }, '', window.location.href);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Objeto de navegación memoizado para evitar re-renders innecesarios en componentes que lo usan
  // pero que sea reactivo a los cambios de estado necesarios.
  return {
    history,
    currentState: history[currentIndex],
    currentIndex,
    pushHistory,
    replaceHistory,
    goBack,
    goForward,
    canGoBack: currentIndex > 0,
    canGoForward: currentIndex < history.length - 1,
  };
};
