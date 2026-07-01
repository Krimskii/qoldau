/**
 * AI Parser — абстракция структурирования свободного текста наблюдения
 * в список событий (Event Timeline), AI-insight и уточняющие вопросы.
 *
 * Две реализации:
 * - aiParser.mock.ts   — простой regex-based парсер для demo-режима
 * - aiParser.future.ts — заглушка для будущей интеграции с реальным LLM
 *
 * ВАЖНО: парсер НЕ ставит диагнозы и НЕ «лечит». Только осторожные
 * формулировки: «Похоже…», «Возможно…», «Нужно подтвердить»,
 * «Это наблюдение, не диагноз.».
 */

import { STTLanguage } from '../stt/sttClient.types';

export type AISpeakerRole = 'parent' | 'tutor' | 'specialist';

export interface ParsedEvent {
  /** Локальный id для UI (event получит глобальный id в EventFactory). */
  localId: string;
  type:
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
  title: string;
  description: string;
  /** ISO timestamp события. */
  timestamp: string;
  /** 0..1 — насколько AI уверен в этой выжимке. */
  confidence: number;
}

export interface ClarificationQuestion {
  /** Стабильный id вопроса — на него ссылаются ответы в Event.payload. */
  id: string;
  question: string;
  /** Возможные варианты — UI рендерит как чипы. */
  options: string[];
  /** Какой вариант выбран по умолчанию (если есть). */
  defaultOption?: string;
}

export interface AIParserInput {
  transcript: string;
  childId: string;
  speakerRole: AISpeakerRole;
  language: STTLanguage;
}

export interface AIParserResult {
  events: ParsedEvent[];
  /** Осторожная формулировка инсайта (без диагнозов). */
  insight: string;
  /** Уточняющие вопросы — если они есть, родителю показывается экран ClarifyingQuestions. */
  clarificationQuestions: ClarificationQuestion[];
  /** Обязательный disclaimer — UI рендерит всегда. */
  safetyDisclaimer: string;
}

export interface AIParserClient {
  parseObservation(input: AIParserInput): Promise<AIParserResult>;
}

export type AIParserClientFactory = () => AIParserClient;