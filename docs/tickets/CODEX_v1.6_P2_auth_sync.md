# Ticket — Codex — v1.6 P2: Auth completion (email) + Sync API (local-first ↔ cloud)

> Зона: **только `apps/api/**`** (+ prisma миграции, docs). База: `origin/integration/v1.5`
> (там P0+P0.1+P0.2+P1 — Postgres, migrate-on-deploy, authz). Ветка/PR: `feature/v1.6-be-p2-auth-sync`.
> Предпосылки готовы: прод на Postgres, `/api/ready`=200, P1 authz enforce'ит (data-роуты→401).
> **Не ломать:** AI-proxy (`/api/ai|stt|audio`), контракты health/ready, демо-режим (флаги).
> Миграции применяются автоматически на деплое (start:prod). Помни ESM: **все относительные
> импорты с `.js`** (иначе `node dist` крашится — vitest это НЕ ловит; проверяй сборкой).

---

## ЧАСТЬ A — Завершить auth (реальный вход)
Сейчас `authService.requestMagicLink` **не шлёт письмо** (dev возвращает токен в ответе);
JWT без refresh/logout.

1. **Email-доставка magic-link** за env-флагом `EMAIL_PROVIDER` (`resend` | `smtp` | `none`):
   - prod: реальная отправка (Resend API `RESEND_API_KEY`, либо SMTP env). Токен НЕ в ответе.
   - dev/`none`: как сейчас — `devMagicUrl`/токен в ответе (демо без почты).
   - Письмо: короткое, ссылка `${APP_URL}/#/auth/verify?token=...`, TTL из MagicToken.
2. **JWT-сессии:** access-JWT (короткий TTL, напр. 30 мин) + **refresh** (либо refresh-токен в
   БД с ротацией, либо повторный magic-link). `POST /api/auth/refresh`, `POST /api/auth/logout`
   (инвалидация: blacklist/refresh-revoke). `/api/auth/me` (из P1) отдаёт role+childIds.
3. **Rate-limit** на auth уже есть — проверить, добавить на refresh.
4. Тесты: request→(email mock)→verify→access+refresh; refresh продлевает; logout инвалидирует;
   протухший access→401.

## ЧАСТЬ B — Sync API (главное: local-first ↔ cloud)
Фронт хранит данные локально (localStorage). Нужен надёжный двусторонний sync, чтобы данные
семьи жили в облаке (Postgres) и синхронизировались между устройствами/ролями.

### B1. Схема (миграция)
- Добавить на **Event, Recording, Child**: `updatedAt DateTime @updatedAt`, `deletedAt DateTime?`
  (soft-delete). Индексы по `(childId, updatedAt)`.
- Клиентский `id` (cuid) остаётся первичным — идемпотентность по нему.
- Миграция `prisma migrate` (Postgres), backfill `updatedAt = createdAt/timestamp` для старых.

### B2. Endpoints (за `requireAuth` + `requireChildAccess`)
- **`GET /api/sync/pull?childId=&since=<ISO|0>`** → все изменения (create/update/delete-tombstone)
  с `updatedAt > since` по доступным ребёнку сущностям. Ответ: `{ events:[], recordings:[],
  children:[], serverTime }` (deleted помечены `deletedAt`). Пагинация/лимит на большой since=0.
- **`POST /api/sync/push`** → батч локальных изменений:
  ```
  { childId, changes: { events:[...], recordings:[...] } }  // каждый элемент с id, updatedAt, deletedAt?
  ```
  Сервер применяет **идемпотентно по `id`**; **конфликт = last-write-wins по `updatedAt`**
  (описать в docs; проигравшую версию можно писать в AuditLog для восстановления). Возврат:
  `{ applied:[], conflicts:[], serverTime }`.
- Валидация zod (как в hardening), лимиты размера батча.

### B3. Семантика
- Идемпотентность: повторный push тех же изменений НЕ создаёт дубли.
- Soft-delete распространяется через pull (tombstone), клиент удаляет локально.
- Владелец/доступ: sync только по доступным ребёнку (P1 `requireChildAccess`).
- Не смешивать семьи: всё скоупится по childId + доступу.
- Тесты: pull-дельта по since; push create/update/delete; конфликт LWW; дубли не создаются;
  чужой ребёнок→403; tombstone доходит.

## ЧАСТЬ C — Email-инвайты доступа (завершить P1)
P1 даёт выдачу `ChildAccess` по userId/email. P2 — реальное приглашение:
- `POST /api/children/:id/access` по email незарегистрированного → создать pending-инвайт +
  отправить письмо-приглашение (тот же EMAIL_PROVIDER); при первом входе привязать доступ.
- `DELETE .../access/:userId` (revoke) — уже есть, проверить.

## Обратная совместимость / фронт
- Демо-режим: без токена фронт продолжает local-first (P1 `REQUIRE_AUTH` флаг). Sync-эндпоинты
  требуют auth — в демо просто не вызываются.
- Задокументировать в `docs/API.md` sync-контракт (pull/push форматы, LWW, tombstones) —
  фронт (E-раунд) будет интегрировать.

## Env (новые)
`EMAIL_PROVIDER`, `RESEND_API_KEY` (или SMTP_*), `APP_URL` (для ссылок), refresh-TTL настройки.
Обновить `.env.example` + `docs/BACKEND_DEPLOY.md`.

## Проверки / отчёт
```
cd apps/api && npm run typecheck && npm test && npm run eval
# ОБЯЗАТЕЛЬНО проверить прод-ESM: npm run build && node dist/index.js стартует без ERR_MODULE_NOT_FOUND
prisma validate  # обе схемы
git push -u origin feature/v1.6-be-p2-auth-sync
```
Отчёт: схема/миграция (updatedAt/deletedAt); auth-flow (email за флагом, refresh/logout);
sync pull/push контракт + матрица тестов (дельта/конфликт/идемпотентность/authz/tombstone);
подтверждение: `node dist/index.js` стартует (ESM ок), AI-proxy регресс, демо не сломан.
Что осталось на фронт-интеграцию sync (следующий MiniMax-раунд).
