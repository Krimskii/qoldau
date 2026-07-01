import { STTTranscriptionRequest, STTTranscriptionResponse, STTClient } from './sttClient.types';

export const mockSTTResponse: STTTranscriptionResponse = {
  transcript:
    'Алихан поел кашу с сыром, выпил немного воды. Через двадцать минут начал нервничать и закрывал уши. Потом сказал ту-ту и сходил в туалет, стул жидкий.',
  durationSeconds: 28,
  confidence: 0.91,
  language: 'ru',
  segments: [
    { start: 0, end: 8, text: 'Алихан поел кашу с сыром, выпил немного воды.' },
    { start: 8, end: 18, text: 'Через двадцать минут начал нервничать и закрывал уши.' },
    { start: 18, end: 28, text: 'Потом сказал ту-ту и сходил в туалет, стул жидкий.' },
  ],
};

export const mockSTTClient: STTClient = {
  async transcribeAudio(_request: STTTranscriptionRequest): Promise<STTTranscriptionResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return mockSTTResponse;
  },
};

// Mock for recording simulation
export const simulateRecording = async (durationSeconds: number = 5): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, durationSeconds * 1000));
};
