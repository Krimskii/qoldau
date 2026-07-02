/**
 * Vitest setup — очистка env и настройка тестовой БД.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
// Используем отдельный файл SQLite для тестов, чтобы не модифицировать dev.db
process.env.DATABASE_URL = 'file:./prisma/test.db';
process.env.ANTHROPIC_API_KEY = '';
process.env.WHISPER_API_KEY = '';