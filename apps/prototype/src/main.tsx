import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { useAuthStore } from './store/useAuthStore';
import './styles/globals.css';
import './styles/animations.css';

// v0.6.0 — инициализация auth (загрузка JWT из localStorage).
void useAuthStore.getState().init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
