/**
 * Children repository (v0.5.0) — Prisma + cache.
 */
import { prisma } from '../db/prisma.js';
import { getCache } from '../db/cache.js';

export interface ChildInput {
  id: string;
  name: string;
  age: number;
  diagnosisLabel?: string;
  currentState?: string;
  avatar?: string;
}

export interface ChildRecord extends ChildInput {
  createdAt: Date;
}

const CACHE_TTL_SEC = 60;

function cacheKey(id?: string): string {
  return id ? `children:${id}` : 'children:list';
}

export const childrenRepo = {
  async list(): Promise<ChildRecord[]> {
    const cache = getCache();
    const cached = await cache.get<ChildRecord[]>(cacheKey());
    if (cached) return cached;

    const children = await prisma.child.findMany({ orderBy: { name: 'asc' } });
    const serialized = children.map((c) => ({
      id: c.id,
      name: c.name,
      age: c.age,
      diagnosisLabel: c.diagnosisLabel ?? undefined,
      currentState: c.currentState ?? undefined,
      avatar: c.avatar ?? undefined,
      createdAt: c.createdAt,
    }));
    await cache.set(cacheKey(), serialized, CACHE_TTL_SEC);
    return serialized;
  },

  async get(id: string): Promise<ChildRecord | null> {
    const cache = getCache();
    const cached = await cache.get<ChildRecord>(cacheKey(id));
    if (cached) return cached;

    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) return null;
    const serialized: ChildRecord = {
      id: child.id,
      name: child.name,
      age: child.age,
      diagnosisLabel: child.diagnosisLabel ?? undefined,
      currentState: child.currentState ?? undefined,
      avatar: child.avatar ?? undefined,
      createdAt: child.createdAt,
    };
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
        name: input.name,
        age: input.age,
        diagnosisLabel: input.diagnosisLabel,
        currentState: input.currentState,
        avatar: input.avatar,
      },
    });
    const cache = getCache();
    await cache.clear();
    return {
      id: child.id,
      name: child.name,
      age: child.age,
      diagnosisLabel: child.diagnosisLabel ?? undefined,
      currentState: child.currentState ?? undefined,
      avatar: child.avatar ?? undefined,
      createdAt: child.createdAt,
    };
  },
};