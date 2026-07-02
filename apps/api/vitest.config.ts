import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 15_000,
    hookTimeout: 30_000,
    setupFiles: ['./test/setup.ts'],
    pool: 'forks', // Prisma не любит shared state между воркерами
  },
});