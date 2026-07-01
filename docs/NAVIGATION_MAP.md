# Navigation Map — Qoldau AI

> Все routes приложения, их entry points, primary actions и fallback.
> Источник истины — `src/config/navigation.ts`. Этот документ — человекочитаемая версия.

## Глобальные правила

- Каждый экран **обязан** иметь fallback path (для случая, когда browser history пуст).
- Каждый focus-экран (recording, full-screen modal) **скрывает BottomNav**, но должен иметь либо свой back, либо AppShell header.
- Каждый child screen **должен** иметь возможность вернуться на `/child/home` (или `/overview` для Interface Guide).
- AppShell header всегда даёт выход на `/overview` (через кнопку "Домой" с сердечком).

## Overview

| Route | Screen | Role | Entry points | Primary action | Back/Fallback |
|-------|--------|------|--------------|----------------|---------------|
| `/overview` | Overview | overview | Root, demo end | Start demo / role tile | (root) |

## Parent

| Route | Screen | Role | Entry | Primary | Fallback |
|-------|--------|------|-------|---------|----------|
| `/parent/home` | Главная | parent | Overview, BottomNav | Voice CTA → /parent/voice | `/parent/home` |
| `/parent/voice` | Голосовое наблюдение | parent | Home, BottomNav `+` | Остановить → AI-разбор | `/parent/home` |
| `/parent/ai-review` | AI-разбор | parent | Voice (auto) | Подтвердить → /parent/clarify | `/parent/home` |
| `/parent/clarify` | Уточняем | parent | AI-разбор | Сохранить → /parent/events | `/parent/home` |
| `/parent/events` | События | parent | Home, BottomNav, demo step 6 | Tap event → /parent/events/:id | `/parent/events` |
| `/parent/events/:eventId` | Детали события | parent | Events | Tab → ABC / похожие / связанные | `/parent/events` |
| `/parent/care` | Дневник ухода | parent | Home, Overview | Day expand | `/parent/home` |
| `/parent/behavior` | Поведение и сенсорика | parent | Home | Helper card → calm | `/parent/home` |
| `/parent/assistant` | AI-помощник | parent | Home | Preset question | `/parent/home` |
| `/parent/analytics` | Аналитика | parent | Home, BottomNav | Period toggle | `/parent/home` |
| `/parent/profile` | Профиль | parent | Home, BottomNav | Edit / role switch | `/parent/home` |
| `/parent/notifications` | Уведомления | parent | AppShell bell | Tap → event / response | `/parent/home` |

## Child

| Route | Screen | Role | Entry | Primary | Fallback |
|-------|--------|------|-------|---------|----------|
| `/child/home` | Главная (ребёнок) | child | Overview, BottomNav (или «Домой» chip) | Tap action card | `/child/home` |
| `/child/cards` | AAC-карточки | child | Home (water/toilet) | Tap card → success feedback | `/child/home` |
| `/child/favorites` | Любимые | child | Home | Tap card → request | `/child/home` |
| `/child/speak` | Сказать голосом | child | Home | Mic → mock recognition → confirm | `/child/home` |
| `/child/phrase-builder` | Собрать фразу | child | Home | Send → success → home | `/child/home` |
| `/child/calm` | Спокойный режим | child | Home (Пауза) | Start 1-min timer → finish | `/child/home` |
| `/child/now-next` | Сейчас и потом | child | Home (Now/Next strip) | Tap item | `/child/home` |
| `/child/choice` | Выбрать из вариантов | child | Home (choice row) | Tap option | `/child/home` |
| `/child/interface-guide` | Что важно в интерфейсе | child | Home (settings) | Toggle demo mode | `/overview` |
| `/child/call` | Позвать | child | Home (CTA «Позвать маму») | Tap contact / SOS | `/child/home` |
| `/child/progress` | Мой прогресс | child | Home (bell) | View achievements | `/child/home` |

## Tutor

