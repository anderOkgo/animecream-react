import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook para manejar el historial de navegación interno en PWA
 * Evita que el botón "atrás" del dispositivo cierre la aplicación
 */
export const useNavigationHistory = () => {
  const [history, setHistory] = useState([{ type: 'initial', data: null }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isNavigatingRef = useRef(false);
  const historyRef = useRef([{ type: 'initial', data: null }]);
  const currentIndexRef = useRef(0);
  const pushHistoryLockRef = useRef(false);
  const isProcessingPopStateRef = useRef(false);

  // Sincronizar refs con state
  useEffect(() => {
    historyRef.current = history;
    currentIndexRef.current = currentIndex;
  }, [history, currentIndex]);

  const pushHistory = useCallback((type, data = null) => {
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

    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndexRef.current + 1);
      const newIndex = newHistory.length;
      newHistory.push({ type, data, timestamp: Date.now() });
      window.history.pushState({ index: newIndex, type, data }, '', window.location.href);
      return newHistory;
    });

    setCurrentIndex((prev) => prev + 1);

    setTimeout(() => {
      pushHistoryLockRef.current = false;
    }, 50);
  }, []);

  const goBack = useCallback(() => {
    if (currentIndexRef.current > 0) {
      isNavigatingRef.current = true;
      const newIndex = currentIndexRef.current - 1;
      setCurrentIndex(newIndex);
      window.history.go(-1);
      return historyRef.current[newIndex];
    }
    return null;
  }, []);

  const goForward = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      isNavigatingRef.current = true;
      const newIndex = currentIndexRef.current + 1;
      setCurrentIndex(newIndex);
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

        if (stateIndex >= 0 && stateIndex < historyRef.current.length && stateIndex !== currentIndexRef.current) {
          isNavigatingRef.current = true;
          setCurrentIndex(stateIndex);
          setTimeout(() => {
            isProcessingPopStateRef.current = false;
          }, 50);
          return;
        }
      } else if (currentIndexRef.current > 0) {
        isNavigatingRef.current = true;
        setCurrentIndex((prev) => prev - 1);
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

    if (window.history.state === null) {
      window.history.replaceState({ index: 0, type: 'initial', data: null }, '', window.location.href);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return {
    history,
    currentState: history[currentIndex],
    currentIndex,
    pushHistory,
    goBack,
    goForward,
    canGoBack: currentIndex > 0,
    canGoForward: currentIndex < history.length - 1,
  };
};
