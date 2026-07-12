import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './hooks/useLanguage';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './Components/ErrorBoundary/ErrorBoundary';
import AppCrashFallback from './Components/ErrorBoundary/AppCrashFallback';
import './index.css';
import '@fontsource/roboto/latin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<AppCrashFallback />}>
      <HelmetProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
