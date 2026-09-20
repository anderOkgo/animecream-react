import { useEffect, useState, useCallback } from 'react';

const DISMISS_STORAGE_KEY = 'pwaInstallDismissedAt';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isDismissedRecently = () => {
  const dismissedAt = Number(localStorage.getItem(DISMISS_STORAGE_KEY));
  return Number.isFinite(dismissedAt) && dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
};

// iPadOS 13+ reports as "MacIntel" but, unlike a real Mac, exposes touch points.
const isIosDevice = () => {
  const ua = window.navigator.userAgent;
  const isIpadOnDesktopUA = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || isIpadOnDesktopUA;
};

// Safari is the only iOS browser without a `beforeinstallprompt`-style API;
// Chrome/Firefox/Edge on iOS still route through Safari's engine but expose their own share menu.
const isIosSafari = () => {
  const ua = window.navigator.userAgent;
  return isIosDevice() && /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);
};

// Exposes the deferred `beforeinstallprompt` event so a custom install CTA can be shown,
// plus a flag for iOS Safari, which has no such event and needs manual instructions instead.
export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(isStandalone);
  const [showIosInstructions, setShowIosInstructions] = useState(
    () => isIosSafari() && !isStandalone() && !isDismissedRecently()
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      if (!isDismissedRecently()) {
        setDeferredPrompt(event);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      localStorage.removeItem(DISMISS_STORAGE_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome !== 'accepted') {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    setDeferredPrompt(null);
    setShowIosInstructions(false);
  }, []);

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    showIosInstructions: showIosInstructions && !isInstalled,
    isInstalled,
    promptInstall,
    dismissPrompt,
  };
};
