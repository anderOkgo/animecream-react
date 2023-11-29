import { useState, useEffect } from 'react';
import DataService from '../services/data.service';

export const useAlive = () => {
  const [init, setInit] = useState(0);
  const [proc, setProc] = useState(1);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const boot = async () => {
      const resp = await DataService.boot();
      setInit(resp?.err ? false : true);
    };

    if (online && !init) setProc(true) & boot().finally(() => setProc(false));

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false) & boot();
    const handleVisibilityChange = () => document.visibilityState === 'visible' && boot();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [init, online]);

  return { init, setInit, proc, setProc };
};
