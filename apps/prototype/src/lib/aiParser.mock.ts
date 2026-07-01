export interface ParsedEvent {
  type: 'food' | 'behavior' | 'communication' | 'toilet' | 'state' | 'water' | 'sleep' | 'sensory';
  title: string;
  description: string;
  timestamp: string;
  confidence: number;
}

export interface AIParsedObservation {
  events: ParsedEvent[];
  insight: string;
  clarificationQuestions: string[];
}

export const mockAIParser = {
  async parseTranscript(transcript: string): Promise<AIParsedObservation> {
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple mock parsing logic
    const events: ParsedEvent[] = [];
    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.includes('ел') || lowerTranscript.includes('есть') || lowerTranscript.includes('каша')) {
      events.push({
        type: 'food',
        title: 'Питание',
        description: 'Каша с сыром, немного воды',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.85,
      });
    }

    if (lowerTranscript.includes('нервнича') || lowerTranscript.includes('закрыва')) {
      events.push({
        type: 'behavior',
        title: 'Поведение',
        description: 'Нервничал, закрывал уши',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.78,
      });
    }

    if (lowerTranscript.includes('ту-ту') || lowerTranscript.includes('туалет') || lowerTranscript.includes('сходил')) {
      events.push({
        type: 'toilet',
        title: 'Туалет',
        description: 'Стул жидкий',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.82,
      });
    }

    if (events.length > 0 && events[0].type === 'food') {
      events.push({
        type: 'communication',
        title: 'Коммуникация',
        description: 'Сказал звук «ту-ту»',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.65,
      });
    }

    const insight = events.length > 0
      ? 'Похоже, нервозность появилась после еды и перед туалетом. Возможна связь с дискомфортом или сенсорной нагрузкой. Это наблюдение, не диагноз.'
      : 'Не удалось распознать события. Попробуйте описать наблюдение более конкретно.';

    const clarificationQuestions = events.some((e) => e.type === 'food')
      ? ['Сколько воды выпил?', 'После туалета стало легче?', 'Был ли шум вокруг?']
      : [];

    return {
      events,
      insight,
      clarificationQuestions,
    };
  },
};
