import { create } from 'zustand';

export interface DemoStep {
  id: number;
  path: string;
  title: string;
  hint: string;
  description: string;
}

export const DEMO_STEPS: DemoStep[] = [
  { id: 1, path: '/overview', title: 'Overview', hint: 'Добро пожаловать в Qoldau AI', description: 'Продукт для сопровождения детей с РАС' },
  { id: 2, path: '/parent/home', title: 'Главная родителя', hint: 'Видим состояние ребёнка', description: 'Быстрый доступ к голосовому вводу' },
  { id: 3, path: '/parent/voice', title: 'Голосовое наблюдение', hint: 'Шаг 1 из 8', description: 'Родитель наговорит наблюдение' },
  { id: 4, path: '/parent/ai-review', title: 'AI-разбор', hint: 'AI предложил структуру', description: 'Проверяем и подтверждаем' },
  { id: 5, path: '/parent/clarify', title: 'Уточняем', hint: 'Отвечаем на вопросы', description: 'Добавляем детали' },
  { id: 6, path: '/parent/events', title: 'Event Timeline', hint: 'Все события в одном месте', description: 'Лента событий — ядро продукта' },
  { id: 7, path: '/parent/events/evt-demo-voice-1', title: 'Детали события', hint: 'Смотрим связанные события', description: 'AI-гипотеза и источник' },
  { id: 8, path: '/child/home', title: 'Интерфейс ребёнка', hint: 'Крупные кнопки', description: 'AAC карточки и голосовой ввод' },
  { id: 9, path: '/child/cards', title: 'AAC карточки', hint: 'Нажмём "Хочу пить"', description: 'Создаёт событие' },
  { id: 10, path: '/child/favorites', title: 'Любимые', hint: 'Выбираем мультик', description: 'Запрос отправлен маме' },
  { id: 11, path: '/child/speak', title: 'Голос ребёнка', hint: 'Скажем "ва"', description: 'AI распознаёт намерение' },
  { id: 12, path: '/child/phrase-builder', title: 'Сборщик фраз', hint: 'Соберём фразу', description: 'Я хочу пить воду' },
  { id: 13, path: '/tutor/home', title: 'Главная тьютора', hint: 'Подсказки и быстрые действия', description: 'Наблюдения для родителя' },
  { id: 14, path: '/tutor/ai-review', title: 'AI у тьютора', hint: 'AI предложил структуру', description: 'Проверяем и сохраняем' },
  { id: 15, path: '/tutor/report', title: 'Отчёт тьютора', hint: 'Готовый отчёт', description: 'Копируем родителю' },
  { id: 16, path: '/specialist/dashboard', title: 'Панель специалиста', hint: 'Все данные вместе', description: 'KPI и паттерны' },
  { id: 17, path: '/specialist/communication-profile', title: 'Коммуникации', hint: 'Сигналы ребёнка', description: 'Подтверждённые наблюдения' },
  { id: 18, path: '/overview', title: 'Возврат в Overview', hint: 'Демо завершено', description: 'Спасибо за внимание!' },
];

interface DemoState {
  isDemoMode: boolean;
  currentStepIndex: number;
  completedSteps: number[];
  
  // Actions
  startDemo: () => void;
  endDemo: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (index: number) => void;
  resetDemo: () => void;
  
  // Getters
  getCurrentStep: () => DemoStep;
  getProgress: () => { current: number; total: number };
  isStepCompleted: (index: number) => boolean;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  isDemoMode: false,
  currentStepIndex: 0,
  completedSteps: [],

  startDemo: () => set({ 
    isDemoMode: true, 
    currentStepIndex: 0, 
    completedSteps: [] 
  }),

  endDemo: () => set({ 
    isDemoMode: false, 
    currentStepIndex: 0, 
    completedSteps: [] 
  }),

  nextStep: () => {
    const { currentStepIndex, completedSteps } = get();
    const newCompleted = [...new Set([...completedSteps, currentStepIndex])];
    const nextIndex = Math.min(currentStepIndex + 1, DEMO_STEPS.length - 1);
    set({ 
      currentStepIndex: nextIndex,
      completedSteps: newCompleted,
    });
  },

  previousStep: () => {
    const { currentStepIndex } = get();
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    set({ currentStepIndex: prevIndex });
  },

  goToStep: (index) => {
    const { completedSteps } = get();
    const newCompleted = [...new Set([...completedSteps, get().currentStepIndex])];
    set({ 
      currentStepIndex: Math.max(0, Math.min(index, DEMO_STEPS.length - 1)),
      completedSteps: newCompleted,
    });
  },

  resetDemo: () => set({ 
    isDemoMode: false, 
    currentStepIndex: 0, 
    completedSteps: [] 
  }),

  getCurrentStep: () => DEMO_STEPS[get().currentStepIndex],

  getProgress: () => ({
    current: get().currentStepIndex + 1,
    total: DEMO_STEPS.length,
  }),

  isStepCompleted: (index) => get().completedSteps.includes(index),
}));
