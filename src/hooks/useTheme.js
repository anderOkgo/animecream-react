import { useEffect, useState } from 'react';

// Custom React hook for managing theme state
export const useTheme = () => {
  // State to manage dark mode, initialized based on system preference
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Effect hook to monitor system preference changes
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event) => {
      setIsDarkMode(event.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Effect hook to apply theme styles
  useEffect(() => {
    const root = document.documentElement;

    // Define colors for light and dark modes based on the existing CSS palette
    const lightModeColors = {
      '--main-color': '#0a4656',
      '--second-color': '#d4f1f7',
      '--third-color': '#0e6179',
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
      '--third-color': '#0e6179',
      '--soft-green': ' #337ab7',
      '--white': '#fff', // Change white to dark gray
      '--black': '#000', // Reverse black and white
      '--soft-gray': '#444',
      '--dark-gray': '#222',
      '--light-gray': '#555',
      '--background': '#121212', // Dark mode background
      '--text': '#fff', // Light text on dark background
      '--text-alt': '#00000045',
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
  };
};
