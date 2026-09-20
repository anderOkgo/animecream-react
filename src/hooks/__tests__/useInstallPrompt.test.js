import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInstallPrompt } from '../useInstallPrompt';

const mockMatchMedia = (matches) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches });
};

const createBeforeInstallPromptEvent = (outcome = 'accepted') => {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  event.prompt = vi.fn();
  event.userChoice = Promise.resolve({ outcome });
  return event;
};

const IOS_SAFARI_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IOS_CHROME_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0 Mobile/15E148 Safari/604.1';

const mockUserAgent = (ua) => {
  Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
};

beforeEach(() => {
  localStorage.clear();
  mockMatchMedia(false);
  mockUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36'
  );
});

describe('useInstallPrompt', () => {
  it('starts without an install prompt available', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
  });

  it('exposes the deferred prompt once beforeinstallprompt fires', () => {
    const { result } = renderHook(() => useInstallPrompt());
    act(() => {
      window.dispatchEvent(createBeforeInstallPromptEvent());
    });
    expect(result.current.canInstall).toBe(true);
  });

  it('promptInstall triggers the native prompt and clears it afterwards', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const event = createBeforeInstallPromptEvent('accepted');
    act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(event.prompt).toHaveBeenCalled();
    expect(result.current.canInstall).toBe(false);
    expect(localStorage.getItem('pwaInstallDismissedAt')).toBeNull();
  });

  it('remembers a dismissal and does not surface the prompt again within the cooldown', () => {
    const { result, unmount } = renderHook(() => useInstallPrompt());
    act(() => {
      window.dispatchEvent(createBeforeInstallPromptEvent());
    });
    act(() => result.current.dismissPrompt());
    expect(result.current.canInstall).toBe(false);
    expect(localStorage.getItem('pwaInstallDismissedAt')).not.toBeNull();
    unmount();

    const { result: secondResult } = renderHook(() => useInstallPrompt());
    act(() => {
      window.dispatchEvent(createBeforeInstallPromptEvent());
    });
    expect(secondResult.current.canInstall).toBe(false);
  });

  it('marks the app as installed on appinstalled and clears any dismissal', () => {
    localStorage.setItem('pwaInstallDismissedAt', String(Date.now()));
    const { result } = renderHook(() => useInstallPrompt());
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(result.current.isInstalled).toBe(true);
    expect(localStorage.getItem('pwaInstallDismissedAt')).toBeNull();
  });

  it('shows iOS instructions on iOS Safari, which has no beforeinstallprompt event', () => {
    mockUserAgent(IOS_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.showIosInstructions).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('does not show iOS instructions for other iOS browsers (e.g. Chrome on iOS)', () => {
    mockUserAgent(IOS_CHROME_UA);
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.showIosInstructions).toBe(false);
  });

  it('does not show iOS instructions when already running standalone', () => {
    mockUserAgent(IOS_SAFARI_UA);
    mockMatchMedia(true);
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.showIosInstructions).toBe(false);
  });

  it('dismissPrompt hides the iOS instructions and remembers the dismissal', () => {
    mockUserAgent(IOS_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.showIosInstructions).toBe(true);
    act(() => result.current.dismissPrompt());
    expect(result.current.showIosInstructions).toBe(false);
    expect(localStorage.getItem('pwaInstallDismissedAt')).not.toBeNull();
  });
});
