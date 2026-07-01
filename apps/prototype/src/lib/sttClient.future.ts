// Future STT client integration
// Replace mockSTTClient in sttClient.mock.ts with your STT API implementation

export interface STTFutureConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

// Integration example:
/*
export async function createRealSTTClient(config: STTFutureConfig): Promise<STTClient> {
  return {
    async transcribeAudio(request: STTTranscriptionRequest): Promise<STTTranscriptionResponse> {
      const formData = new FormData();
      if (request.audioFile instanceof Blob) {
        formData.append('audio', request.audioFile);
      }
      formData.append('language', request.language || 'ru');
      formData.append('speaker_role', request.speakerRole || 'parent');

      const response = await fetch(`${config.endpoint}/v1/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('STT transcription failed');
      }

      return response.json();
    },
  };
}
*/

export {};
