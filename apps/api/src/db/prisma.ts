/**
 * Prisma client singleton (v0.5.0).
 *
 * В dev режиме сохраняем client в globalThis, чтобы не плодить новые
 * подключения при hot-reload (tsx watch).
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/** Graceful shutdown для корректного завершения. */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

export async function checkDatabase(): Promise<{ ok: boolean; provider: 'postgresql' | 'sqlite-test'; latencyMs: number; error?: string }> {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      provider: process.env.NODE_ENV === 'test' ? 'sqlite-test' : 'postgresql',
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    return {
      ok: false,
      provider: process.env.NODE_ENV === 'test' ? 'sqlite-test' : 'postgresql',
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : 'database check failed',
    };
  }
}
