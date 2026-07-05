# Ticket — Codex — v1.6 Backend Production: durable persistence, real auth, multi-tenancy, sync, security, observability

> Зона: **только `apps/api/**`** (+ `docs/` для рантбуков). База: `integration/v1.5`.
> Контекст: сейчас `apps/api` — «stateless AI proxy» (Whisper + gpt-4o-mini, parse-ru.v4.2,
> hardening готов) с зачаточной персистентностью (Prisma) и auth-каркасом. Для «работает у
> всех пользователей в проде» бэкенд надо довести до реального много-пользовательского
> сервиса. Это БОЛЬШАЯ задача — делить на фазы P0→P4, каждую фазу отдельной веткой/PR,
> каждый PR с `typecheck && test`, чтобы Claude ревьюил по фазам.
>
> **Философия приватности сохраняется:** семейные данные остаются local-first на устройстве;
> бэкенд добавляет ОПЦИОНАЛЬНУЮ облачную синхронизацию/аккаунты, не ломая офлайн-работу.
> Контракты существующих success-ответов не ломать без миграции фронта.

---

## 🔴 P0 — DURABLE PERSISTENCE (критично, блокер прода)
**Проблема:** `prisma/schema.prisma` использует **SQLite `file:./dev.db`**. На Railway
файловая система эфемерна → **ВСЕ данные (events/children/recordings/users/magic_tokens)
стираются при каждом деплое/рестарте.** Сейчас это скрыто тем, что фронт local-first, но
любой серверный стейт нежизнеспособен.

Задача:
1. Перевести Prisma provider на **PostgreSQL**; `DATABASE_URL` → managed Postgres (Railway
   Postgres plugin или Neon). Схема уже помечена «Phase 2: postgresql» — выполнить.
2. Полноценные **миграции** (`prisma migrate`), запуск миграций **на деплое** (release-команда
   в Railway / Dockerfile entrypoint), НЕ `db push`. Зафиксировать в
   `docs/ANDROID_RELEASE_RUNBOOK.md`/новом `docs/BACKEND_DEPLOY.md`.
3. Connection pooling (pgbouncer/Prisma `directUrl`), таймауты, health-проба, что БД доступна.
4. Сиды (`db/seed.ts`) — идемпотентны, не затирают продданные; демо-датасет только для dev.
5. Тесты БД — на отдельной тестовой БД (сейчас `prisma/test.db`), не на dev/prod.

**Приёмка P0:** данные переживают редеплой; миграции применяются автоматически; health
показывает статус БД; тесты зелёные на Postgres (или SQLite для CI + Postgres в staging).

---

## 🟠 P1 — MULTI-TENANCY + AUTHZ (изоляция семей)
**Проблема:** `Child` не имеет владельца (`userId`); data-роуты `/api/events`, `/api/children`,
`/api/recordings` **НЕ проверяют авторизацию** (`routes/events.ts` и др. открыты). Любой мог
бы читать/писать чужие данные. Для мульти-юзера это дыра.

Задача:
1. Модель владения: `User` (есть) ↔ `Child` (добавить `ownerUserId` + связь) ↔ роли
   (parent/tutor/specialist) через связующую таблицу `ChildAccess { userId, childId, role }`
   (тьютор/специалист получают доступ к ребёнку по приглашению, не владеют).
2. **Auth-middleware** `requireAuth` (проверяет `Authorization: Bearer <jwt>` через
   `authService.verifyJwtHeader`) — навесить на ВСЕ data-роуты.
3. **Authz-middleware** `requireChildAccess(role?)` — проверяет, что текущий user имеет доступ
   к `childId` из params/body/query. Каждый запрос events/recordings/children скоупится по
   доступным ребёнкам пользователя. 403 при чужом ресурсе.
4. Ревизия репозиториев (`repositories/events.ts`, `children.ts`, `recordings.ts`) — все
   запросы фильтруются по владельцу/доступу, никакого «list all».
5. Тесты авторизации: аноним→401, чужой ребёнок→403, свой→200; роль тьютора/специалиста —
   только разрешённые действия.

**Приёмка P1:** ни один data-эндпоинт не отдаёт данные без валидного JWT и проверки доступа
к конкретному ребёнку; тесты изоляции зелёные.

---

## 🟡 P2 — AUTH COMPLETION + SYNC API
### P2.1 Завершить magic-link auth
- Сейчас `authService.requestMagicLink` **не шлёт письмо** (dev возвращает токен в ответе).
  Подключить провайдера email (**Resend** или SMTP) за env-флагом; в dev оставить
  `devMagicUrl`, в prod — реальная отправка, токен НЕ в ответе.
- JWT: срок жизни, refresh-токен (или короткий access + re-magic), `/api/auth/logout`
  (инвалидировать), ротация `JWT_SECRET`-совместимо. Rate-limit на auth уже есть — проверить.
