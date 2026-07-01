# Qoldau AI

Voice-first AI-платформа сопровождения детей с РАС, родителей, тьюторов и специалистов.

## Установка

```bash
cd apps/prototype
npm install
```

## Запуск

```bash
npm run dev
```

Откроется на http://localhost:5173

## Сборка

```bash
npm run build
```

## Demo-flow (полный цикл)

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
15. "ABC-анализ" → `/specialist/abc`
16. "Коммуникационный профиль" → `/specialist/communication-profile`

## Роли и маршруты

### Родитель (11 страниц)
- `/parent/home` — Главная
- `/parent/voice` — Голосовое наблюдение
- `/parent/ai-review` — AI-разбор
- `/parent/clarify` — Уточняющие вопросы
- `/parent/events` — Лента событий
- `/parent/events/:id` — Детали события
- `/parent/care` — Питание и туалет
- `/parent/behavior` — Поведение и сенсорика
- `/parent/assistant` — AI-помощник
- `/parent/analytics` — Аналитика
- `/parent/profile` — Профиль

### Ребёнок (8 страниц)
- `/child/home` — Главная
- `/child/cards` — Быстрые карточки
- `/child/favorites` — Любимые
- `/child/speak` — Сказать
- `/child/phrase-builder` — Сборщик фразы
- `/child/calm` — Спокойный режим
- `/child/call` — Позвать
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

### Overview
- `/overview` — Обзор продукта

## Что реализовано

- ✅ Все роли с навигацией
- ✅ Все страницы (11 + 8 + 5 + 7 + Overview)
- ✅ Event Timeline как центра данных
- ✅ Mock STT layer
- ✅ Mock AI parser
- ✅ Mock API
- ✅ Role switcher
- ✅ Responsive design
- ✅ Детский интерфейс (упрощённый)
- ✅ AI-выводы как гипотезы
- ✅ Tailwind CSS с дизайн-токенами

## Что mock

- Реальная запись голоса
- Реальный STT
- Реальный AI/LLM
- Реальный backend
- Реальная авторизация
- Реальные push-уведомления

## Архитектура для mobile

Проект готов для перехода к React Native / Expo:

1. **Shared types** — `/src/types/qoldau.ts` можно вынести в `/packages/types`
2. **STT adapter** — `/src/lib/sttClient.mock.ts` → заменить на реальный STT API
3. **AI parser** — `/src/lib/aiParser.mock.ts` → заменить на реальный LLM
4. **Design tokens** — `/tailwind.config.js` → отдельный пакет

## Стек

- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- Lucide React
