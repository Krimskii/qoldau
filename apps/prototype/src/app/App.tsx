import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { AppRoutes } from './router';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export const App: React.FC = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.minimizeApp();
      }
    });

    StatusBar.setBackgroundColor({ color: '#009688' }).catch(() => {});
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {});

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, []);

  return (
    <>
      <OfflineBanner />
      <AppRoutes />
    </>
  );
};