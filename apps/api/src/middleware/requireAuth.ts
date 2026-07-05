import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { prisma } from '../db/prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function isAuthRequired(): boolean {
  const raw = process.env.REQUIRE_AUTH?.trim().toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return process.env.NODE_ENV === 'production';
}

async function ensureDemoUser(): Promise<AuthUser> {
  const user = await prisma.user.upsert({
    where: { email: 'demo-parent@qoldau.local' },
    create: { id: 'user-demo-parent', email: 'demo-parent@qoldau.local', role: 'parent' },
    update: {},
  });
  return { id: user.id, email: user.email, role: user.role };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader && !isAuthRequired()) {
    req.user = await ensureDemoUser();
    return next();
  }

  const result = authService.verifyJwtHeader(authHeader);
  if (!result.ok) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  req.user = result.user;
  return next();
}
