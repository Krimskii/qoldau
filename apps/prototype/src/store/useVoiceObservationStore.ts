/**
 * useVoiceObservationStore — единый стор для голосового потока
 * (Parent VoiceObservation + TutorVoice).
 *
 * State machine:
 *   idle → recording → stopped → transcript_ready
 *       → editing_transcript → ready_for_review → processing_ai
 *       → ready_for_review (loop для AI)
 *
 * Стор не зависит от конкретного STT/AI клиента — получает их через
 * фабрики. По умолчанию использует mock STT + mock parser.
 *
 * Обратная совместимость со старым API сохранена, чтобы существующие
 * страницы (parent/AIReview, parent/ClarifyingQuestions, tutor/*) не
 * ломались до Phase 3-6 рефакторинга UI.
 */

import { create } from 'zustand';
import {
  STTClient,
  STTInput,
  STTSpeakerRole,
  STTSource,
} from '@/lib/stt/sttClient.types';
import { mockSTTClient } from '@/lib/stt/sttClient.mock';
import { manualSTTClient } from '@/lib/stt/sttClient.manual';
import {
  AIParserClient,
  AIParserResult,
} from '@/lib/ai/aiParser.types';
import { mockAIParser } from '@/lib/ai/aiParser.mock';

// --- Типы state machine ---

export type RecordingState =
  | 'idle'
  | 'recording'
  | 'stopped'
  | 'transcript_ready'
  | 'editing_transcript'
  | 'processing_ai'
  | 'ready_for_review';

// --- Стор ---

export interface VoiceObservationState {
  // state machine
  recordingState: RecordingState;

  // recording
  isRecording: boolean; // legacy-compat alias для recordingState === 'recording'
  durationSeconds: number;
  /** Накопитель длительности — не сбрасывается при stop, чтобы AIReview знал. */
  duration: number; // legacy alias

  // transcripts
  /** Что пришло из STT (или manual) — оригинал. */
  originalTranscript: string;
  /** Что отредактировал пользователь. */
  editedTranscript: string;
  /** Эффективный — отдаётся в UI и Event.payload.rawText. */
  currentTranscript: string;
  /** Legacy alias для currentTranscript. */
  transcript: string;

  // источник
  sttSource: STTSource;
  speakerRole: STTSpeakerRole;
  childId: string;

  // AI
  /** Распарсенный AI результат. */
  aiParsedObservation: AIParserResult | null;
  /** Legacy alias. */
  parsedObservation: AIParserResult | null;
  /** Legacy — пока идёт AI processing. */
  isProcessing: boolean;

  // --- Actions (новое API) ---

  startRecording: (opts?: { speakerRole?: STTSpeakerRole; childId?: string }) => void;
  stopRecording: () => void;
  setDuration: (duration: number) => void;

  /** Прогон через mock STT (имитация записи → распознавание). */
  transcribeMock: (input?: Partial<STTInput>) => Promise<void>;
  /** Прогон через manual STT (текст введён вручную). */
  transcribeManual: (text: string, input?: Partial<STTInput>) => Promise<void>;

  markTranscriptReady: () => void;
  enterEditingTranscript: () => void;
  editTranscript: (text: string) => void;
  /** Откатить правки к originalTranscript. */
  revertTranscript: () => void;

  /** Запустить AI-разбор effective транскрипта. */
  processWithAI: () => Promise<void>;
  /** Подтвердить разбор → ready_for_review. */
  confirmAIResult: () => void;

  /** Сменить роль (parent/tutor) до начала записи. */
  setSpeakerRole: (role: STTSpeakerRole) => void;
  setChildId: (id: string) => void;

  /** Полный сброс — вызывать ТОЛЬКО после сохранения Event. */
  reset: () => void;

  // --- Legacy / compatibility ---
  /** Полный flow как раньше: запись → STT → AI. */
  processTranscript: () => Promise<{ events: any[]; insight: string }>;
}

const DEFAULT_CHILD_ID = 'child-alikhan';

export interface VoiceObservationStoreDeps {
  sttClient?: STTClient;
  parser?: AIParserClient;
}

let _deps: VoiceObservationStoreDeps = {
  sttClient: mockSTTClient,
  parser: mockAIParser,
};

/**
 * Позволяет подменить реализацию STT/AI (для тестов или future_stt).
 * В production не вызывается — используются дефолтные mock-клиенты.
 */
export function configureVoiceObservationStore(deps: VoiceObservationStoreDeps): void {
  _deps = { ..._deps, ...deps };
}

