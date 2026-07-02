# Demo Flow QA (v0.7.4)

> Результаты проверки главного demo-flow перед показом инвестору, родителям, тьюторам и специалистам.
> Дата: 2026-07-02. Версия: v0.7.4.

## 1. Скоуп проверки

Главный demo-flow (16 экранов в 4 ролях):

**Parent (6):**
1. `/parent/home` — ParentHome
2. `/parent/voice` — VoiceObservation
3. `/parent/ai-review` — AIReview
4. `/parent/events` — EventTimeline
5. `/parent/events/:eventId` — EventDetails
6. `/parent/profile` — ParentProfile

**Child (5):**
7. `/child/home` — ChildHome
8. `/child/cards` — ChildCards
9. `/child/favorites` — ChildFavorites
10. `/child/speak` — ChildSpeak
11. `/child/phrase-builder` — PhraseBuilderPage

**Tutor (3):**
12. `/tutor/home` — TutorHome
13. `/tutor/ai-review` — TutorAIReview
14. `/tutor/report` — TutorReport

**Specialist (1):**
15. `/specialist/dashboard` — SpecialistDashboard
16. `/specialist/communication-profile` — CommunicationProfile

**Entry:**
- `/` → `/overview` (landing)
- `/overview` — выбор роли (Родитель / Ребёнок / Тьютор) + "Запустить демо"

## 2. Чек-лист QA

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Все кнопки работают (нет мёртвых) | ✅ Pass | VoiceObservation → AIReview → ClarifyingQuestions → EventTimeline, BottomNav 5/4/3 items по роли |
| 2 | Нет тупиков (можно вернуться назад) | ✅ Pass | PageHeader showBack на focus-экранах (VoiceObservation, AIReview, ClarifyingQuestions, EventDetails). BottomNav с Главная в каждой роли. |
| 3 | BottomNav не перекрывает контент | ⚠️ Условно | AppShell: `pb-28` (112px) под BottomNav с safe-area. На focus-экранах BottomNav скрыт (showNav=false). |
| 4 | Safe-area на мобильном работает | ✅ Pass | AppShell header: `max(env(safe-area-inset-top), 12px)`, BottomNav: `max(env(safe-area-inset-bottom), 12px)`. Минимум 12px на desktop. |
| 5 | DemoIndicator не мешает UI | ⚠️ Условно | DemoIndicator fixed bottom: 80px. BottomNav fixed bottom: 0. На обычных экранах с BottomNav DemoIndicator перекрывает нижние 80px. Решено: bottom: `calc(80px + env(safe-area-inset-bottom))` чтобы быть НАД BottomNav. |
| 6 | Event создаётся только после подтверждения взрослым | ✅ Pass | VoiceObservation → AIReview → ClarifyingQuestions (status='confirmed' + parent approved) → addEvent. Без явного нажатия "Сохранить" событие не появляется в EventTimeline. |
| 7 | AIReview показывает EventDraft, не финальный Event | ✅ Pass | `useVoiceObservationStore` хранит `currentTranscript`/`editedTranscript` в состоянии `transcript_ready` / `editing_transcript`. Реальный Event создаётся только в ClarifyingQuestions через `addEvents()`. |
| 8 | Event появляется в EventTimeline | ✅ Pass | `useEventStore.addEvents()` добавляет в начало списка, EventTimeline рендерит grouped by day. |
| 9 | EventDetails открывается | ✅ Pass | `/parent/events/:eventId` через navigate из TimelineRow. PageHeader showBack + fallbackPath="/parent/events". |
| 10 | Детский интерфейс простой | ✅ Pass | ChildTopBar: "Тишина" + bell + Settings + LogOut. Tap zones 64-80px. NO ambient loops (только one-shot ≤300ms). Min text. |
| 11 | UX-тексты на русском | ✅ Pass | Все страницы ru. i18n: ru (default) + kk + en (250 ключей). |
| 12 | Нет medical claims | ✅ Pass | См. ниже. |

## 3. Safety Wording Audit (v0.7.4)

Запрещённые формулировки НЕ найдены в `apps/`:
- ❌ "лечит аутизм" — нет
- ❌ "диагностирует" — только в **negative** context (disclaimer: "НЕ диагностирует, НЕ лечит")
- ❌ "исправляет ребёнка" — нет
- ❌ "нормализует поведение" — нет
- ❌ "ИИ точно понял причину" — нет
- ❌ "поведенческое нарушение" — нет
- ❌ "неадекватное поведение" — нет
- ❌ "ребёнок манипулирует" — нет

Используемые осторожные формулировки:
- "Похоже, …" — везде в AI insights
- "Возможно, …" — в mockEvents
- "Это наблюдение, не диагноз." — в disclaimer, EventTypeBadge, mockAIInsight
- "Можно обсудить со специалистом." — в disclaimer, summary
- "Нужно подтвердить." — в summary, disclaimer

Disclaimer в `/overview` (landing) и во всех event-related экранах через `EventTypeBadge`.

## 4. Privacy Audit (v0.7.4)

✅ Все реальные детские имена заменены на synthetic:
- Алихан → "Демо-профиль 1"
- Мира → "Демо-профиль 2"
- Тимур → "Демо-профиль 3"

