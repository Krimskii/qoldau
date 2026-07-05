import morgan from 'morgan';
import type { Request, Response, NextFunction } from 'express';

morgan.token('request-id', (req: Request) => req.requestId ?? '-');

/**
 * HTTP request logger (morgan).
 * Использует 'combined' формат в продакшене, 'dev' — в dev-режиме.
 */
export const logger = morgan(
  process.env.NODE_ENV === 'production'
    ? ':remote-addr :request-id - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
    : ':method :url :status :response-time ms - :res[content-length] requestId=:request-id',
);

/**
 * Простой request logger для отладки (используется в dev-режиме).
 */
export function debugLog(req: Request, _res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} requestId=${req.requestId ?? '-'}`);
  }
  next();
}
