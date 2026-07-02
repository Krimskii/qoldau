/**
 * OfflineBanner (v0.6.7) — показывает баннер когда navigator.onLine === false.
 *
 * Простой component, не использует SW detection (только браузерный API).
 * Появляется сверху с safe-area-inset-top padding.
 */
import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { AppIcon } from './AppIcon';

export const OfflineBanner: React.FC = () => {
  const [online, setOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[60] bg-coral text-white shadow-card-hover"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-[430px] mx-auto flex items-center gap-2 px-4 py-2.5">
        <AppIcon component={WifiOff} size={16} colorClass="text-white" />
        <p className="text-xs font-bold leading-tight">
          Нет сети. Приложение работает в offline-режиме (последние данные).
        </p>
      </div>
    </div>
  );
};