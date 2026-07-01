import { create } from 'zustand';
import { AIParsedObservation, ParsedEvent } from './aiParser.mock';
import { mockSTTResponse } from './sttClient.mock';

interface VoiceObservationState {
  isRecording: boolean;
  duration: number;
  transcript: string;
  parsedObservation: AIParsedObservation | null;
  isProcessing: boolean;
  
  // Actions
  startRecording: () => void;
  stopRecording: () => void;
  setDuration: (duration: number) => void;
  processTranscript: () => Promise<AIParsedObservation>;
  reset: () => void;
}

export const useVoiceObservationStore = create<VoiceObservationState>((set, get) => ({
  isRecording: false,
  duration: 0,
  transcript: '',
  parsedObservation: null,
  isProcessing: false,

  startRecording: () => set({ isRecording: true, duration: 0, transcript: '', parsedObservation: null }),
  
  stopRecording: () => {
    set({ isRecording: false });
  },

  setDuration: (duration) => set({ duration }),

  processTranscript: async () => {
    set({ isProcessing: true });
    
    // Simulate STT processing
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Get mock transcript
    const transcript = mockSTTResponse.transcript;
    set({ transcript });
    
    // Simulate AI parsing
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Mock parsed observation
    const parsedObservation: AIParsedObservation = {
      events: [
        {
          type: 'food',
          title: 'Питание',
          description: 'Каша с сыром, немного воды',
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          confidence: 0.85,
        },
        {
          type: 'behavior',
          title: 'Поведение',
          description: 'Нервничал, закрывал уши',
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          confidence: 0.78,
        },
        {
          type: 'toilet',
          title: 'Туалет',
          description: 'Стул жидкий',
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          confidence: 0.82,
        },
      ],
      insight: 'Похоже, нервозность появилась после еды и перед туалетом. Возможна связь с дискомфортом или сенсорной нагрузкой. Это наблюдение, не диагноз.',
      clarificationQuestions: [
        'Сколько воды выпил?',
        'После туалета стало легче?',
        'Был ли шум вокруг?',
      ],
    };
    
    set({ parsedObservation, isProcessing: false });
    return parsedObservation;
  },

  reset: () => set({
    isRecording: false,
    duration: 0,
    transcript: '',
    parsedObservation: null,
    isProcessing: false,
  }),
}));
