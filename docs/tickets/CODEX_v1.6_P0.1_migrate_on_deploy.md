# Ticket — Codex — v1.6 P0.1: миграции на деплое (Dockerfile) + сквозная валидация durable persistence

> Зона: **только `apps/api/**`** (Dockerfile, package.json, docs). База: ветка от P0
> (`feature/v1.6-be-p0-persistence`). Ветка/PR: `feature/v1.6-be-p0.1-migrate-deploy`.
> Срочно/блокер: P0 задеплоен на прод (Postgres поднят, `DATABASE_URL`+`DIRECT_DATABASE_URL`
> заданы), контейнер стартует, НО **миграции на деплое не выполняются → таблиц в проде нет.**

## Диагноз (подтверждено)
Текущий `apps/api/Dockerfile` НЕ прогоняет `prisma migrate deploy`:
1. **CMD = `["node", "dist/index.js"]`** — не `start:prod` (который `prisma migrate deploy && node ...`).
2. **`prisma` CLI — это `devDependency`** (`^5.22.0`), а Dockerfile делает `RUN npm prune --omit=dev`
   в builder → CLI удаляется из финального `node_modules` → `prisma migrate deploy` в runner упадёт.
3. **Runner-стадия НЕ копирует `prisma/`** (только `node_modules`, `dist`, `package.json`) →
   нет schema + migrations для `migrate deploy`.

## Задача
Сделать так, чтобы **на каждом деплое автоматически применялись миграции** к managed Postgres,
идемпотентно и безопасно. Реализовать надёжно (выбрать один подход, обосновать):

**Рекомендуемый подход (Dockerfile-only, без внешних release-hook):**
1. В `Dockerfile` runner-стадии:
   - `COPY --from=builder /app/prisma ./prisma` (schema + migrations).
   - Обеспечить наличие `prisma` CLI в runner. Варианты: (a) перенести `prisma` в
     `dependencies`; либо (b) не прунить его (скопировать нужный бинарь); либо (c) ставить
     `prisma` через `npm ci --omit=dev` без прунинга CLI. Выбрать чистый, минимальный по весу.
   - **CMD → `["npm", "run", "start:prod"]`** (уже есть скрипт: `prisma migrate deploy && node dist/index.js`).
2. Убедиться, что `prisma migrate deploy` использует `DIRECT_DATABASE_URL` (direct-connection для
   миграций), а рантайм-клиент — `DATABASE_URL`. Проверить `datasource`/`directUrl` в schema.
3. Стартап при недоступной БД / упавшей миграции — понятный лог + ненулевой exit (чтобы Railway
   не промоутил битый деплой; текущий fail-fast сохранить).
4. Не раздувать образ: prisma engine нужен и так для `@prisma/client` — переиспользовать.

**Альтернатива:** если Railway поддерживает pre-deploy/release command — вынести
`npm run db:deploy` туда, а CMD оставить `start`. Тогда задокументировать точную настройку в
`docs/BACKEND_DEPLOY.md`. Но **по умолчанию должно работать из коробки** через Dockerfile.

## Валидация (обязательно — это то, что не было проверено в P0)
Выполнить «Durable Persistence Check» из `docs/BACKEND_DEPLOY.md` на РЕАЛЬНОМ Railway Postgres:
1. После деплоя: `/api/ready` → `{ readiness:"ready", database:{ ok:true, provider:"postgresql" } }`.
2. `/api/migrate-status` или `npm run db:status` (через Railway Console) → все миграции applied.
3. Создать тестовую запись (child/event) через API.
4. **Redeploy** сервиса.
5. Прочитать ту же запись → **должна остаться** (доказательство durable persistence).
6. AI-proxy (`/api/ai/parse`, `/api/stt`) — регресс: работает как прежде (не зависит от БД).

## Проверки / отчёт
```
cd apps/api && npm run typecheck && npm test
docker build -t qoldau-api . && docker run --rm -e NODE_ENV=production \
  -e DATABASE_URL=... -e DIRECT_DATABASE_URL=... qoldau-api   # локальная проверка старта+миграций
git push -u origin feature/v1.6-be-p0.1-migrate-deploy
```
Отчёт: диффы Dockerfile/package.json; какой подход к prisma CLI выбран и почему; вывод
`/api/ready` с проде; **скрин/лог durable-persistence-check (данные пережили redeploy)**;
подтверждение регресса AI-proxy. Это финально закрывает P0 (durable persistence доказана).
