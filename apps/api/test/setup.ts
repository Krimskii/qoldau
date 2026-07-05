/**
 * Vitest setup — очистка env и настройка тестовой БД.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
// Tests generate Prisma Client from prisma/schema.test.prisma (SQLite) and use
// the matching database file below, so production PostgreSQL settings are never touched.
process.env.DATABASE_URL = 'file:./prisma/test.db';
process.env.DIRECT_DATABASE_URL = '';
process.env.ANTHROPIC_API_KEY = '';
process.env.OPENAI_API_KEY = '';
process.env.OPENAI_LLM_MODEL = '';
process.env.WHISPER_API_KEY = '';
