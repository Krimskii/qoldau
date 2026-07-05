# MiniMax — v1.5+ E: Production Readiness Plan (фронт, все роли)

> **Автор:** MiniMax · **Дата:** 2026-07-05 · **База:** `integration/v1.5`
> **Аудит-репорт:** `docs/PRODUCTION_READINESS_AUDIT.md` (полная карта грязных мест).
> **Назначение:** довести фронт (`apps/prototype/**`) до **продакшн-готового** состояния,
> чтобы все 4 роли (parent / child / tutor / specialist) работали без тупиков,
> заглушек, неполного i18n, обмана пользователя моками. **Не сломать ничего из
> уже готового (A/B/C/D waves).**

---

## 0. Контекст и мотивация

### Текущее состояние (по аудиту 2026-07-05)
- ✅ **Child** — закрыт wave A (навигация/минимал-UI), B (полировка карточек), D (comm/inclusion).
- ✅ **Parent** — закрыт wave C (дашборд + аналитика), частично D-фолбэк.
- ⚠️ **Tutor** — 5 экранов, много hardcoded строк, нет i18n, mock STT/AI внутри,
  «Отчёт родителю» — только toast (нет реальной отправки).
- ⚠️ **Specialist** — 7 экранов, hardcoded, Reports имеет 5 кнопок «появится в
  следующей версии» (явный next-version stub).
- ⚠️ **Auth/LoginPage** — показывает devMagicUrl и `http://localhost:4000` в
  user-facing ошибке (dev-leak).
- ⚠️ **Honest state** — `CalmMode` симулирует аудио через `setInterval`,
  `ChildSpeak` фолбэчит на random `DEMO_LABELS`, `ParentAIChat` — keyword-match
  bot, представленный как «AI-помощник». Не помечены как демо.
- ⚠️ **i18n** — 1874 строки хардкод-русского в JSX (особенно в
  `AIReview/BehaviorSensory/AssetPicker/ImageUpload/ABCAnalysis/CarePatterns`).
- ✅ Сборка `qoldau-ai@0.7.5`, **156/156 тестов ✓**.

### Каркас, который НЕ трогаем
- `apps/api/**` — backend, в зоне Codex.
- `docs/PHASE_2_BACKLOG.md` — multi-tenant/auth/payment и т.п. — вне pilot scope.
- Android release, Capacitor keystore — отдельно.
- `integration/v1.5` — не merge-нуть самому.

### Принципы (hard rules)
- **Не ломать** существующие тесты, не удалять готовые фичи.
- **Не выдумывать** UX — следовать существующим паттернам (v1.5 B/C/D).
- **Honest state** — мок/demo явно помечаем (badge «демо» в UI).
- **i18n** — все user-facing строки через `t('namespace.key')` в ru/kk/en.
- **0 inline-hex** — токены Tailwind / `tokens.ts`.
- **Не мокать** функции, которые уже работают в бэкенде (events, recordings).
- **Локально** — события/записи остаются в сторах (`useEventStore`,
  `useRecordingsStore`) — local-first.

---

## 1. Карта грязных мест (TL;DR)

Полный аудит — `docs/PRODUCTION_READINESS_AUDIT.md`. Здесь — топ-категории.

### 1.1 Critical — нужно закрыть (P0)
| Где | Что | Шаг |
|---|---|---|
| `pages/auth/LoginPage.tsx:96-131` | devMagicUrl + `localhost:4000` в user-facing error | **E1** |
| `pages/tutor/TutorReport.tsx:55` | `handleSend` только toast, нет реальной отправки | **E2** |
| `pages/specialist/Reports.tsx:233` | 5 кнопок «появится в следующей версии» | **E3** |
| `pages/tutor/TutorHome.tsx`, `TutorChildProfile.tsx`, `TutorVoice.tsx` | весь tutor — hardcoded, нет i18n, нет реальных данных | **E2** |
| `pages/specialist/*.tsx` | весь specialist — hardcoded, нет i18n | **E3** |

### 1.2 High — honest state (P1)
| Где | Что | Шаг |
|---|---|---|
| `pages/child/CalmMode.tsx:20-264` | fake audio playback через `setInterval` — не помечен как демо | **E4** |
| `pages/child/ChildSpeak.tsx:109-203` | фолбэк на random `DEMO_LABELS` — не помечен как демо | **E4** |
| `pages/parent/ParentAIChat.tsx:21-44` | keyword-match bot, представлен как AI-помощник | **E4** |

### 1.3 Medium — i18n final pass (P2)
| Где | Что | Шаг |
|---|---|---|
| `pages/parent/AIReview.tsx` | ~20 строк хардкод-русского | **E5** |
| `pages/parent/BehaviorSensory.tsx` | ~15 строк | **E5** |
| `pages/specialist/ABCAnalysis.tsx`, `CarePatterns.tsx` | ~25 строк | **E5** |
| `components/assets/AssetPicker.tsx`, `ImageUpload.tsx` | ~20 строк | **E5** |
| `pages/tutor/*.tsx` | ~30 строк | **E2** |
| `pages/specialist/*.tsx` | ~30 строк | **E3** |

---

## 2. Стратегия

### 2.1 Каждый шаг = 1 ветка + 1 PR
```
integration/v1.5
  ├── feature/v1.5-E1-auth-honest        ← LoginPage убрать dev-leak
  ├── feature/v1.5-E2-tutor-production   ← tutor surface + i18n
  ├── feature/v1.5-E3-specialist-prod    ← specialist surface + Reports stubs
  ├── feature/v1.5-E4-honest-mocks       ← DemoBadge для моков
  └── feature/v1.5-E5-i18n-final-pass    ← добить i18n ru/kk/en
```

