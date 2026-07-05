import type { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id')?.trim();
  req.requestId = incoming || nanoid(12);
  res.setHeader('x-request-id', req.requestId);
  next();
}