| Route | Screen | Role | Entry | Primary | Fallback |
|-------|--------|------|-------|---------|----------|
| `/tutor/home` | Главная тьютора | tutor | Overview | Записать наблюдение → /tutor/voice | `/tutor/home` |
| `/tutor/voice` | Запись наблюдения | tutor | Home | Остановить → /tutor/ai-review | `/tutor/home` |
| `/tutor/ai-review` | AI-разбор | tutor | Voice | Сохранить → /tutor/report | `/tutor/home` |
| `/tutor/report` | Отчёт тьютора | tutor | AI-review | Копировать / отправить родителю | `/tutor/home` |
| `/tutor/child-profile` | Профиль ребёнка | tutor | Home, BottomNav | View signals | `/tutor/home` |

## Specialist

| Route | Screen | Role | Entry | Primary | Fallback |
|-------|--------|------|-------|---------|----------|
| `/specialist/dashboard` | Панель специалиста | specialist | Overview | KPI link | `/specialist/dashboard` |
| `/specialist/events` | События | specialist | Dashboard, BottomNav | Filter + tap event | `/specialist/dashboard` |
| `/specialist/abc` | ABC-анализ | specialist | Dashboard, BottomNav | Column toggle | `/specialist/dashboard` |
| `/specialist/communication-profile` | Профиль коммуникации | specialist | Dashboard | Toggle signal | `/specialist/dashboard` |
| `/specialist/care-patterns` | Паттерны ухода | specialist | Dashboard | Pattern detail | `/specialist/dashboard` |
| `/specialist/support-plan` | План поддержки | specialist | Dashboard | Edit block | `/specialist/dashboard` |
| `/specialist/reports` | Отчёты | specialist | Dashboard, BottomNav | Generate / preview | `/specialist/dashboard` |

## Guided Demo (18 шагов)

Каждый шаг — это `RouteMeta.demoStep`. Переходы между шагами — через `useDemoStore.nextStep/previousStep/goToStep`.

| Step | Route | Title |
|------|-------|-------|
| 1 | `/overview` | Overview |
| 2 | `/parent/home` | Главная родителя |
| 3 | `/parent/voice` | Голосовое наблюдение |
| 4 | `/parent/ai-review` | AI-разбор |
| 5 | `/parent/clarify` | Уточняем |
| 6 | `/parent/events` | Event Timeline |
| 7 | `/parent/events/evt-1-5` | Детали события |
| 8 | `/child/home` | Интерфейс ребёнка |
| 9 | `/child/cards` | AAC карточки |
| 10 | `/child/favorites` | Любимые |
| 11 | `/child/speak` | Голос ребёнка |
| 12 | `/child/phrase-builder` | Сборщик фраз |
| 13 | `/tutor/home` | Главная тьютора |
| 14 | `/tutor/ai-review` | AI у тьютора |
| 15 | `/tutor/report` | Отчёт тьютора |
| 16 | `/specialist/dashboard` | Панель специалиста |
| 17 | `/specialist/communication-profile` | Коммуникации |
| 18 | `/overview` | Возврат в Overview |

## BottomNav по ролям

| Role | BottomNav items | Скрывается на |
|------|-----------------|---------------|
| parent | Главная, События, **+**, Аналитика, Профиль | voice, ai-review, clarify, assistant, notifications |
| child | (нет) | всегда |
| tutor | Главная, AI, Отчёт, Профиль | voice, ai-review, report |
| specialist | Главная, События, ABC, Отчёты | (нет) |

## Что изменилось в v0.3.9

1. **`src/config/navigation.ts`** — единый реестр всех routes + helpers (`getRouteMeta`, `getFallbackPath`, `getRoleHome`).
2. **`src/components/navigation/BackButton.tsx`** — безопасная кнопка назад с fallback через config.
3. **`src/components/layout/PageHeader.tsx`** — теперь использует BackButton (раньше был голый `navigate(-1)`, который мог быть тупиком).
4. **`src/components/layout/PageScaffold.tsx`** — новая переиспользуемая обёртка (header + bottom-safe layout).
5. **BottomNav** — убран дубль `tutor/ai-review` (были Calendar→ai-review + Brain→ai-review).
6. Этот документ — карта всех routes.