import React from 'react';
import { AppRoutes } from './router';
import { DemoIndicator } from '@/components/layout/DemoIndicator';
import { ToastContainer } from '@/components/ui/ToastContainer';

export const App: React.FC = () => {
  return (
    <>
      <AppRoutes />
      <DemoIndicator />
      <ToastContainer />
    </>
  );
};
