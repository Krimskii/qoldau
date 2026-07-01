# TECH_DECISIONS.md

## Решения по стеку и архитектуре

### Почему Vite (а не Next.js)

На первом этапе не нужен SSR, SEO, API routes. Vite даёт:
- Быструю разработку (HMR)
- Простую структуру
- Лёгкий переход в Expo/React Native

### Почему Zustand (а не Context)

- Проще API: `useStore(state => state.field)`
- Меньше boilerplate
- Перформанс: перерисовывается только нужный компонент
- Легко разделять на домены (useEventStore, useRoleStore)

### Почему Tailwind (а не CSS modules)

- Быстрая итерация в mockup-фазе
- Дизайн-токены в одном месте
- Легко адаптировать под mobile
- Можно вынести в design-tokens package

### Почему Lucide React (а не свои SVG)

- Готовые, качественные иконки
- Единый стиль
- Tree-shaking
- Легко заменить на кастомные

### Архитектура Event Timeline

Все сущности — события в единой ленте:
- `food` → питание
- `toilet` → туалет
- `behavior` → поведение
- `communication` → коммуникация
- `state` → состояние

Это обеспечивает:
- Консистентность данных
- Лёгкое добавление фильтров
- Единую аналитику

### STT Abstraction Layer

```
src/lib/
  sttClient.types.ts    — интерфейс
  sttClient.mock.ts     — mock
  sttClient.future.ts   — пример интеграции
```

Для перехода к реальному STT:
1. Заменить `mockSTTClient` в `sttClient.mock.ts`
2. Использовать `STTTranscriptionRequest/Response` types
3. Файл `sttClient.future.ts` содержит пример интеграции

### AI Parser Abstraction

```
src/lib/aiParser.mock.ts
```

Mock парсер возвращает:
- parsed events
- AI insight
- clarification questions

Для перехода к реальному LLM:
1. Вызвать LLM API с transcript
2. Парсить ответ в `AIParsedObservation` формат
3. Сохранить совместимость интерфейса

### Дизайн-токены

Цвета определены в:
- `tailwind.config.js` (extend.colors)
- `src/styles/globals.css` (CSS variables)

Для mobile:
- Вынести в `/packages/design-tokens`
- Использовать Style Dictionary для iOS/Android