### 2.2 Каждый шаг = 1 спека-файл
- `docs/tickets/MINIMAX_PRODUCTION_STEP_E<N>_<name>.md` — детальный план.
- В каждой спеке: scope / файлы / дизайн / i18n-ключи / тесты / DoD.

### 2.3 Definition of Done (общий)
- `npm run typecheck` ✓
- `npm test -- --run` ✓ (без регрессий, +новые тесты)
- `npm run build` ✓
- 0 inline-hex в новых JSX.
- i18n ru/kk/en покрытие для всех новых строк.
- 1 коммит = 1 логический шаг.
- Push к feature-ветке.
- PR открыт с описанием по спеке.

---

## 3. Шаги — детали

| # | Шаг | Бранч | Спека | Оценка | Приоритет |
|---|---|---|---|---|---|
| **E0** | Audit & plan | (этот файл) | этот + AUDIT | done | P0 |
| **E1** | Auth honest state | `feature/v1.5-E1-auth-honest` | `MINIMAX_PRODUCTION_STEP_E1_auth_honest.md` | 1–2 ч | P0 |
| **E2** | Tutor production | `feature/v1.5-E2-tutor-production` | `MINIMAX_PRODUCTION_STEP_E2_tutor_production.md` | 3–4 ч | P0 |
| **E3** | Specialist production | `feature/v1.5-E3-specialist-prod` | `MINIMAX_PRODUCTION_STEP_E3_specialist_production.md` | 3–4 ч | P0 |
| **E4** | Honest mock layer | `feature/v1.5-E4-honest-mocks` | `MINIMAX_PRODUCTION_STEP_E4_honest_mocks.md` | 2 ч | P1 |
| **E5** | i18n final pass | `feature/v1.5-E5-i18n-final-pass` | `MINIMAX_PRODUCTION_STEP_E5_i18n_final_pass.md` | 3–4 ч | P2 |

**Суммарно:** ~12–16 ч работы, 5 PR.

### 3.1 Что НЕ делаем в этой волне
- Реальный STT (Whisper opt-in) — backend Codex.
- Реальный AI-парсер (OpenAI) — backend Codex.
- Multi-tenant auth (PHASE_2_BACKLOG).
- GDPR consent, payment, push — phase 2.
- Реальная отправка отчёта родителю — бэкенд, не реализуем на фронте,
  честно говорим «функция в разработке».
- Полный kk/en перевод всего — только то, что добавляем в E1-E4.

---

## 4. Прогресс (заполняется по мере выполнения)

- [x] **E0** — план + аудит (`docs/PRODUCTION_READINESS_AUDIT.md`, этот файл)
- [ ] **E1** — auth honest state
- [ ] **E2** — tutor production
- [ ] **E3** — specialist production
- [ ] **E4** — honest mock layer
- [ ] **E5** — i18n final pass

---

## 5. Аудит (краткая выжимка для контекста)

Полный аудит — в `docs/PRODUCTION_READINESS_AUDIT.md`. Здесь — топ-факты.

### 5.1 Чего нет в коде (хорошо)
- ❌ `TODO` / `FIXME` / `HACK` — **0** совпадений.
- ❌ `<ComingSoon>` — компонента нет (и не нужна).
- ❌ `onClick={() => {}}` — нет no-op handlers.
- ❌ `alert(` / `confirm(` / `prompt(` — нет.
- ❌ `console.log/warn` — только ErrorBoundary (1 шт, оставить).

### 5.2 Что есть (плохо)
- 🚨 `devMagicUrl` в UI (LoginPage).
- 🚨 2 next-version-stub («Отчёт родителю» → toast, 5 кнопок в Specialist Reports).
- ⚠️ ~1874 строк хардкод-русского в JSX (sample дан в аудите).
- ⚠️ 3 места, где мок выдаётся за реальный AI (CalmMode audio / Speak fallback / ParentAIChat).

### 5.3 Что уже хорошо
- 43 маршрута в роутинге, все ведут к реальным компонентам.
- `useEventStore` v3 + soft-delete + ABC — production-grade.
- `useAssetStore` v2 + mediaKind + migrate — production-grade.
- `QoldauEvent<T>` generic + EventPayloadMap — type-safe.
- `useChildSettingsStore` sensoryMode — production-grade (D2).
- 156/156 тестов ✓, typecheck ✓, build ✓.

---

## 6. После завершения E1–E5

- Integration: merge E1–E5 в `integration/v1.5` после ревью.
- Pilot readiness check: запустить локально `api 4000 + web 5173`, пройти все 4
  роли, проверить, что нет 404/тупиков/не-демо моков.
- Bundle для оффлайн-push (на случай потери сети): `git bundle`.
- Документация: `docs/PHASE_2_BACKLOG.md` обновить (что осталось вне pilot).

---

## 7. Связь с wave D (закрыто)

Wave D (`feature/v1.5-child-comm-inclusion`, 6ebab57) дал:
- `ConfirmSheet` — переиспользуемый bottom-sheet ✓/✕. **E3 использует** его
  для подтверждения удаления в Reports / отчётов.
- `IconRenderer` для обложек — **E2 использует** в TutorReport preview.
- Store v2 + mediaKind + messagePresets — **E2/E3 не трогают**, читают.

---

## 8. Соглашения для шагов

- Каждый шаг начинается со своего файла-спеки.
- Мини-патчи в `tokens.ts` (если нужны) — в своём коммите.
- Если шаг требует обновить `i18n/locales/*.json` — обязательно все 3 языка.
- Не дублировать переводы — общий namespace `v15e.<feature>`.
- Новые компоненты — в `components/ui/<Name>.tsx` + export в `index.ts`.
- Snapshot тесты — только если меняется визуальная композиция (QoldauCard и т.п.).
- Каждый шаг отдельно проверяется перед push: typecheck + test + build.