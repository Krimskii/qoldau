# DATA_MODEL.md

## Qoldau AI — Data Model

### Core Entities

```typescript
// User Role
type UserRole = 'parent' | 'child' | 'tutor' | 'specialist' | 'overview';

// Event Types
type EventType = 
  | 'voice_observation'  // голосовое наблюдение
  | 'food'               // питание
  | 'water'              // вода
  | 'toilet'            // туалет
  | 'sleep'              // сон
  | 'behavior'           // поведение
  | 'sensory'            // сенсорное
  | 'communication'      // коммуникация
  | 'aac_card'           // AAC карточка
  | 'phrase'             // фраза
  | 'media_request'      // запрос медиа
  | 'sos'                // SOS
  | 'calm_mode'          // спокойный режим
  | 'tutor_note'         // заметка тьютора
  | 'specialist_note'    // заметка специалиста
  | 'state';             // состояние

// Event Status
type EventStatus = 'draft' | 'ai_parsed' | 'confirmed' | 'corrected' | 'rejected';
```

### Child Profile

```typescript
interface ChildProfile {
  id: string;
  name: string;
  age: number;
  diagnosisLabel: string;        // "РАС", etc.
  currentState: string;          // "спокойный", etc.
  avatar?: string;
  mainSignals: Signal[];         // ключевые сигналы
}

interface Signal {
  id: string;
  signal: string;               // '"ба"', 'закрывает уши'
  kind: 'sound' | 'word' | 'gesture' | 'behavior' | 'aac';
  possibleMeaning: string;       // 'возможно вода'
  confidence: number;            // 0.0 - 1.0
  confirmedCount: number;         // сколько раз подтверждено
  lastSeenAt: string;            // ISO timestamp
}
```

### QoldauEvent (Central Entity)

```typescript
interface QoldauEvent {
  id: string;
  childId: string;
  type: EventType;
  title: string;                  // локализованное название
  description: string;           // описание
  timestamp: string;              // ISO timestamp
  sourceRole: 'parent' | 'child' | 'tutor' | 'specialist' | 'device' | 'ai';
  status: EventStatus;
  confidence?: number;            // уверенность AI
  rawText?: string;               // сырой текст из STT
  linkedEventIds?: string[];      // связанные события
  tags?: string[];
  payload?: Record<string, unknown>; // доп. данные
}
```

### Voice Observation

```typescript
interface VoiceObservation {
  id: string;
  childId: string;
  speakerRole: 'parent' | 'tutor' | 'specialist';
  audioUrl?: string;
  transcript: string;             // текст из STT
  durationSeconds: number;
  parsedEventIds: string[];       // IDs созданных событий
  aiSummary: string;
  confirmationStatus: 'pending' | 'confirmed' | 'edited';
}
```

### AI Insight

```typescript
interface AIInsight {
  id: string;
  childId: string;
  relatedEventIds: string[];
  type: 'pattern' | 'possible_trigger' | 'communication_hint' 
      | 'toilet_prediction' | 'sensory_hint' | 'care_summary';
  text: string;                   // "Похоже, ..."
  confidence: number;
  status: 'suggested' | 'confirmed' | 'dismissed';
}
```

### Notification

```typescript
interface NotificationItem {
  id: string;
  childId: string;
  title: string;
  description: string;
  type: 'aac' | 'sos' | 'report' | 'ai_review' | 'device';
  createdAt: string;
  isRead: boolean;
}
```

### Relationships

```
ChildProfile 1───* QoldauEvent
ChildProfile 1───* Signal
ChildProfile 1───* VoiceObservation
ChildProfile 1───* AIInsight
ChildProfile 1───* NotificationItem
QoldauEvent ──── * QoldauEvent (linked events)
VoiceObservation ──── * QoldauEvent (parsed events)
AIInsight ──── * QoldauEvent (related events)
```

### Event Timeline Principle

**Все** данные строятся вокруг единой Event Timeline. Нет отдельных дневников для питания, туалета и т.д. — это всё события с типом.