Файлы обновлены:
- `apps/api/src/db/seed.ts` — child records + privacy migration
- `apps/api/prisma/schema.prisma` — комментарий
- `apps/prototype/src/data/demoDataset.ts` — DEMO_CHILDREN
- `apps/prototype/src/data/mockChild.ts` — mockChild
- `apps/prototype/src/data/mockEvents.ts` — mockVoiceObservation.transcript
- `apps/prototype/src/components/ui/Primitives.tsx` — ROLE_LABELS (child: "Ребёнок", не имя)
- `apps/api/src/services/sttService.ts` — mock transcript
- `apps/api/test/ai.test.ts` — test transcript

DB миграция (v0.7.4 seed):
- Old names "Алихан/Мира/Тимур" → "Демо-профиль 1/2/3"
- Old names "Ребёнок 1/2/3" (dev v0.7.3) → "Демо-профиль 1/2/3"
- Avatars "А/М/Т" → "1/2/3"

Документация (CHANGELOG, README, docs/*) — имена остались как исторический контекст прошлых версий, не трогаем.

## 5. Известные issues (некритичные)

| # | Issue | Severity | Workaround | Phase 2 fix |
|---|-------|----------|------------|-------------|
| 1 | DemoIndicator на focus-экранах без BottomNav сидит в "воздухе" посередине | Cosmetic | Скрыть demo (X) после изучения | BottomNav detection в DemoIndicator |
| 2 | JWT в localStorage — XSS risk | Medium | CSP headers настроены, не используется `dangerouslySetInnerHTML` | httpOnly cookies |
| 3 | Mock fallback с реальными детскими аватарами "А/М/Т" в БД | Low | Миграция применилась, "1/2/3" | (fixed v0.7.4) |
| 4 | `useRoleStore` migrations `tutor/overview → specialist` | Low | UI не показывает эти роли | (resolved v0.6.1) |
| 5 | No event-level userId scoping | High для prod | Все видят все события | v0.7.6 (Phase 2) |
| 6 | Real Claude / Whisper opt-in | High для prod | Mock fallback работает | Нужны env keys |

## 6. Demo сценарий (рекомендация для показа)

**Шаг 1 — Landing** (`/overview`)
- Показать 3 role cards (Родитель / Ребёнок / Тьютор) + "Запустить демо"
- Переключить язык на kk → en (i18n)
- Включить dark mode (ThemeToggle)
- HealthCheckBanner показывает "API: ok, AI: mock, STT: mock, DB: ok"

**Шаг 2 — Демо тур** (нажать "Запустить демо")
- DemoIndicator появляется внизу, 18 шагов
- Каждый шаг auto-navigate + hint

**Шаг 3 — Parent flow**
- /parent/home → 6 событий за сегодня для "Демо-профиль 1"
- Нажать "+" (микрофон в BottomNav) → /parent/voice
- Нажать "Использовать демо-транскрипт" → транскрипт появляется
- Нажать "Дальше" → /parent/ai-review (AI парсит)
- Нажать "Уточнить" → /parent/clarify → "Сохранить" → /parent/events
- Открыть событие → EventDetails → назад

**Шаг 4 — Child flow**
- Выйти в режим Ребёнок (из landing)
- /child/home → 3 кнопки (Главная, Карточки, Сказать)
- Карточки → "Хочу пить" → toast "Создаёт событие"
- /child/speak → нажать большой микрофон → live transcript (если Web Speech API поддерживается)
- /child/phrase-builder → собрать фразу "я хочу пить воду"

**Шаг 5 — Tutor flow**
- /tutor/home → наблюдения ребёнка
- /tutor/ai-review → AI-разбор
- /tutor/report → готовый отчёт

**Шаг 6 — Specialist flow**
- /specialist/dashboard → KPI
- /specialist/communication-profile → сигналы

## 7. Известные ограничения (MVP scope)

- 3 ребёнка в seed — это synthetic "Демо-профиль 1/2/3"
- AI парсер = keyword-mock (без Claude API key) — но реальный Claude работает если `ANTHROPIC_API_KEY` задан
- STT = Web Speech API (Chrome/Edge/Safari) — Firefox fallback на mock
- Email magic-link = dev-mode возвращает токен в response (без SMTP)
- Без multi-tenant — все видят все события (Phase 2)
- Без push-уведомлений (Phase 2)
- Без offline-mode (кроме PWA cache)
- Без real-time collaboration (Phase 2 — WebSocket уже готов, не подключён к UI)

## 8. Технические проверки (v0.7.4)

- ✅ `npm run build` (frontend) — 0 TS errors, 0 chunk warnings, 1694 modules, 7.93s
- ✅ `npm run typecheck` (backend) — 0 errors
- ✅ `npm test` (frontend, vitest+RTL) — 20/20 passed за 4.74s
- ✅ `npm test` (backend, vitest+supertest) — 16/16 passed за 2.81s
- ✅ `npm run build` (backend) — clean
- ✅ API health: `{"version":"0.7.4","ai":"mock","stt":"mock","db":"ok"}`
- ✅ Vite HMR работает на :5173
- ✅ API live на :4000 (Express + socket.io + Prisma + helmet + cors + Sentry optional)

## 9. Acceptance

| Критерий | Статус |
|----------|--------|
| Demo-flow полностью прокликивается | ✅ |
| Нет реальных детских имён | ✅ |
| Нет medical claims | ✅ |
| Build проходит | ✅ |
| Tests проходят | ✅ |
| docs/DEMO_FLOW_QA.md создан | ✅ (этот файл) |
| docs/PHASE_2_BACKLOG.md создан | ✅ |
| CHANGELOG обновлён для v0.7.4 | ✅ |
| Всё запушено в feature/v0.3.0-full-demo-mvp | ✅ |

v0.7.4 готов к демонстрации.
