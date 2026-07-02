import { VoiceObservation, AIInsight } from '@/types/qoldau';

export const mockVoiceObservation: VoiceObservation = {
  id: 'voice-1',
  childId: 'child-1',
  speakerRole: 'parent',
  transcript:
    'Ребёнок поел кашу с сыром, выпил немного воды. Через двадцать минут начал нервничать и закрывал уши. Потом сказал ту-ту и сходил в туалет, стул жидкий.',
  durationSeconds: 28,
  parsedEventIds: ['evt-new-1', 'evt-new-2', 'evt-new-3', 'evt-new-4'],
  aiSummary: 'Зафиксированы события: питание, поведение, коммуникация, туалет.',
  confirmationStatus: 'pending',
};

export const mockAIInsight: AIInsight = {
  id: 'insight-1',
  childId: 'child-1',
  relatedEventIds: ['evt-3', 'evt-5'],
  type: 'pattern',
  text: 'Похоже, нервозность появилась после еды и перед туалетом. Возможна связь с дискомфортом или сенсорной нагрузкой. Это наблюдение, не диагноз.',
  confidence: 0.72,
  status: 'suggested',
};

export const mockAIParsedObservation = {
  events: [
    {
      type: 'food',
      title: 'Питание',
      description: 'Каша с сыром, немного воды',
      timestamp: '10:10',
    },
    {
      type: 'behavior',
      title: 'Поведение',
      description: 'Нервничал, закрывал уши',
      timestamp: '10:30',
    },
    {
      type: 'communication',
      title: 'Коммуникация',
      description: 'Сказал звук «ту-ту»',
      timestamp: '10:38',
    },
    {
      type: 'toilet',
      title: 'Туалет',
      description: 'Стул жидкий',
      timestamp: '10:40',
    },
  ],
  insight:
    'Похоже, нервозность появилась после еды и перед туалетом. Возможна связь с дискомфортом или сенсорной нагрузкой. Это наблюдение, не диагноз.',
  clarificationQuestions: [
    'Сколько воды выпил?',
    'После туалета стало легче?',
    'Был ли шум вокруг?',
  ],
};
