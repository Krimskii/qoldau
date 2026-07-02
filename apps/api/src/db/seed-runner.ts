/**
 * Seed runner (v0.5.0) — обёртка для вызова seed-логики из index.ts.
 *
 * Используется при старте сервера. Прямой CLI-runner — в seed.ts.
 */
import { seed } from './seed.js';

export async function runSeed(): Promise<void> {
  await seed();
}