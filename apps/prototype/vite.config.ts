import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@qoldau/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // v0.6.3: code splitting — выделяем крупные зависимости в отдельные чанки
    // чтобы убрать 500kB warning и улучшить кеширование между деплоями.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('react-router') || id.includes('zustand')) {
              return 'app-vendor';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
