import { randomUUID } from 'node:crypto';
import { sttService } from '../../services/sttService.js';
import { llmService } from '../../services/llmService.js';
import type { EventType, SourceRole } from '../../repositories/events.js';
import {
  AudioPipelineError,
  type AudioIngestRequest,
  type AudioPipelineEvent,
  type AudioPipelineInput,
  type AudioPipelineResult,
} from './audioPipeline.types.js';

const MAX_AUDIO_MB = Number(process.env.AUDIO_MAX_MB ?? 25);
const MAX_AUDIO_BYTES = MAX_AUDIO_MB * 1024 * 1024;

const VALID_SOURCE_ROLES: SourceRole[] = ['parent', 'child', 'tutor', 'specialist', 'device', 'ai'];
const VALID_EVENT_TYPES: EventType[] = [
  'food',
  'water',
  'toilet',
  'sleep',
  'behavior',
  'sensory',
  'communication',
  'aac_card',
  'voice_observation',
  'phrase',
  'media_request',
  'sos',
  'tutor_note',
  'calm_mode',
  'state',
];

function estimateBase64Bytes(base64: string): number {
  const clean = base64.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  return Math.floor((clean.length * 3) / 4) - padding;
}

function normalizeBase64(base64: string): string {
  return base64.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
}

function validateInput(input: AudioIngestRequest): AudioPipelineInput {
  const audioBase64 = typeof input.audioBase64 === 'string' ? normalizeBase64(input.audioBase64) : '';
  if (!audioBase64) {
    throw new AudioPipelineError('AUDIO_REQUIRED', 'audioBase64 is required');
  }

  const audioBytes = estimateBase64Bytes(audioBase64);
  if (audioBytes > MAX_AUDIO_BYTES) {
    throw new AudioPipelineError('AUDIO_TOO_LARGE', `Audio exceeds ${MAX_AUDIO_MB} MB`, 413);
  }

  if (!input.childId || typeof input.childId !== 'string') {
    throw new AudioPipelineError('CHILD_REQUIRED', 'childId is required');
  }

  if (!input.sourceRole || !VALID_SOURCE_ROLES.includes(input.sourceRole)) {
    throw new AudioPipelineError('SOURCE_ROLE_INVALID', 'sourceRole is invalid');
  }

  return {
    audioBase64,
    childId: input.childId,
    sourceRole: input.sourceRole,
    durationSec: typeof input.durationSec === 'number' ? Math.max(0, Math.round(input.durationSec)) : undefined,
    language: input.language === 'auto' ? undefined : input.language,
    mimeType: input.mimeType,
    mode: input.mode ?? 'observation',
  };
}

function normalizeEventType(type: string): EventType {
  return VALID_EVENT_TYPES.includes(type as EventType) ? (type as EventType) : 'voice_observation';
}

function toStatelessEvent(params: {
  parsed: { timestamp?: string; title: string; description: string; type: string };
  sourceRole: SourceRole;
}): AudioPipelineEvent {
  return {
    type: normalizeEventType(params.parsed.type),
    title: params.parsed.title,
    description: params.parsed.description,
    timestamp: params.parsed.timestamp,
    sourceRole: params.sourceRole,
  };
}

function normalizeQuestions(
  questions: Array<{ id?: string; question?: string; options?: string[] }>,
): Array<{ id?: string; text: string; options?: string[] }> {
  return questions
    .map((q) => ({
      id: q.id,
      text: typeof q.question === 'string' ? q.question : '',
      options: Array.isArray(q.options) ? q.options : undefined,
    }))
    .filter((q) => q.text.length > 0);
}

export const audioPipelineService = {
  validateInput,

  async process(rawInput: AudioIngestRequest): Promise<AudioPipelineResult> {
    const input = validateInput(rawInput);
    const jobId = `audio-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const stt = await sttService.transcribe({
      audio: input.audioBase64,
      language: input.language,
    });

    const transcript = stt.transcript.trim();
    const llm = await llmService.parseTranscript({
      transcript,
      childId: input.childId,
      language: input.language,
    });

    const questions = normalizeQuestions(llm.clarificationQuestions);
    const events = llm.events.map((parsed) => toStatelessEvent({
      parsed,
      sourceRole: input.sourceRole,
    }));

    return {
      ok: true,
      jobId,
      status: 'completed',
      transcript,
      events,
      insight: llm.insight,
      questions,
      sttMode: stt.source,
      aiMode: llm.source,
      durationSec: input.durationSec ?? stt.durationSec,
      ai: {
        source: llm.source,
        model: llmService.model,
        insight: llm.insight,
        clarificationQuestions: questions,
      },
    };
  },
};
