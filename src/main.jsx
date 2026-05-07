import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './hooks/useLanguage';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import '@fontsource/roboto/latin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </HelmetProvider>
  </React.StrictMode>
);
