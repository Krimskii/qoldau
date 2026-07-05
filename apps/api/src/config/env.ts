export const DEFAULT_JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT_DEFAULT ?? '256kb';
export const DEFAULT_AUDIO_JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT_AUDIO ?? '35mb';
export const DEFAULT_MAX_TRANSCRIPT_CHARS = 4000;
export const DEFAULT_OPENAI_TIMEOUT_MS = 30_000;
export const DEFAULT_OPENAI_MAX_RETRIES = 2;
export const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10_000;

export function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    console.warn(`[env] ${name} must be a positive integer; using default ${fallback}`);
    return fallback;
  }
  return parsed;
}

export function readNonNegativeIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) {
    console.warn(`[env] ${name} must be a non-negative integer; using default ${fallback}`);
    return fallback;
  }
  return parsed;
}

export function assertEnv(): void {
  readPositiveIntEnv('PORT', 4000);
  readPositiveIntEnv('OPENAI_TIMEOUT_MS', DEFAULT_OPENAI_TIMEOUT_MS);
  readNonNegativeIntEnv('OPENAI_MAX_RETRIES', DEFAULT_OPENAI_MAX_RETRIES);
  readPositiveIntEnv('MAX_TRANSCRIPT_CHARS', DEFAULT_MAX_TRANSCRIPT_CHARS);
  readPositiveIntEnv('SHUTDOWN_TIMEOUT_MS', DEFAULT_SHUTDOWN_TIMEOUT_MS);

  if (process.env.NODE_ENV === 'production' && !process.env.OPENAI_API_KEY?.trim()) {
    console.warn('[env] NODE_ENV=production but OPENAI_API_KEY is empty; AI will run in mock mode');
  }
}
