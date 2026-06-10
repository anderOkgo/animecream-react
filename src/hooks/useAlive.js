import { useState, useEffect, useRef, useCallback } from 'react';
import DataService from '../services/data.service';

// Custom hook for managing application initialization and online status
export const useAlive = () => {
  const [init, setInitState] = useState(0); // Indicates if application received response of server
  const [proc, setProc] = useState(true); // Indicates if initialization process is ongoing
  const [online, setOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true); // Indicates if application is online

  const isOnlineRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Synchronized setter for init state to keep isOnlineRef in sync instantly
  const setInit = useCallback((val) => {
    isOnlineRef.current = !!val;
    setInitState(val);
  }, []);

  const boot = useCallback(async (showLoader = false) => {
    if (isFetchingRef.current) return isOnlineRef.current;
    isFetchingRef.current = true;
    if (showLoader) setProc(true);
    try {
      const resp = await DataService.boot();
      const success = !resp?.err;
      setInit(success ? Date.now() : false);
      setOnline(success);
      return success;
    } catch (err) {
      setInit(false);
      setOnline(false);
      return false;
    } finally {
      isFetchingRef.current = false;
      if (showLoader) setProc(false);
    }
  }, [setInit]);

  useEffect(() => {
    // If we are online and not yet initialized, trigger the boot process with loader
    if (!isOnlineRef.current) {
      boot(true);
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Reconnection logic with retries (backoff) to handle cellular/mobile data delays
    const attemptReconnect = async () => {
      if (isOnlineRef.current) return;

      // Try immediately
      let success = await boot(false);
      if (success) return;

      // Retry after 1s, 3s, 5s
      const delays = [1000, 3000, 5000];
      for (const delay of delays) {
        if (isOnlineRef.current) return;
        await sleep(delay);
        if (isOnlineRef.current) return;
        success = await boot(false);
        if (success) return;
      }
    };

    // Event handlers for online, offline, and visibility change events
    const handleOnline = () => {
      setOnline(true);
      attemptReconnect();
    };

    const handleOffline = () => {
      setOnline(false);
      setInit(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isOnlineRef.current) {
        boot(false);
      }
    };

    // Listen to network connection type/quality changes if supported
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const handleConnectionChange = () => {
      attemptReconnect();
    };

    // Add event listeners for online, offline, visibility change, and connection changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Periodic check every 15 seconds if currently offline/uninitialized
    const intervalId = setInterval(() => {
      if (!isOnlineRef.current) {
        boot(false);
      }
    }, 15000);

    // Cleanup function to remove event listeners and clear interval
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      clearInterval(intervalId);
    };
  }, [boot, setInit]);

  return { init, setInit, proc, setProc, boot };
};

