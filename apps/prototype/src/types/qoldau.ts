export type UserRole = 'parent' | 'child' | 'tutor' | 'specialist' | 'overview';

export type EventType =
  | 'voice_observation'
  | 'food'
  | 'water'
  | 'toilet'
  | 'sleep'
  | 'behavior'
  | 'sensory'
  | 'communication'
  | 'aac_card'
  | 'phrase'
  | 'media_request'
  | 'sos'
  | 'calm_mode'
  | 'tutor_note'
  | 'specialist_note'
  | 'state';

export type EventStatus = 'draft' | 'ai_parsed' | 'confirmed' | 'corrected' | 'rejected';

/**
 * Источник события — кто/что его создало. v1.5+: заменил «sourceRole»
 * (роль оператора) на «source» (конвейер). Старые события мигрируются
 * на основе sourceRole (см. useEventStore.migrate).
 */
export type EventSource = 'manual' | 'voice' | 'child_ui' | 'import';

/**
 * ABC (Antecedent / Behavior / Consequence) — структура поведенческого
 * наблюдения. Все три поля опциональны; это просто удобный
 * нормализованный вид для аналитики, ABC-страницы и AI-инсайтов.
 */
export interface EventAbc {
  antecedent?: string;
  behavior?: string;
  consequence?: string;
}

/**
 * Метаданные об AI, обработавшем событие (если оно проходило через
 * пайплайн). aiFallback=true когда AI вернул mock/не смог — это
 * сигнал UI показать «AI недоступен», а не прятать событие.
 */
export interface EventAi {
  model?: string;
  promptVersion?: string;
  aiFallback?: boolean;
  aiError?: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  diagnosisLabel: string;
  currentState: string;
  avatar?: string;
  mainSignals: Signal[];
}

export interface Signal {
  id: string;
  signal: string;
  kind: 'sound' | 'word' | 'gesture' | 'behavior' | 'aac';
  possibleMeaning: string;
  confidence: number;
  confirmedCount: number;
  lastSeenAt: string;
}

export interface QoldauEvent {
  id: string;
  childId: string;
  type: EventType;
  title: string;
  description: string;
  /**
   * Время записи в UI (когда пользователь нажал «сохранить»).
   * Заполняется ВСЕГДА. Эквивалентно старому полю «timestamp».
   * @deprecated Используйте {@link occurredAt} для времени самого события,
   *           {@link recordedAt} для времени сохранения. Поле оставлено
   *           обязательным для обратной совместимости с v2-payload'ами.
   */
  timestamp: string;
  /**
   * Когда событие реально произошло (по наблюдению родителя / ребёнка).
   * Может совпадать с recordedAt, если событие задним числом не правили.
   * v1.5+: формализованное поле для тепловой карты недели и ABC-аналитики.
   */
  occurredAt: string;
  /**
   * Когда событие было записано в локальный стор (Date.now()).
   * Используется для сортировки и для «добавлено N минут назад».
   */
  recordedAt: string;
  /**
   * Конвейер-источник: кто/что создал событие. v1.5+ заменяет
   * канонический смысл «sourceRole» (роль оператора).
   */
  source: EventSource;
  /**
   * Роль оператора (кто нажал кнопку). Сохранено для UI/логов;
   * для аналитики использовать {@link source}.
   */
  sourceRole: 'parent' | 'child' | 'tutor' | 'specialist' | 'device' | 'ai';
  status: EventStatus;
  /**
   * Версия схемы события. v1.5 = 3. Используется миграцией zustand-persist.
   * Любой код, читающий QoldauEvent, может полагаться на schemaVersion.
   */
  schemaVersion: number;
  confidence?: number;
  rawText?: string;
  linkedEventIds?: string[];
  tags?: string[];
  payload?: Record<string, unknown>;
  /** ABC-аналитика поведения (опционально). */
  abc?: EventAbc;
  /** Сенсорный контекст (звук/свет/прикосновение/…) — массив меток. */
  sensoryContext?: string[];
  /** Метаданные AI, обработавшего событие (если применимо). */
  ai?: EventAi;
  /**
   * Soft-delete флаг. Реальное удаление событий не используется —
   * данные ценны для аналитики и истории. {@link EventStorage.remove}
   * просто выставляет deleted:true; query-фильтр исключает такие
   * события из выборок.
   */
  deleted?: boolean;
}

export interface VoiceObservation {
  id: string;
  childId: string;
  speakerRole: 'parent' | 'tutor' | 'specialist';
  audioUrl?: string;
  transcript: string;
  durationSeconds: number;
  parsedEventIds: string[];
  aiSummary: string;
  confirmationStatus: 'pending' | 'confirmed' | 'edited';
}

export interface AIInsight {
  id: string;
  childId: string;
  relatedEventIds: string[];
  type:
    | 'pattern'
    | 'possible_trigger'
    | 'communication_hint'
    | 'toilet_prediction'
    | 'sensory_hint'
    | 'care_summary';
  text: string;
  confidence: number;
  status: 'suggested' | 'confirmed' | 'dismissed';
}

export interface NotificationItem {
  id: string;
  childId: string;
  title: string;
  description: string;
  type: 'aac' | 'sos' | 'report' | 'ai_review' | 'device';
  createdAt: string;
  isRead: boolean;
}

export interface QuickAction {
  id: string;
  type: EventType;
  label: string;
  icon: string;
  color: string;
}
