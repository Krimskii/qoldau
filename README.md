# Qoldau AI

Voice-first AI-платформа сопровождения детей с РАС, родителей, тьюторов и специалистов.

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

На Overview нажмите **"Запустить демо (10 мин)"** — откроется guided tour по всем ролям.

Или пройдите вручную:

### Demo-flow (полный цикл)

1. **Overview** — `/overview` — обзор продукта, выбор роли
2. **Родитель** → `/parent/home`
3. Нажать "Сказать наблюдение" → `/parent/voice`
4. Нажать "Остановить" → `/parent/ai-review`
5. Нажать "Сохранить всё" → `/parent/clarify`
6. "Сохранить ответы" → `/parent/events`
7. Открыть событие → `/parent/events/:id`
8. Переключиться на "Ребёнок" → `/child/home`
9. Нажать "Хочу пить" → карточки с feedback
10. Переключиться на "Тьютор" → `/tutor/home`
11. "Наговорить событие" → `/tutor/voice`
12. "Остановить" → `/tutor/ai-review`
13. "Сохранить в дневник" → `/tutor/report`
14. Переключиться на "Специалист" → `/specialist/dashboard`
15. "Коммуникационный профиль" → `/specialist/communication-profile`

См. также: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)

---

## Что реализовано в v0.2.0

### Guided Demo Mode
- Кнопка "Запустить демо" на Overview
- Визуальный индикатор шага внизу экрана
- 18 шагов демо: Parent → Child → Tutor → Specialist
- Навигация "Назад" / "Далее"

### Event Timeline (улучшенный)
- Фильтры по типам событий
- Группировка по времени дня (утро/день/вечер/ночь)
- Бейджи источника: родитель / ребёнок / тьютор / AI
- Бейджи статуса: подтверждено / проверить / исправлено
- AI-наблюдение сверху

### EventDetails (улучшенный)
- Источник события
- Исходная фраза / карточка
- Связанные события
- Осторожная AI-гипотеза
- Что можно попробовать

### CommunicationProfile (улучшенный)
- Список сигналов ребёнка
- Confidence как осторожный индикатор
- Источники подтверждений
- Связь с Event Timeline

### TutorReport (улучшенный)
- Сводка за 7 дней
- Кнопка "Скопировать отчёт"
- Кнопка "Отправить родителю"
- Нейтральные формулировки

### SpecialistDashboard (улучшенный)
- KPI за период (7/14/30 дней)
- Часто повторяющиеся ситуации
- Что помогало
- Ссылка на все разделы

### Toast notifications
- in-app feedback без browser alert
- Типы: success, error, info, warning

---

## Что mock

- Реальная запись голоса
- Реальный STT
- Реальный AI/LLM
- Реальный backend
- Реальная авторизация
- Реальные push-уведомления

---

## Архитектура для mobile

Проект готов для перехода к React Native / Expo:

1. **Shared types** — `/src/types/qoldau.ts` можно вынести в `/packages/types`
2. **STT adapter** — `/src/lib/sttClient.mock.ts` → заменить на реальный STT API
3. **AI parser** — `/src/lib/aiParser.mock.ts` → заменить на реальный LLM
4. **Design tokens** — `/tailwind.config.js` → отдельный пакет

---

## Роли и маршруты

### Overview
- `/overview` — Обзор продукта, запуск демо

### Родитель (11 страниц)
- `/parent/home` — Главная
- `/parent/voice` — Голосовое наблюдение
- `/parent/ai-review` — AI-разбор
- `/parent/clarify` — Уточняющие вопросы
- `/parent/events` — Event Timeline
- `/parent/events/:id` — Детали события
- `/parent/care` — Питание и туалет
- `/parent/behavior` — Поведение и сенсорика
- `/parent/assistant` — AI-помощник
- `/parent/analytics` — Аналитика
- `/parent/profile` — Профиль

### Ребёнок (8 страниц)
- `/child/home` — Главная
- `/child/cards` — AAC карточки
- `/child/favorites` — Любимые
- `/child/speak` — Сказать
- `/child/phrase-builder` — Сборщик фразы
- `/child/calm` — Спокойный режим
- `/child/call` — Позвать маму
- `/child/progress` — Прогресс

### Тьютор (5 страниц)
- `/tutor/home` — Главная
- `/tutor/voice` — Запись наблюдения
- `/tutor/ai-review` — AI-разбор
- `/tutor/report` — Отчёт родителю
- `/tutor/child-profile` — Профиль ребёнка

### Специалист (7 страниц)
- `/specialist/dashboard` — Панель
- `/specialist/events` — События
- `/specialist/abc` — ABC-анализ
- `/specialist/communication-profile` — Коммуникации
- `/specialist/care-patterns` — Паттерны ухода
- `/specialist/support-plan` — План поддержки
- `/specialist/reports` — Отчёты

---

## Стек

- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- Lucide React

---

## Документация

- [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — Сценарий показа на 10-15 минут
- [ACCEPTANCE_CRITERIA.md](docs/ACCEPTANCE_CRITERIA.md) — Критерии приёмки
- [PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md) — Описание продукта
- [DATA_MODEL.md](docs/DATA_MODEL.md) — Модель данных
- [TECH_DECISIONS.md](docs/TECH_DECISIONS.md) — Технические решения

---

## Безопасность и формулировки

Qoldau AI не является медицинским устройством. Все AI-выводы формулируются осторожно:

- "Похоже..."
- "Возможно..."
- "Это наблюдение, не диагноз."
- "Нужно подтвердить."
- "Можно обсудить со специалистом."
