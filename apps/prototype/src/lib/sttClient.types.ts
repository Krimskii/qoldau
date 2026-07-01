export interface STTTranscriptionRequest {
  audioFile: File | Blob | string;
  language?: 'ru' | 'kk' | 'en';
  childId?: string;
  speakerRole?: 'parent' | 'tutor' | 'specialist';
}

export interface STTTranscriptionResponse {
  transcript: string;
  durationSeconds: number;
  confidence?: number;
  language?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface STTClient {
  transcribeAudio(request: STTTranscriptionRequest): Promise<STTTranscriptionResponse>;
}

// Future integration point - replace mockSTTClient with real implementation
export type STTClientFactory = () => STTClient;
