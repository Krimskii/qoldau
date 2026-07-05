import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export type ChildAccessLevel = 'read' | 'write' | 'owner';

export async function getChildAccess(userId: string, childId: string): Promise<{ ok: boolean; role?: string; owner: boolean }> {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: {
      ownerUserId: true,
      accessList: {
        where: { userId, revokedAt: null },
        select: { role: true },
        take: 1,
      },
    },
  });
  if (!child) return { ok: false, owner: false };
  if (child.ownerUserId === userId) return { ok: true, role: 'owner', owner: true };
  const role = child.accessList[0]?.role;
  return { ok: Boolean(role), role, owner: false };
}

export function canAccess(access: { ok: boolean; role?: string; owner: boolean }, level: ChildAccessLevel): boolean {
  if (!access.ok) return false;
  if (access.owner) return true;
  if (level === 'read') return true;
  if (level === 'write') return access.role === 'parent';
  return false;
}

export async function assertChildAccess(userId: string, childId: string, level: ChildAccessLevel = 'read'): Promise<boolean> {
  return canAccess(await getChildAccess(userId, childId), level);
}

function extractChildId(req: Request): string | undefined {
  const fromParams = typeof req.params.childId === 'string' ? req.params.childId : undefined;
  const fromIdParam = typeof req.params.id === 'string' && req.baseUrl.endsWith('/children') ? req.params.id : undefined;
  const fromQuery = typeof req.query.childId === 'string' ? req.query.childId : undefined;
  const body = req.body as { childId?: unknown } | undefined;
  const fromBody = typeof body?.childId === 'string' ? body.childId : undefined;
  return fromParams ?? fromIdParam ?? fromQuery ?? fromBody;
}

export function requireChildAccess(level: ChildAccessLevel = 'read') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const childId = extractChildId(req);
    if (!user) return res.status(401).json({ ok: false, error: 'unauthorized' });
    if (!childId) return res.status(400).json({ ok: false, error: 'childId required' });
    if (!(await assertChildAccess(user.id, childId, level))) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    return next();
  };
}
