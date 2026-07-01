export const mockSpecialistData = {
  signals: [
    { signal: '"ба"', possibleMeaning: 'вода', confirmed: 12 },
    { signal: '"ту-ту"', possibleMeaning: 'туалет', confirmed: 8 },
    { signal: '"ма"', possibleMeaning: 'мама / помощь', confirmed: 25 },
    { signal: 'закрывает уши', possibleMeaning: 'шум / перегрузка', confirmed: 15 },
    { signal: 'тянет за руку', possibleMeaning: 'хочет показать', confirmed: 6 },
  ],
  patterns: [
    {
      trigger: 'После еды',
      behavior: 'Нервничает, закрывает уши',
      consequence: 'Стул жидкий, потом спокойнее',
    },
  ],
  careSummary: {
    food: { count: 3, note: 'Мало воды и клетчатки' },
    toilet: { count: 4, note: 'Следить за консистенцией' },
    sleep: { count: 1, note: 'Хорошо спал ночью' },
  },
};