- Роль пользователя в JWT; `/api/auth/me` отдаёт роль и доступных детей.

### P2.2 Sync API для local-first фронта
Фронт хранит данные локально (localStorage сторы). Нужен **надёжный двусторонний sync**:
- `GET /api/sync/pull?childId&since=<ts>` → изменения событий/записей с `updatedAt > since`
  (включая soft-deleted — tombstones).
- `POST /api/sync/push` → батч локальных изменений (create/update/delete) с идемпотентностью
  по client-`id` (cuid) и `updatedAt`; сервер разрешает конфликты (last-write-wins по
  `updatedAt` + сохранение проигравшей версии в audit, либо явная стратегия — описать).
- Добавить в схему `updatedAt @updatedAt`, `deletedAt` (soft-delete) на Event/Recording/Child.
- Идемпотентность: повторный push тех же изменений не создаёт дубли.
- Тесты: pull дельты, push с конфликтом, soft-delete распространяется, дубли не создаются.

**Приёмка P2:** реальный вход по email в prod; фронт может синкать локальные данные в облако
и обратно без потерь/дублей; офлайн-first не сломан (sync опционален).

---

## 🟢 P3 — SECURITY + OBSERVABILITY
1. **Секреты:** `OPENAI_API_KEY` и `JWT_SECRET` были засвечены — задокументировать
   **ротацию** (`docs/SECURITY.md`), убедиться, что `.env`/ключи не в индексе (проверено),
   добавить проверку env на старте (частично есть в `config/env.ts` — расширить: fail-fast
   при отсутствии критичных в prod).
2. **Authz-логи и аудит:** структурированный лог (requestId уже есть) для доступа к данным;
   таблица `AuditLog` для чувствительных действий (доступ к ребёнку, экспорт).
3. **Rate-limit per-user** (не только per-IP) на дорогие эндпоинты (ai/parse, stt, audio).
4. **PII:** digest-guard уже централизован — расширить на sync/events (никаких сырых
   транскриптов/имён в аналитические агрегаты). Проверить логи на утечку PII.
5. **Sentry:** DSN сейчас не задан (`SENTRY_DSN not set`). Включить в prod, фильтровать PII,
   алерты на 5xx/квоту OpenAI.
6. **Observability:** `/api/health` (liveness) + `/api/ready` (readiness: БД+миграции),
   базовые метрики (кол-во запросов, латентность OpenAI, fallback-rate, стоимость токенов —
   лог уже пишет usage).
7. **CORS:** ревизия `CORS_ORIGIN` под реальные origin'ы прод-приложения (сейчас dev + app
   origins) — не расширять лишнего.

**Приёмка P3:** ротация задокументирована; авторизованный доступ логируется; Sentry ловит
ошибки без PII; readiness-проба честная; per-user rate-limit работает.

---

## 🔵 P4 — TESTING, CI, RELIABILITY
1. **Integration-тесты**: полный путь auth→create child→push events→pull→authz-изоляция, на
   тестовой БД. Поднять покрытие ключевых модулей.
2. **AI-quality в CI**: `npm run eval` (mock) в CI на каждый PR; `eval:live` — по расписанию/
   вручную с секретом (не в обычном CI — токены). Порог регрессии (fail, если mock <85%).
3. **CI-пайплайн** (GitHub Actions): typecheck + lint + test + prisma migrate check + build
   на PR; отдельный job деплоя.
4. **Reliability:** graceful shutdown (есть) — проверить дренаж соединений; таймауты OpenAI/
   Whisper (есть); ретраи (есть); backpressure на audio-ingest (лимиты есть).
5. **Staging-окружение** на Railway (отдельная ветка/сервис) — чтобы не тестировать на проде
   (урок: тестировали промпт на проде вслепую).

**Приёмка P4:** зелёный CI на PR; интеграционные тесты покрывают auth+sync+authz; eval-порог
в CI; staging доступен.

---

## Порядок и правила
- Фазы строго по порядку P0→P4 (persistence — фундамент для остального).
- Каждая фаза — отдельная ветка `feature/v1.6-be-p0-persistence` … `-p4-ci`, отдельный PR,
  свой отчёт, `typecheck && test` зелёные, контракты не ломать без согласования.
- **НЕ ломать текущий прод** (parse-ru.v4.2 работает): AI-proxy эндпоинты остаются
  обратно совместимыми; персистентность/auth добавляются рядом, не вместо.
- Обновлять `docs/DATA_MODEL.md`, `docs/API.md`, `docs/SECURITY.md`, новый `docs/BACKEND_DEPLOY.md`.

## Отчёт по каждой фазе
Изменённые файлы; миграции; вывод typecheck/test; как проверить (curl/тест); что осталось;
подтверждение обратной совместимости AI-proxy. После P0 — обязательно показать, что данные
переживают редеплой.
