# Ticket — MiniMax — v2.0 (~2ч): SQLite за интерфейсом EventStorage

> ⚠️ Только после Wave 0/1 фидбека (STRATEGY: фичи после волн). Требует, чтобы
> `EventStorage` (v1.5 Коммит B) уже был. Зона: **только `apps/prototype/**`** (+ Capacitor native config).

Триггер перехода (STRATEGY §6.3): лента > ~2–3 тыс. событий ИЛИ жалобы на потерю данных
ИЛИ нужны запросы для паттернов. До этого — не трогать.

```
git switch integration/v1.5 && git pull
git switch -c feature/v2.0-sqlite
```

## Задачи
1. Установить `@capacitor-community/sqlite`; native-конфиг (Android) через `cap sync`.
2. `src/lib/storage/sqliteEventStorage.ts` — реализация `EventStorage` поверх SQLite:
   таблица events (id PK, childId, type, occurredAt, recordedAt, source, payload JSON,
   abc JSON, sensoryContext JSON, deleted). `query` → SQL WHERE по childId/type/occurredAt.
3. **Выбор реализации**: на нативной платформе (Capacitor.isNativePlatform()) → SQLite;
   в вебе → текущая localStorage-реализация. Единая точка `eventStorage`.
4. **Миграция localStorage→SQLite** один раз при старте: если SQLite пуст и localStorage
   есть события — импортировать, пометить флагом миграции. localStorage не удалять
   (бэкап), но читать из SQLite.
5. Тесты: put/query/soft-delete на SQLite (или мок-адаптер в web-тестах).

## Проверки / отчёт
```
cd apps/prototype && npm run typecheck && npm test && npm run build
```
Отчёт: файлы; на устройстве лента переживает перезапуск; веб работает как раньше;
страницы НЕ менялись (только реализация за EventStorage).
