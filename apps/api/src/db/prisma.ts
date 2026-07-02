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