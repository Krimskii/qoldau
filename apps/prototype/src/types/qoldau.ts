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
 * EventPayloadMap — типизированный payload для каждого EventType.
 *
 * v1.5+ (wave 2): раньше `payload` был Record<string, unknown> — приходилось
 * делать ручные касты в UI. Теперь payload типизирован по `type` через
 * дженерик QoldauEvent<T>. Для типов без специальной схемы — fallback на
 * Record<string, unknown>.
 *
 * Конвенция:
 *   - поля camelCase
 *   - опциональные поля помечены `?`
 *   - id'шники — string, ISO-timestamp'ы — string
 *   - числа — где нужны единицы измерения, лежат в названии поля
 *     (`durationSec`, `volumeMl` и т.д.)
 *
 * Для типов, у которых нет специальной схемы (sensory, sleep, …) —
 * `Record<string, unknown>` разрешает любой payload (для обратной
 * совместимости с существующими вызовами).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPayload = Record<string, any>;

export interface FoodPayload {
  foodName?: string;
  foodDetails?: string;
  amount?: string;
  ateWell?: boolean;
  newFood?: boolean;
  volumeMl?: number;
  /** Кастомные поля, которые вызывающий код может добавлять (legacy). */
  [key: string]: unknown;
}

export interface WaterPayload {
  waterAmount?: string;
  volumeMl?: number;
  askedFor?: boolean;
  [key: string]: unknown;
}

export interface ToiletPayload {
  /** Свободная строка: 'pee' / 'poop' / 'dry' / 'accident' / 'toilet' / ... */
  action?: string;
  notes?: string;
  durationSec?: number;
  selfInitiated?: boolean;
  [key: string]: unknown;
}

export interface BehaviorPayload {
  antecedent?: string;
  behavior?: string;
  consequence?: string;
  mood?: string;
  durationSec?: number;
  intensity?: number;
  [key: string]: unknown;
}

export interface CommunicationPayload {
  kind?: string;
  utterance?: string;
  addressedTo?: string;
  initiated?: boolean;
  [key: string]: unknown;
}

export interface StatePayload {
  stateName?: string;
  source?: string;
  [key: string]: unknown;
}

export interface AACPayload {
  cardId?: string;
  cardLabel?: string;
  intent?: string;
  /** Legacy поле — какое действие было (для совместимости с v3-кодом). */
  action?: string;
  [key: string]: unknown;
}

export interface PhrasePayload {
  phrase?: string;
  cards?: Array<{ id: string; label: string }>;
  /** Legacy: откуда пришла фраза. */
  source?: string;
  [key: string]: unknown;
}

export interface MediaRequestPayload {
  cardId?: string;
  cardLabel?: string;
  assetId?: string;
  assetType?: string;
  [key: string]: unknown;
}

export interface CalmModePayload {
  triggeredBy?: string;
  durationSec?: number;
  startedAt?: string;
  [key: string]: unknown;
}

export interface SOSPayload {
  triggeredBy?: string;
  note?: string;
  addressedTo?: string;
  [key: string]: unknown;
}

export interface VoiceObservationPayload {
  sttSource?: string;
  aiInsight?: string;
  safetyDisclaimer?: string;
  originalTranscript?: string;
  editedTranscript?: string;
  clarificationAnswers?: Record<string, string>;
  extractedLocalIds?: string[];
  [key: string]: unknown;
}

export interface TutorNotePayload {
  sttSource?: string;
  clarificationAnswers?: Record<string, string>;
  [key: string]: unknown;
}

export interface SpecialistNotePayload {
  sttSource?: string;
  clarificationAnswers?: Record<string, string>;
  abcSummary?: string;
  [key: string]: unknown;
}

export interface SensoryPayload {
  modalities?: string[];
  reaction?: string;
  trigger?: string;
  [key: string]: unknown;
}

export interface SleepPayload {
  durationSec?: number;
  quality?: string;
  kind?: string;
  [key: string]: unknown;
}

