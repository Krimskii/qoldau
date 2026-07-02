import { randomUUID } from 'node:crypto';
import { sttService } from '../../services/sttService.js';
import { llmService } from '../../services/llmService.js';
import { realtimeService } from '../../services/realtimeService.js';
import { eventsRepo, type EventInput, type EventType, type SourceRole } from '../../repositories/events.js';
import { recordingsRepo } from '../../repositories/recordings.js';
import {
  AudioPipelineError,
  type AudioIngestRequest,
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

function makeRecordingLabel(transcript: string): string {
  const clean = transcript.trim().replace(/\s+/g, ' ');
  if (!clean) return 'Голосовая запись';
  return clean.length > 48 ? `${clean.slice(0, 48)}...` : clean;
}

function parseEventTimestamp(raw: string | undefined): Date {
  const date = new Date();
  if (!raw) return date;
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return date;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) return date;
  date.setHours(hour, minute, 0, 0);
  return date;
}

function normalizeEventType(type: string): EventType {
  return VALID_EVENT_TYPES.includes(type as EventType) ? (type as EventType) : 'voice_observation';
}

function toEventInput(params: {
  parsed: { timestamp?: string; title: string; description: string; type: string };
  childId: string;
  sourceRole: SourceRole;
  transcript: string;
  recordingId: string;
  jobId: string;
  index: number;
}): EventInput {
  return {
    childId: params.childId,
    type: normalizeEventType(params.parsed.type),
    title: params.parsed.title,
    description: params.parsed.description,
    sourceRole: params.sourceRole,
    timestamp: parseEventTimestamp(params.parsed.timestamp),
    status: params.sourceRole === 'child' ? 'confirmed' : 'pending',
    rawText: params.transcript,
    payload: {
      ai: true,
      source: 'audio_pipeline',
      recordingId: params.recordingId,
      jobId: params.jobId,
      index: params.index,
    },
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

    const recording = await recordingsRepo.create({
      childId: input.childId,
      label: makeRecordingLabel(transcript),
      durationSec: input.durationSec ?? stt.durationSec,
    });

    const createdEvents = [];
    for (const [index, parsed] of llm.events.entries()) {
      const event = await eventsRepo.create(
        toEventInput({
          parsed,
          childId: input.childId,
          sourceRole: input.sourceRole,
          transcript,
          recordingId: recording.id,
          jobId,
          index,
        }),
      );
      realtimeService.broadcastEvent({ childId: event.childId, id: event.id });
      createdEvents.push(event);
    }

    return {
      ok: true,
      jobId,
      status: 'completed',
      recording: {
        ...recording,
        transcript,
        sttSource: stt.source,
      },
      ai: {
        source: llm.source,
        model: llmService.model,
        insight: llm.insight,
        clarificationQuestions: normalizeQuestions(llm.clarificationQuestions),
      },
      events: createdEvents,
    };
  },
};
