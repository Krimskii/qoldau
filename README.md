# Qoldau AI

Voice-first AI-платформа сопровождения детей с РАС, родителей, тьюторов и специалистов.

**Текущая версия: v0.3.0 — Full Demo MVP**

## Быстрый старт

```bash
cd apps/prototype
npm install
npm run dev
```

Откроется на http://localhost:5173

## Сборка

```bash
npm run build
```

## Запуск демо

На Overview нажмите **«Запустить демо»** — откроется 18-шаговый guided tour.

Или пройдите вручную через Role Switcher (вверху справа): **Родитель / Ребёнок / Тьютор / Специалист**.

См. [docs/MVP_WALKTHROUGH.md](docs/MVP_WALKTHROUGH.md) — полный сценарий показа.

---

## Что реализовано в v0.3.0

### Данные
- **3 ребёнка**: Алихан (7), Мира (5), Тимур (9) — в `src/data/demoDataset.ts`
- **60+ событий за 7 дней** для Алихана: voice_observation, food, water, toilet, sleep, behavior, sensory, communication, aac_card, phrase, media_request, sos, calm_mode, tutor_note, specialist_note, state
- Все события связаны через `linkedEventIds`
- 2 родителя, 2 тьютора, 2 специалиста

### Наполненные экраны
- **Parent**: ParentHome, VoiceObservation, AIReview, ClarifyingQuestions, EventTimeline, EventDetails, CareDiary, BehaviorSensory, ParentAIChat, ParentAnalytics, ParentProfile
- **Child**: ChildHome, ChildCards, ChildFavorites, ChildSpeak, PhraseBuilder, CalmMode, CallMom, ChildProgress, **NowNext (новый)**
- **Tutor**: TutorHome, TutorVoice, TutorAIReview, TutorReport, TutorChildProfile
- **Specialist**: SpecialistDashboard, SpecialistEvents, ABCAnalysis, CommunicationProfile, CarePatterns, SupportPlan, Reports

### UX
- **Guided Demo Mode** — 18 шагов
- **Toast notifications** — in-app feedback (нет `alert()`)
- **Все действия создают Event** в Event Timeline
- **Cautious AI wording** — везде «Похоже…», «Нужно подтвердить», «Можно обсудить со специалистом»

---

## Что mock

- Реальная запись голоса → STT → текст (mock)
- Реальный AI/LLM парсер (mock)
- Реальный backend
- Реальная авторизация
- Real push-уведомления
- Real cloud storage
- Real payment

**Не реализовано и не планируется в MVP:**
- ❌ medical records, wearable, GPS/geozones
- ❌ production backend

---

## Архитектура для mobile

Проект готов для перехода к React Native / Expo:

1. **Shared types** — `src/types/qoldau.ts` можно вынести в `packages/types`
2. **STT adapter** — `src/lib/sttClient.mock.ts` → заменить на реальный STT API
3. **AI parser** — `src/lib/aiParser.mock.ts` → заменить на реальный LLM
4. **Design tokens** — `tailwind.config.js` → отдельный пакет

---

## Роли и маршруты

### Overview
- `/overview` — Обзор продукта, запуск демо

### Родитель (11 страниц)
- `/parent/home`, `/parent/voice`, `/parent/ai-review`, `/parent/clarify`
- `/parent/events`, `/parent/events/:id`
- `/parent/care`, `/parent/behavior`
- `/parent/assistant`, `/parent/analytics`, `/parent/profile`

### Ребёнок (9 страниц, включая новую `/child/now-next`)
- `/child/home`, `/child/cards`, `/child/favorites`
- `/child/speak`, `/child/phrase-builder`
- `/child/calm`, `/child/call`, `/child/progress`, `/child/now-next`

### Тьютор (5 страниц)
- `/tutor/home`, `/tutor/voice`, `/tutor/ai-review`
- `/tutor/report`, `/tutor/child-profile`

### Специалист (7 страниц)
- `/specialist/dashboard`, `/specialist/events`
- `/specialist/abc`, `/specialist/communication-profile`
- `/specialist/care-patterns`, `/specialist/support-plan`, `/specialist/reports`

---

## Стек

- React 18, Vite, TypeScript, Tailwind CSS
- React Router v6, Zustand, Lucide React

---

## Документация

### Стартовые документы (v0.3.0)
- [MVP_SCOPE.md](docs/MVP_SCOPE.md) — что входит / не входит в Demo MVP
- [FEATURE_MAP.md](docs/FEATURE_MAP.md) — карта экранов и функций
- [USER_JOURNEYS.md](docs/USER_JOURNEYS.md) — сценарии пользователей
- [MOCK_DATA_SPEC.md](docs/MOCK_DATA_SPEC.md) — спецификация mock-данных
- [EVENT_MODEL.md](docs/EVENT_MODEL.md) — модель QoldauEvent
- [UX_WRITING_GUIDE.md](docs/UX_WRITING_GUIDE.md) — гайд по формулировкам
- [SAFETY_WORDING.md](docs/SAFETY_WORDING.md) — запрещённые формулировки

### Сценарии показа
- [MVP_WALKTHROUGH.md](docs/MVP_WALKTHROUGH.md) — полный сценарий показа v0.3.0
- [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — сценарий guided demo

### Прочее
- [VERSIONING.md](docs/VERSIONING.md) — история версий
- [ACCEPTANCE_CRITERIA.md](docs/ACCEPTANCE_CRITERIA.md) — критерии приёмки
- [PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md), [DATA_MODEL.md](docs/DATA_MODEL.md), [TECH_DECISIONS.md](docs/TECH_DECISIONS.md), [ROUTES.md](docs/ROUTES.md)

---

## Безопасность и формулировки

Qoldau AI **не является медицинским устройством**. Не диагностирует, не лечит, не заменяет специалиста.

Все AI-выводы формулируются осторожно:
- «Похоже…»
- «Возможно…»
- «Это наблюдение, не диагноз.»
- «Нужно подтвердить.»
- «Можно обсудить со специалистом.»

Запрещены: «лечит», «диагностирует», «поведенческое нарушение», «патология», «коррекция поведения».
