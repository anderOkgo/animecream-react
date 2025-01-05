import { useState, useEffect } from 'react';
import DataService from '../services/data.service';

// Custom hook for managing application initialization and online status
export const useAlive = () => {
  const [init, setInit] = useState(0); // Indicates if application recived response of server
  const [proc, setProc] = useState(1); // Indicates if initialization process is ongoing
  const [online, setOnline] = useState(true); // Indicates if application is online

  useEffect(() => {
    //boot();

    // If online and not initialized, trigger the boot process
    if (online && !init) setProc(true) & boot() & setProc(false);

    // Event handlers for online, offline, and visibility change events
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false) & boot();
    const handleVisibilityChange = () => document.visibilityState === 'visible' && boot();

    // Add event listeners for online, offline, and visibility change events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to remove event listeners when component unmounts or dependencies change
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [init, online]);

  const boot = async () => {
    const resp = await DataService.boot();
    setInit(resp?.err ? false : true);
  };

  return { init, setInit, proc, setProc, boot };
};
