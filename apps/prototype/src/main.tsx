import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { App } from './app/App';
import { useAuthStore } from './store/useAuthStore';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { sentry } from './utils/sentry';
import './i18n/config';
import './styles/globals.css';
import './styles/animations.css';
import './styles/sensory.css';

// v0.7.3: Sentry init (opt-in через VITE_SENTRY_DSN, должен быть ПЕРВЫМ).
sentry.init();

// v0.6.0 — инициализация auth (загрузка JWT из localStorage).
void useAuthStore.getState().init();

// PWA Service Worker — только в браузере. В Capacitor/Android приложение уже
// нативно упаковано (все ассеты локальные), SW-кэш там не нужен и лишний.
if (!Capacitor.isNativePlatform()) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
