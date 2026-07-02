import { request } from './client';
import type { UserRole } from '@/types/qoldau';

export type AudioPipelineMode = 'observation' | 'child_speech' | 'tutor_note';

export interface UploadAudioObservationInput {
  blob: Blob;
  childId: string;
  sourceRole: Extract<UserRole, 'parent' | 'child' | 'tutor' | 'specialist'>;
  durationSec?: number;
  language?: 'ru' | 'kk' | 'en' | 'auto';
  mode?: AudioPipelineMode;
}

export interface AudioPipelineResponse {
  ok: true;
  jobId: string;
  status: 'completed';
  recording: {
    id: string;
    childId: string;
    label: string;
    durationSec: number;
    transcript: string;
    sttSource: string;
    timestamp: string;
  };
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
  events: unknown[];
}

async function blobToBase64(blob: Blob): Promise<string> {
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
  const audioBase64 = await blobToBase64(input.blob);
  return request<AudioPipelineResponse>('/api/audio/ingest', {
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
}
