/**
 * Children repository (v0.5.0) — Prisma + cache.
 */
import { prisma } from '../db/prisma.js';
import { getCache } from '../db/cache.js';

export interface ChildInput {
  id: string;
  ownerUserId?: string;
  name: string;
  age: number;
  diagnosisLabel?: string;
  currentState?: string;
  avatar?: string;
}

export interface ChildRecord extends ChildInput {
  createdAt: Date;
  ownerUserId: string;
}

const CACHE_TTL_SEC = 60;

function cacheKey(id?: string): string {
  return id ? `children:${id}` : 'children:list';
}

export const childrenRepo = {
  serialize(child: {
    id: string;
    ownerUserId: string;
    name: string;
    age: number;
    diagnosisLabel: string | null;
    currentState: string | null;
    avatar: string | null;
    createdAt: Date;
  }): ChildRecord {
    return {
      id: child.id,
      ownerUserId: child.ownerUserId,
      name: child.name,
      age: child.age,
      diagnosisLabel: child.diagnosisLabel ?? undefined,
      currentState: child.currentState ?? undefined,
      avatar: child.avatar ?? undefined,
      createdAt: child.createdAt,
    };
  },

  async list(): Promise<ChildRecord[]> {
    const cache = getCache();
    const cached = await cache.get<ChildRecord[]>(cacheKey());
    if (cached) return cached;

    const children = await prisma.child.findMany({ orderBy: { name: 'asc' } });
    const serialized = children.map((c) => childrenRepo.serialize(c));
    await cache.set(cacheKey(), serialized, CACHE_TTL_SEC);
    return serialized;
  },

  async listAccessible(userId: string): Promise<ChildRecord[]> {
    const children = await prisma.child.findMany({
      where: {
        OR: [
          { ownerUserId: userId },
          { accessList: { some: { userId, revokedAt: null } } },
        ],
      },
      orderBy: { name: 'asc' },
    });
    return children.map((c) => childrenRepo.serialize(c));
  },

  async accessibleIds(userId: string): Promise<string[]> {
    const children = await prisma.child.findMany({
      where: {
        OR: [
          { ownerUserId: userId },
          { accessList: { some: { userId, revokedAt: null } } },
        ],
      },
      select: { id: true },
    });
    return children.map((child) => child.id);
  },

  async get(id: string): Promise<ChildRecord | null> {
    const cache = getCache();
    const cached = await cache.get<ChildRecord>(cacheKey(id));
    if (cached) return cached;

    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) return null;
    const serialized = childrenRepo.serialize(child);
    await cache.set(cacheKey(id), serialized, CACHE_TTL_SEC);
    return serialized;
  },

  async upsert(input: ChildInput): Promise<ChildRecord> {
    const child = await prisma.child.upsert({
      where: { id: input.id },
      update: {
        name: input.name,
        age: input.age,
        diagnosisLabel: input.diagnosisLabel,
        currentState: input.currentState,
        avatar: input.avatar,
      },
      create: {
        id: input.id,
        ownerUserId: input.ownerUserId ?? 'user-demo-parent',
        name: input.name,
        age: input.age,
        diagnosisLabel: input.diagnosisLabel,
        currentState: input.currentState,
        avatar: input.avatar,
      },
    });
    const cache = getCache();
    await cache.clear();
    return childrenRepo.serialize(child);
  },

  async grantAccess(input: { childId: string; userId: string; role: string; grantedBy: string }) {
    return prisma.childAccess.upsert({
      where: { userId_childId: { userId: input.userId, childId: input.childId } },
      create: input,
      update: { role: input.role, grantedBy: input.grantedBy, revokedAt: null },
    });
  },

  async revokeAccess(childId: string, userId: string) {
    const updated = await prisma.childAccess.updateMany({
      where: { childId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return updated.count > 0;
  },

  async listAccess(childId: string) {
    return prisma.childAccess.findMany({
      where: { childId, revokedAt: null },
      include: { user: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  },
};
