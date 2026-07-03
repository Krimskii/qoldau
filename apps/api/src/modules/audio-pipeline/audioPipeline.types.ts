import type { SourceRole } from '../../repositories/events.js';

export type AudioPipelineMode = 'observation' | 'child_speech' | 'tutor_note';

export interface AudioIngestRequest {
  audioBase64?: string;
  childId?: string;
  sourceRole?: SourceRole;
  durationSec?: number;
  language?: 'ru' | 'kk' | 'en' | 'auto' | string;
  mimeType?: string;
  mode?: AudioPipelineMode;
}

export interface AudioPipelineInput {
  audioBase64: string;
  childId: string;
  sourceRole: SourceRole;
  durationSec?: number;
  language?: string;
  mimeType?: string;
  mode: AudioPipelineMode;
}

export interface AudioPipelineAIResult {
  source: string;
  model: string;
  insight: string;
  clarificationQuestions: Array<{
    id?: string;
    text: string;
    options?: string[];
  }>;
}

export interface AudioPipelineEvent {
  timestamp?: string;
  title: string;
  description: string;
  type: string;
  sourceRole: SourceRole;
}

export interface AudioPipelineResult {
  ok: true;
  jobId: string;
  status: 'completed';
  transcript: string;
  ai: AudioPipelineAIResult;
  events: AudioPipelineEvent[];
  insight: string;
  questions: Array<{
    id?: string;
    text: string;
    options?: string[];
  }>;
  sttMode: string;
  aiMode: string;
  durationSec?: number;
}

export class AudioPipelineError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
