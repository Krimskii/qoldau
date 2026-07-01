# ROUTES.md

## Qoldau AI — Routes

### Overview
| Path | Component | Description |
|------|-----------|-------------|
| `/overview` | Overview | Обзор продукта, выбор роли |

### Parent (Родитель)
| Path | Component | Description |
|------|-----------|-------------|
| `/parent/home` | ParentHome | Главная страница родителя |
| `/parent/voice` | VoiceObservation | Запись голосового наблюдения |
| `/parent/ai-review` | AIReview | AI-разбор наблюдения |
| `/parent/clarify` | ClarifyingQuestions | Уточняющие вопросы |
| `/parent/events` | EventTimeline | Лента событий |
| `/parent/events/:eventId` | EventDetails | Детали события |
| `/parent/care` | CareDiary | Питание, вода, туалет |
| `/parent/behavior` | BehaviorSensory | Поведение и сенсорика |
| `/parent/assistant` | ParentAIChat | AI-помощник (чат) |
| `/parent/analytics` | ParentAnalytics | Аналитика |
| `/parent/profile` | ParentProfile | Профиль ребёнка и настройки |

### Child (Ребёнок)
| Path | Component | Description |
|------|-----------|-------------|
| `/child/home` | ChildHome | Главная страница ребёнка |
| `/child/cards` | ChildCards | Быстрые AAC карточки |
| `/child/favorites` | ChildFavorites | Любимые мультики |
| `/child/speak` | ChildSpeak | Голосовой ввод |
| `/child/phrase-builder` | PhraseBuilderPage | Сборщик фраз |
| `/child/calm` | CalmMode | Спокойный режим |
| `/child/call` | ChildCall | Позвать взрослого |
| `/child/progress` | ChildProgress | Прогресс общения |

### Tutor (Тьютор)
| Path | Component | Description |
|------|-----------|-------------|
| `/tutor/home` | TutorHome | Главная страница тьютора |
| `/tutor/voice` | TutorVoice | Запись наблюдения |
| `/tutor/ai-review` | TutorAIReview | AI-разбор |
| `/tutor/report` | TutorReport | Отчёт родителю |
| `/tutor/child-profile` | TutorChildProfile | Профиль ребёнка |

### Specialist (Специалист)
| Path | Component | Description |
|------|-----------|-------------|
| `/specialist/dashboard` | SpecialistDashboard | Панель специалиста |
| `/specialist/events` | SpecialistEvents | События |
| `/specialist/abc` | ABCAnalysis | ABC-анализ |
| `/specialist/communication-profile` | CommunicationProfile | Коммуникационный профиль |
| `/specialist/care-patterns` | CarePatterns | Паттерны ухода |
| `/specialist/support-plan` | SupportPlan | План поддержки |
| `/specialist/reports` | Reports | Формирование отчётов |

### Navigation Flow

```
Overview
├── Parent
│   ├── home → voice → ai-review → clarify → events → event/:id
│   ├── home → care
│   ├── home → behavior
│   ├── home → analytics
│   └── home → profile
├── Child
│   ├── home → cards
│   ├── home → favorites
│   ├── home → speak
│   ├── home → phrase-builder
│   ├── home → calm
│   └── home → progress
├── Tutor
│   ├── home → voice → ai-review → report
│   └── home → child-profile
└── Specialist
    ├── dashboard → abc
    ├── dashboard → communication-profile
    ├── dashboard → care-patterns
    ├── dashboard → support-plan
    └── dashboard → reports
```