/**
 * Мапа type → payload-тип. Типы без специальной схемы маппятся на
 * AnyPayload (без ограничений).
 */
export interface EventPayloadMap {
  voice_observation: VoiceObservationPayload;
  food: FoodPayload;
  water: WaterPayload;
  toilet: ToiletPayload;
  sleep: SleepPayload;
  behavior: BehaviorPayload;
  sensory: SensoryPayload;
  communication: CommunicationPayload;
  aac_card: AACPayload;
  phrase: PhrasePayload;
  media_request: MediaRequestPayload;
  sos: SOSPayload;
  calm_mode: CalmModePayload;
  tutor_note: TutorNotePayload;
  specialist_note: SpecialistNotePayload;
  state: StatePayload;
}

/** Хелпер: payload-тип для конкретного EventType. */
export type PayloadOf<T extends EventType> =
  T extends keyof EventPayloadMap ? EventPayloadMap[T] : AnyPayload;

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

/**
 * QoldauEvent<T extends EventType = EventType> — единое событие с
 * типизированным payload по типу.
 *
 * По умолчанию T = EventType, и payload типизирован как union всех
 * возможных payload-типов. Если вызывающему коду известен конкретный тип
 * (например, после switch по `type`), он может уточнить:
 *
 *   const e: QoldauEvent<'food'> = ...;
 *   const food = e.payload?.foodName; // строго типизировано
 *
 * Старое поле `timestamp` оставлено как алиас `occurredAt` для
 * обратной совместимости с v2/v3-миграциями. НЕ УДАЛЯТЬ пока живут
 * пилоты (см. тикет docs/tickets/MINIMAX_v1.5_typed_payload.md).
 */
export interface QoldauEvent<T extends EventType = EventType> {
  id: string;
  childId: string;
  type: T;
  title: string;
  description: string;
  /**
   * Алиас occurredAt, оставлен для обратной совместимости с миграциями
   * v2 → v3. См. JSDoc у occurredAt. НЕ УДАЛЯТЬ.
   */
  timestamp: string;
  /** Когда событие произошло (по наблюдению). */
  occurredAt: string;
  /** Когда событие было записано в стор. */
  recordedAt: string;
  /** Конвейер-источник (manual/voice/child_ui/import). */
  source: EventSource;
  /** Роль оператора (parent/child/tutor/specialist/device/ai). */
  sourceRole: 'parent' | 'child' | 'tutor' | 'specialist' | 'device' | 'ai';
  status: EventStatus;
  /** Версия схемы (4 для v1.6 — добавили updatedAt/deletedAt). */
  schemaVersion: number;
  confidence?: number;
  rawText?: string;
  linkedEventIds?: string[];
  tags?: string[];
  /** Типизированный payload: форма зависит от `type`.
   *  Partial — все поля опциональны, и допускаются кастомные поля
   *  (наследуются от index signature в конкретных payload-интерфейсах). */
  payload?: Partial<PayloadOf<T>>;
  /** ABC-аналитика поведения (опционально). */
  abc?: EventAbc;
  /** Сенсорный контекст (звук/свет/прикосновение/…) — массив меток. */
  sensoryContext?: string[];
  /** Метаданные AI, обработавшего событие (если применимо). */
  ai?: EventAi;
  /**
   * v1.6 E9.3 — sync-метаданные:
   * updatedAt — ISO-timestamp последнего изменения записи (локально или
   *   сервером). Используется для LWW-конфликт-резолва при push.
   *   Все create/update ставят updatedAt=now.
   * deletedAt — ISO-timestamp soft-delete. Если null — запись активна.
   *   Soft-delete вместо реального удаления: данные ценны для аналитики
   *   и истории, tombstone нужен для синхронизации с сервером.
   */
  updatedAt: string;
  deletedAt?: string | null;
  /**
   * УСТАРЕЛО (v1.6). Использовать `deletedAt !== null && deletedAt !== undefined`.
   * Оставлено для обратной совместимости миграций.
   * @deprecated
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
