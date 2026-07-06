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
  updatedAt: Date;
  deletedAt?: Date;
}

const CACHE_TTL_SEC = 30;

function cacheKey(childId?: string, childIds?: string[]): string {
  return `recordings:list:${childId ?? childIds?.sort().join(',') ?? 'all'}`;
}

async function invalidateCache(): Promise<void> {
  const cache = getCache();
  await cache.clear(); // Простая инвалидация
}

function serialize(recording: {
  id: string;
  childId: string;
  label: string;
  durationSec: number;
  timestamp: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): RecordingRecord {
  return {
    id: recording.id,
    childId: recording.childId,
    label: recording.label,
    durationSec: recording.durationSec,
    timestamp: recording.timestamp,
    updatedAt: recording.updatedAt,
    deletedAt: recording.deletedAt ?? undefined,
  };
}

export const recordingsRepo = {
  async list(filter?: { childId?: string; childIds?: string[] }): Promise<RecordingRecord[]> {
    const cache = getCache();
    const key = cacheKey(filter?.childId, filter?.childIds);
    const cached = await cache.get<RecordingRecord[]>(key);
    if (cached) return cached;

    const recordings = await prisma.recording.findMany({
      where: {
        deletedAt: null,
        ...(filter?.childId
          ? { childId: filter.childId }
          : filter?.childIds
            ? { childId: { in: filter.childIds } }
            : {}),
      },
      orderBy: { timestamp: 'desc' },
    });

    const serialized = recordings.map(serialize);
    await cache.set(key, serialized, CACHE_TTL_SEC);
    return serialized;
  },

  async get(id: string): Promise<RecordingRecord | null> {
    const recording = await prisma.recording.findUnique({ where: { id } });
    return recording ? serialize(recording) : null;
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
    return serialize(recording);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.recording.update({ where: { id }, data: { deletedAt: new Date() } });
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
