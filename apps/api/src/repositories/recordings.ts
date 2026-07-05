/**
 * Recordings repository (v0.5.0) — Prisma + cache layer.
 */
import { prisma } from '../db/prisma.js';
import { getCache } from '../db/cache.js';

export interface RecordingInput {
  childId: string;
  label: string;
  durationSec: number;
}

export interface RecordingRecord extends RecordingInput {
  id: string;
  timestamp: Date;
}

const CACHE_TTL_SEC = 30;

function cacheKey(childId?: string, childIds?: string[]): string {
  return `recordings:list:${childId ?? childIds?.sort().join(',') ?? 'all'}`;
}

async function invalidateCache(): Promise<void> {
  const cache = getCache();
  await cache.clear(); // Простая инвалидация
}

export const recordingsRepo = {
  async list(filter?: { childId?: string; childIds?: string[] }): Promise<RecordingRecord[]> {
    const cache = getCache();
    const key = cacheKey(filter?.childId, filter?.childIds);
    const cached = await cache.get<RecordingRecord[]>(key);
    if (cached) return cached;

    const recordings = await prisma.recording.findMany({
      where: filter?.childId
        ? { childId: filter.childId }
        : filter?.childIds
          ? { childId: { in: filter.childIds } }
          : undefined,
      orderBy: { timestamp: 'desc' },
    });

    await cache.set(key, recordings, CACHE_TTL_SEC);
    return recordings;
  },

  async get(id: string): Promise<RecordingRecord | null> {
    return prisma.recording.findUnique({ where: { id } });
  },

  async create(input: RecordingInput): Promise<RecordingRecord> {
    const recording = await prisma.recording.create({
      data: {
        childId: input.childId,
        label: input.label,
        durationSec: input.durationSec,
        timestamp: new Date(),
      },
    });
    await invalidateCache();
    return recording;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.recording.delete({ where: { id } });
      await invalidateCache();
      return true;
    } catch {
      return false;
    }
  },

  async count(): Promise<number> {
    return prisma.recording.count();
  },

  async clearAll(): Promise<number> {
    const { count } = await prisma.recording.deleteMany();
    await invalidateCache();
    return count;
  },
};