export const useVoiceObservationStore = create<VoiceObservationState>((set, get) => ({
  recordingState: 'idle',

  // legacy aliases
  isRecording: false,
  duration: 0,
  durationSeconds: 0,

  originalTranscript: '',
  editedTranscript: '',
  currentTranscript: '',
  transcript: '',

  sttSource: 'mock',
  speakerRole: 'parent',
  childId: DEFAULT_CHILD_ID,

  aiParsedObservation: null,
  parsedObservation: null,
  isProcessing: false,

  // --- Recording ---

  startRecording: (opts) => {
    set((state) => ({
      recordingState: 'recording',
      isRecording: true,
      duration: 0,
      durationSeconds: 0,
      speakerRole: opts?.speakerRole ?? state.speakerRole,
      childId: opts?.childId ?? state.childId,
      originalTranscript: '',
      editedTranscript: '',
      currentTranscript: '',
      transcript: '',
      aiParsedObservation: null,
      parsedObservation: null,
      isProcessing: false,
    }));
  },

  stopRecording: () => {
    set({
      recordingState: 'stopped',
      isRecording: false,
    });
  },

  setDuration: (duration) => {
    set({ duration, durationSeconds: duration });
  },

  // --- STT flows ---

  transcribeMock: async (input) => {
    set({
      recordingState: 'processing_ai',
      isProcessing: true,
    });

    const client = input ? _deps.sttClient ?? mockSTTClient : _deps.sttClient ?? mockSTTClient;

    const state = get();
    const result = await client.transcribe({
      audioBlob: input?.audioBlob,
      manualText: input?.manualText,
      language: input?.language ?? 'ru',
      speakerRole: state.speakerRole,
      childId: state.childId,
    });

    set({
      originalTranscript: result.transcript,
      editedTranscript: result.transcript,
      currentTranscript: result.transcript,
      transcript: result.transcript,
      sttSource: result.source,
      durationSeconds: result.durationSeconds ?? state.durationSeconds,
      duration: result.durationSeconds ?? state.duration,
      recordingState: 'transcript_ready',
      isProcessing: false,
    });
  },

  transcribeManual: async (text, input) => {
    set({ isProcessing: true });
    try {
      const state = get();
      const result = await manualSTTClient.transcribe({
        manualText: text,
        language: input?.language ?? 'ru',
        speakerRole: state.speakerRole,
        childId: state.childId,
      });
      set({
        originalTranscript: result.transcript,
        editedTranscript: result.transcript,
        currentTranscript: result.transcript,
        transcript: result.transcript,
        sttSource: 'manual',
        recordingState: 'transcript_ready',
        isProcessing: false,
      });
    } catch (e) {
      set({ isProcessing: false });
      throw e;
    }
  },

  markTranscriptReady: () => set({ recordingState: 'transcript_ready' }),

  enterEditingTranscript: () => set({ recordingState: 'editing_transcript' }),

  editTranscript: (text) => {
    set({
      editedTranscript: text,
      currentTranscript: text,
      transcript: text,
    });
  },

  revertTranscript: () => {
    set((state) => ({
      editedTranscript: state.originalTranscript,
      currentTranscript: state.originalTranscript,
      transcript: state.originalTranscript,
    }));
  },

  // --- AI flow ---

  processWithAI: async () => {
    set({ recordingState: 'processing_ai', isProcessing: true });
    const state = get();
    const parser = _deps.parser ?? mockAIParser;
    const parsed = await parser.parseObservation({
      transcript: state.currentTranscript,
      childId: state.childId,
      speakerRole:
        state.speakerRole === 'child'
          ? 'specialist'
          : (state.speakerRole as 'parent' | 'tutor' | 'specialist'),
      language: 'ru',
    });
    set({
      aiParsedObservation: parsed,
      parsedObservation: parsed,
      recordingState: 'ready_for_review',
      isProcessing: false,
    });
  },

  confirmAIResult: () => set({ recordingState: 'ready_for_review' }),

  setSpeakerRole: (role) => set({ speakerRole: role }),
  setChildId: (id) => set({ childId: id }),

  reset: () =>
    set({
      recordingState: 'idle',
      isRecording: false,
      duration: 0,
      durationSeconds: 0,
      originalTranscript: '',
      editedTranscript: '',
      currentTranscript: '',
      transcript: '',
      sttSource: 'mock',
      aiParsedObservation: null,
      parsedObservation: null,
      isProcessing: false,
    }),

  // --- Legacy flow (mock + ai одним заходом, как раньше) ---

  processTranscript: async () => {
    set({ isProcessing: true });
    const state = get();
    const stt = _deps.sttClient ?? mockSTTClient;
    const parser = _deps.parser ?? mockAIParser;

    const sttRes = await stt.transcribe({
      language: 'ru',
      speakerRole: state.speakerRole,
      childId: state.childId,
    });
    set({
      originalTranscript: sttRes.transcript,
      editedTranscript: sttRes.transcript,
      currentTranscript: sttRes.transcript,
      transcript: sttRes.transcript,
      sttSource: sttRes.source,
      durationSeconds: sttRes.durationSeconds ?? state.durationSeconds,
      duration: sttRes.durationSeconds ?? state.duration,
    });

    const parsed = await parser.parseObservation({
      transcript: sttRes.transcript,
      childId: state.childId,
      speakerRole:
        state.speakerRole === 'child'
          ? 'specialist'
          : (state.speakerRole as 'parent' | 'tutor' | 'specialist'),
      language: 'ru',
    });

    set({
      aiParsedObservation: parsed,
      parsedObservation: parsed,
      recordingState: 'ready_for_review',
      isProcessing: false,
    });
    return { events: parsed.events, insight: parsed.insight };
  },
}));