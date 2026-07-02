/**
 * PageLoader (v0.6.7) — fallback для React.lazy routes.
 *
 * Показывается пока lazy chunk грузится. Минималистичный, не блокирует UI.
 */
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-teal animate-spin" />
      <p className="text-xs text-muted">Загружаем…</p>
    </div>
  </div>
);