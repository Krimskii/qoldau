/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  // Required for the Capacitor Android build — assets are loaded via a local
  // scheme (not http://), so absolute '/assets/...' paths would 404. Keep this
  // even if this file gets regenerated; without it the Android APK white-screens.
  base: './',
  plugins: [
    react(),
    // v0.6.7: PWA с autoUpdate. Service worker генерируется при build.
    // В dev отключён чтобы не мешать HMR.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['qoldau-logo.svg', 'manifest.webmanifest'],
      manifest: false, // используем свой manifest.webmanifest
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        runtimeCaching: [
          {
            // API GET responses — NetworkFirst (свежие, fallback cache)
            urlPattern: /^https?:\/\/.*\/api\/(events|recordings|children|health)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'qoldau-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // AI/STT — NetworkOnly (не кешируем дорогие ответы)
            urlPattern: /^https?:\/\/.*\/api\/(ai|stt)\//,
            handler: 'NetworkOnly',
          },
          {
            // Изображения — CacheFirst
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'qoldau-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10_000,
  },
  build: {
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