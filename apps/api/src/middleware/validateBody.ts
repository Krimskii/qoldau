import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ZodError } from 'zod';

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        ok: false,
        error: result.error.issues[0]?.message ?? 'Invalid request body',
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

export function zodErrorToResponse(error: ZodError) {
  return {
    ok: false,
    error: error.issues[0]?.message ?? 'Invalid request body',
    issues: error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}
