# Ticket — Codex — v1.6 P1: Multi-tenancy + Authorization (изоляция семей)

> Зона: **только `apps/api/**`** (+ prisma миграции, docs). База: **ветка от P0**
> (`feature/v1.6-be-p0-persistence` @ f8c416d — durable Postgres). Отдельная ветка/PR:
> `feature/v1.6-be-p1-authz`.
> Предпосылка: P0 (Postgres) должен быть влит/задеплоен ДО P1 (P1 добавляет таблицы/связи).
>
> **Проблема, которую закрываем:** сейчас `Child` не имеет владельца, а data-роуты
> `/api/events`, `/api/children`, `/api/recordings` открыты БЕЗ проверки авторизации. Любой
> клиент может читать/писать данные любой семьи. Для мульти-юзера в проде это дыра №1.
> Контракты AI-proxy (`/api/ai`, `/api/stt`, `/api/audio`) НЕ трогать — они остаются как есть.

---

## 1. Модель доступа (schema + миграция)
Добавить в `prisma/schema.prisma` (и `schema.test.prisma`):
- `Child.ownerUserId String` + связь `owner User @relation(...)`. Владелец (обычно родитель).
- Новая модель **`ChildAccess`** — доступ не-владельцев (тьютор/специалист):
  ```
  model ChildAccess {
    id        String   @id @default(cuid())
    userId    String
    childId   String
    role      String   // 'tutor' | 'specialist' | 'parent' (co-parent)
    grantedBy String   // userId владельца, выдавшего доступ
    createdAt DateTime @default(now())
    revokedAt DateTime?
    user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
    child Child @relation(fields: [childId], references: [id], onDelete: Cascade)
    @@unique([userId, childId])
    @@index([userId]) @@index([childId])
    @@map("child_access")
  }
  ```
- Миграция `prisma migrate` (Postgres). Обновить сиды: демо-дети получают `ownerUserId` демо-родителя,
  демо-тьютор/специалист — `ChildAccess`.
- **Backfill:** существующие Child без владельца — привязать к демо/системному юзеру миграцией.

## 2. Auth middleware
- **`requireAuth`** (`middleware/requireAuth.ts`): читает `Authorization: Bearer <jwt>` через
  `authService.verifyJwtHeader`; при невалидном/отсутствующем → **401** `{ ok:false, error:'unauthorized' }`.
  Кладёт `req.user = { id, email, role }` в типизированный `res.locals`/`req`.
- **`requireChildAccess(minRole?)`** (`middleware/requireChildAccess.ts`): извлекает `childId`
  из `req.params` / `req.query` / `req.body`; проверяет, что `req.user` — владелец ИЛИ имеет
  активный `ChildAccess` (revokedAt=null) на этого ребёнка; при отсутствии → **403**
  `{ ok:false, error:'forbidden' }`. Поддержать проверку роли (например, только владелец может
  удалять ребёнка).

## 3. Навесить на data-роуты (scoping)
- `/api/children`:
  - `GET /` → только дети, к которым у `req.user` есть доступ (owner ∪ ChildAccess). Никакого «list all».
  - `GET /:id`, мутации → `requireChildAccess`.
- `/api/events`:
  - `GET /?childId=` → `requireAuth` + `requireChildAccess(childId)`; список только по доступным детям.
  - `GET /:id`, `POST`, `PATCH`, `DELETE` → проверять доступ к `event.childId`.
- `/api/recordings` — аналогично.
- Ревизия `repositories/{events,children,recordings}.ts` — **все** запросы фильтруются по
  доступу; добавить хелпер `assertAccess(userId, childId)`; убрать любые unscoped-выборки.

## 4. Приглашения/доступ (минимум для тьютора/специалиста)
- `POST /api/children/:id/access` (только владелец) → выдать `ChildAccess { userId|email, role }`
  (по email — найти/создать User). `DELETE /api/children/:id/access/:userId` → revoke.
- `GET /api/children/:id/access` → список тех, у кого есть доступ (для владельца).
- (Полноценный email-invite можно отложить в P2 — здесь достаточно выдачи доступа по email.)

## 5. `/api/auth/me`
- Расширить: возвращать `role` и **список доступных `childId`** (owner ∪ ChildAccess), чтобы
  фронт знал, что показывать. Не отдавать чужие данные.

## 6. Обратная совместимость и фронт
- Фронт сейчас local-first и НЕ шлёт JWT на data-роуты. Чтобы не сломать демо:
  - Ввести флаг `REQUIRE_AUTH` (env). В **prod = true** (авторизация обязательна), в dev/demo
    можно `false` (или демо-JWT), чтобы текущий фронт продолжал работать до интеграции sync (P2).
  - Документировать в `docs/API.md`, что data-роуты теперь требуют Bearer JWT в prod.
- НЕ ломать `/api/ai|stt|audio|health|ready` — они без изменений.

## 7. Тесты (обязательно)
- Аноним на data-роут → 401.
- Юзер A на ребёнка юзера B → 403.
- Владелец → 200; тьютор с ChildAccess → 200 на чтение, 403 на запрещённые мутации.
- `GET /api/children` возвращает только доступных детей (не всех).
- Выдача/отзыв доступа работает; revoked теряет доступ.
- Регресс: AI-proxy эндпоинты не затронуты.

## Приёмка
Ни один data-эндпоинт не отдаёт/не меняет данные без валидного JWT и проверки доступа к
конкретному ребёнку; изоляция семей доказана тестами; AI-proxy обратно совместим; миграция
применяется на Postgres; демо-режим не сломан (флаг REQUIRE_AUTH).

## Проверки / отчёт
```
cd apps/api && npm run typecheck && npm test && npm run eval
prisma validate  # обе схемы
git push -u origin feature/v1.6-be-p1-authz
```
Отчёт: схема/миграция; middleware; какие роуты защищены; матрица тестов авторизации
(аноним/чужой/владелец/тьютор × endpoint); подтверждение обратной совместимости AI-proxy и
демо-режима; что осталось для P2 (sync, email-invite).
