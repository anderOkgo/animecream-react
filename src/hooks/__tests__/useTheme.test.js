import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

const mockMatchMedia = (matches) => {
  const listeners = new Set();
  const mql = {
    matches,
    addEventListener: (_, cb) => listeners.add(cb),
    removeEventListener: (_, cb) => listeners.delete(cb),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return { mql, fireChange: (newMatches) => listeners.forEach((cb) => cb({ matches: newMatches })) };
};

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});

describe('useTheme', () => {
  it('defaults to the system preference when nothing is stored', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(true);
  });

  it('prefers a stored preference over the system one', () => {
    mockMatchMedia(true); // system says dark
    localStorage.setItem('themePreference', 'light'); // user chose light
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('toggleDarkMode flips the mode without persisting while following the system default', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleDarkMode());
    expect(result.current.isDarkMode).toBe(true);
    expect(localStorage.getItem('themePreference')).toBeNull();
  });

  it('toggleDarkMode persists once a preference has been explicitly saved', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.saveThemeAsDefault());
    act(() => result.current.toggleDarkMode());
    expect(result.current.isDarkMode).toBe(true);
    expect(localStorage.getItem('themePreference')).toBe('dark');
  });

  it('saveThemeAsDefault stores the current mode and stops following the system', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.saveThemeAsDefault());
    expect(localStorage.getItem('themePreference')).toBe('dark');
  });

  it('restoreSystemDefault clears the stored preference and re-syncs to the system', () => {
    mockMatchMedia(false);
    localStorage.setItem('themePreference', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(true);

    act(() => result.current.restoreSystemDefault());
    expect(localStorage.getItem('themePreference')).toBeNull();
    expect(result.current.isDarkMode).toBe(false);
  });

  it('reacts to a live system preference change while following the system default', () => {
    const { fireChange } = mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(false);

    act(() => fireChange(true));
    expect(result.current.isDarkMode).toBe(true);
  });

  it('applies theme colors to the document root and the theme-color meta tag', () => {
    mockMatchMedia(false);
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);

    const { result } = renderHook(() => useTheme());
    expect(document.documentElement.style.getPropertyValue('--brand-primary')).toBe('#0a4656');
    expect(meta.getAttribute('content')).toBe('#0a4656');

    act(() => result.current.toggleDarkMode());
    expect(document.documentElement.style.getPropertyValue('--text-body')).toBe('#fff');

    document.head.removeChild(meta);
  });
});
