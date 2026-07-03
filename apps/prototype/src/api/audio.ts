import { ApiError, request } from './client';
import type { UserRole } from '@/types/qoldau';

export type AudioPipelineMode = 'observation' | 'child_speech' | 'tutor_note';
export type AudioPipelineLanguage = 'ru' | 'kk' | 'en' | 'auto';

export interface UploadAudioObservationInput {
  blob: Blob;
  childId: string;
  sourceRole: Extract<UserRole, 'parent' | 'child' | 'tutor' | 'specialist'>;
  durationSec?: number;
  language?: AudioPipelineLanguage;
  mode?: AudioPipelineMode;
}

export interface AudioPipelineResponse {
  ok: true;
  jobId: string;
  status: 'completed';
  transcript: string;
  insight: string;
  questions: Array<{
    id?: string;
    text: string;
    options?: string[];
  }>;
  sttMode: string;
  aiMode: string;
  durationSec?: number;
  ai: {
    source: string;
    model: string;
    insight: string;
    clarificationQuestions: Array<{
      id?: string;
      text: string;
      options?: string[];
    }>;
  };
  events: Array<{
    timestamp?: string;
    title: string;
    description: string;
    type: string;
    sourceRole: string;
  }>;
}

export interface AudioPipelineHealth {
  ok: true;
  service: 'audio-pipeline';
  mode: 'sync';
  maxAudioMb: number;
  jsonBodyLimit?: string;
  rateLimitPerMin?: number;
}

export class AudioIngestError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, options: { status?: number; code?: string } = {}) {
    super(message);
    this.name = 'AudioIngestError';
    this.status = options.status;
    this.code = options.code;
  }
}

export async function blobToBase64(blob: Blob): Promise<string> {
  if (typeof FileReader === 'undefined') {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read audio blob'));
    reader.readAsDataURL(blob);
  });
  return dataUrl.replace(/^data:[^;]+;base64,/, '');
}

export async function uploadAudioObservation(
  input: UploadAudioObservationInput,
): Promise<AudioPipelineResponse> {
  try {
    const audioBase64 = await blobToBase64(input.blob);
    return await request<AudioPipelineResponse>('/api/audio/ingest', {
      method: 'POST',
      body: JSON.stringify({
        audioBase64,
        mimeType: input.blob.type || 'audio/webm',
        childId: input.childId,
        sourceRole: input.sourceRole,
        durationSec: input.durationSec,
        language: input.language ?? 'ru',
        mode: input.mode ?? 'observation',
      }),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      throw new AudioIngestError(err.message || 'Audio ingest request failed', {
        status: err.status,
      });
    }
    throw new AudioIngestError(
      err instanceof Error ? err.message : 'Audio ingest request failed',
    );
  }
}

export async function getAudioPipelineHealth(): Promise<AudioPipelineHealth> {
  try {
    return await request<AudioPipelineHealth>('/api/audio/health');
  } catch (err) {
    if (err instanceof ApiError) {
      throw new AudioIngestError(err.message || 'Audio pipeline health check failed', {
        status: err.status,
      });
    }
    throw new AudioIngestError(
      err instanceof Error ? err.message : 'Audio pipeline health check failed',
    );
  }
}
