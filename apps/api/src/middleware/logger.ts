import morgan from 'morgan';
import type { Request, Response, NextFunction } from 'express';

/**
 * HTTP request logger (morgan).
 * Использует 'combined' формат в продакшене, 'dev' — в dev-режиме.
 */
export const logger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
);

/**
 * Простой request logger для отладки (используется в dev-режиме).
 */
export function debugLog(req: Request, _res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
}