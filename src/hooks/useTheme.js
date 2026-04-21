import { useEffect, useState } from 'react';

// Helper functions for localStorage
const getStoredTheme = () => {
  const stored = localStorage.getItem('themePreference');
  if (stored === null) return null;
  return stored === 'dark';
};

const setStoredTheme = (isDark) => {
  localStorage.setItem('themePreference', isDark ? 'dark' : 'light');
};

const removeStoredTheme = () => {
  localStorage.removeItem('themePreference');
};

const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Custom React hook for managing theme state
export const useTheme = () => {
  // Initialize: check localStorage first, then system preference
  const storedTheme = getStoredTheme();
  const systemTheme = getSystemTheme();
  const initialTheme = storedTheme ?? systemTheme;

  const [isDarkMode, setIsDarkMode] = useState(initialTheme);
  const [useSystemDefault, setUseSystemDefault] = useState(storedTheme === null);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    // If not using system default, update stored preference
    if (!useSystemDefault) {
      setStoredTheme(newMode);
    }
  };

  // Function to save current theme as default
  const saveThemeAsDefault = () => {
    setStoredTheme(isDarkMode);
    setUseSystemDefault(false);
  };

  // Function to restore system default
  const restoreSystemDefault = () => {
    removeStoredTheme();
    setUseSystemDefault(true);
    const systemTheme = getSystemTheme();
    setIsDarkMode(systemTheme);
  };

  // Effect hook to monitor system preference changes (only if using system default)
  useEffect(() => {
    if (!useSystemDefault) {
      // If not using system default, stop listening to system changes
      return;
    }

    // When using system default, sync with current system preference
    const systemTheme = getSystemTheme();
    setIsDarkMode(systemTheme);

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event) => {
      setIsDarkMode(event.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, [useSystemDefault]);

  // Effect hook to apply theme styles
  useEffect(() => {
    const root = document.documentElement;

    // Define colors for light and dark modes based on the existing CSS palette
    const lightModeColors = {
      '--brand-primary': '#0a4656',
      '--brand-secondary': '#d4f1f7',
      '--brand-accent': '#0e6179',
      '--text-heading': '#0a4656',
      '--color-success': ' #337ab7',
      '--white': '#fff',
      '--black': '#000',
      '--border-subtle': '#ccc',
      '--surface-dark': '#333',
      '--surface-light': '#eee8e8',
      '--bg-surface': '#f1f0f7',
      '--text-body': '#000',
      '--text-invert': '#fff',
      '--color-highlight': '#f5c518',
      '--shadow-sm': '0 4px 12px rgba(0, 0, 0, 0.12)',
      '--shadow-md': '0 8px 18px rgba(0, 0, 0, 0.2)',
      '--focus-ring': '0 0 0 3px rgba(10, 70, 86, 0.15)',
      '--bg-overlay': 'rgba(0, 0, 0, 0.6)',
      '--color-danger': '#dc3545',
      '--color-danger-hover': '#c82333',
      '--color-warning': '#ffc107',
      '--white-alpha-20': 'rgba(255, 255, 255, 0.2)',
      '--ts-main': '0 0 2px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.3)',
      '--border-primary': '1px solid var(--brand-primary)',
      '--border-invert': '1px solid var(--white)',
      '--border-secondary': '1px solid var(--border-subtle)',
      '--ts-inset': '-1px -1px 1px var(--brand-secondary), 2px 2px 1px var(--black)',
      '--bg-overlay-subtle': 'rgba(255, 255, 255, 0.05)',
      '--sidebar-shadow': '5px 0 15px rgba(0, 0, 0, 0.08)',
    };

    const darkModeColors = {
      '--brand-primary': '#0a4656',
      '--brand-secondary': '#367bb9',
      '--brand-accent': '#296b7f',
      '--text-heading': '#c7f2ff',
      '--color-success': ' #337ab7',
      '--white': '#fff',
      '--black': '#000',
      '--border-subtle': '#444',
      '--surface-dark': '#222',
      '--surface-light': '#555',
      '--bg-surface': '#121212',
      '--text-body': '#fff',
      '--text-invert': '#000000',
      '--color-highlight': '#f5c518',
      '--shadow-sm': '0 4px 12px rgba(255, 255, 255, 0.1)',
      '--shadow-md': '0 0 7px rgba(14, 97, 121, 0.45), 0 0 11px rgba(14, 97, 121, 0.3), 0 0 15px rgba(14, 97, 121, 0.2), 0 4px 8px rgba(14, 97, 121, 0.35), inset 0 0 0 1px rgba(14, 97, 121, 0.2)',
      '--focus-ring': '0 0 0 3px rgba(199, 242, 255, 0.2)',
      '--bg-overlay': 'rgba(0, 0, 0, 0.8)',
      '--color-danger': '#ff5252',
      '--color-danger-hover': '#ff1744',
      '--color-warning': '#ffd740',
      '--white-alpha-20': 'rgba(255, 255, 255, 0.1)',
      '--ts-main': '0 2px 4px rgba(0, 0, 0, 0.6)',
      '--border-primary': '1px solid var(--brand-primary)',
      '--border-invert': '1px solid var(--white)',
      '--border-secondary': '1px solid var(--border-subtle)',
      '--ts-inset': '-1px -1px 1px var(--brand-secondary), 2px 2px 1px var(--black)',
      '--bg-overlay-subtle': 'rgba(20, 20, 20, 0.05)',
      '--sidebar-shadow': '5px 0 25px rgba(0, 0, 0, 0.4)',
    };

    const colors = isDarkMode ? darkModeColors : lightModeColors;

    // Apply colors to the root element
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value);
    }

    // Update the theme color for the browser's UI (meta tag)
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', colors['--brand-primary']);
    }
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleDarkMode,
    saveThemeAsDefault,
    restoreSystemDefault,
  };
};


