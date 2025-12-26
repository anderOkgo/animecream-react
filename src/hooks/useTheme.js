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
      '--main-color': '#0a4656',
      '--second-color': '#d4f1f7',
      '--third-color': '#0e6179',
      '--fourth-color': '#0a4656',
      '--soft-green': ' #337ab7',
      '--white': '#fff',
      '--black': '#000',
      '--soft-gray': '#ccc',
      '--dark-gray': '#333',
      '--light-gray': '#eee8e8',
      '--background': '#f1f0f7',
      '--text': '#000',
      '--text-alt': '#fff',
    };

    const darkModeColors = {
      '--main-color': '#0a4656',
      '--second-color': '#367bb9', // Slightly darker secondary color
      '--third-color': '#296b7f',
      '--fourth-color': '#c7f2ff',
      '--soft-green': ' #337ab7',
      '--white': '#fff', // Change white to dark gray
      '--black': '#000', // Reverse black and white
      '--soft-gray': '#444',
      '--dark-gray': '#222',
      '--light-gray': '#555',
      '--background': '#121212',
      '--text': '#fff',
      '--text-alt': '#000000',
    };

    const colors = isDarkMode ? darkModeColors : lightModeColors;

    // Apply colors to the root element
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value);
    }

    // Update the theme color for the browser's UI (meta tag)
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', colors['--main-color']);
    }
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleDarkMode,
    saveThemeAsDefault,
    restoreSystemDefault,
  };
};
