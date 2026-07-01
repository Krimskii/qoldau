import type { QoldauEvent } from '@/types/qoldau';
import type { IconProps } from '@/components/icons';
import {
  WaterIcon,
  ToiletIcon,
  HugIcon,
  MoonIcon,
  SpeakIcon,
  HelpIcon,
} from '@/components/icons';

/**
 * AchievementRule — определяет одно достижение и способ его матчинга
 * по Event Timeline.
 *
 * Правила — мягкие. Без streaks, рейтингов, "проигрышей". Только
 * подтверждение факта, что ребёнок использовал навык.
 */

export interface AchievementRule {
  id: string;
  label: string;
  description: string;
  /** Положительное подтверждение, которое видит ребёнок. */
  celebrate: string;
  Icon: React.FC<IconProps>;
  /** Цвет в палитре QoldauIconCard. */
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'teal' | 'coral';
  /** Сопоставляет событие с этим достижением. */
  match: (event: QoldauEvent) => boolean;
}

/** Все правила — единый источник для UI. */
export const ACHIEVEMENT_RULES: AchievementRule[] = [
  {
    id: 'water',
    label: 'Попросил воду',
    description: 'Ребёнок попросил воды',
    celebrate: 'Ты смог попросить воды',
    Icon: WaterIcon,
    color: 'blue',
    match: (e) =>
      e.type === 'aac_card' &&
      (e.payload?.cardLabel === 'Вода' || e.title === 'Вода'),
  },
  {
    id: 'toilet',
    label: 'Попросил туалет',
    description: 'Ребёнок попросил туалет',
    celebrate: 'Ты смог попросить туалет',
    Icon: ToiletIcon,
    color: 'purple',
    match: (e) =>
      e.type === 'aac_card' &&
      (e.payload?.cardLabel === 'Туалет' || e.title === 'Туалет'),
  },
  {
    id: 'phrase',
    label: 'Собрал фразу',
    description: 'Ребёнок собрал фразу из карточек',
    celebrate: 'У тебя получается',
    Icon: HugIcon,
    color: 'coral',
    match: (e) => e.type === 'phrase',
  },
  {
    id: 'voice',
    label: 'Попробовал сказать',
    description: 'Ребёнок попробовал голосовой ввод',
    celebrate: 'Спасибо, что попробовал',
    Icon: SpeakIcon,
    color: 'teal',
    match: (e) => e.type === 'communication' && e.payload?.source === 'voice',
  },
  {
    id: 'pause',
    label: 'Сделал паузу',
    description: 'Ребёнок использовал Calm Mode',
    celebrate: 'Ты молодец — взял паузу',
    Icon: MoonIcon,
    color: 'green',
    match: (e) => e.type === 'calm_mode',
  },
  {
    id: 'help',
    label: 'Позвал взрослого',
    description: 'Ребёнок попросил помощь',
    celebrate: 'Я рядом',
    Icon: HelpIcon,
    color: 'yellow',
    match: (e) => e.type === 'sos',
  },
];

export interface AchievementProgress {
  rule: AchievementRule;
  done: boolean;
  /** Сколько раз сработало. Используется для мягкого прогресса. */
  count: number;
}

/**
 * Вычисляет прогресс по всем правилам для конкретного ребёнка.
 * Не суммирует streak, не наказывает — только факт использования навыка.
 */
export function computeAchievements(
  events: QoldauEvent[],
  childId?: string,
  withinDays = 7,
): AchievementProgress[] {
  const now = Date.now();
  const cutoff = now - withinDays * 24 * 60 * 60 * 1000;

  const relevant = events.filter((e) => {
    if (childId && e.childId !== childId) return false;
    const t = new Date(e.timestamp).getTime();
    return t >= cutoff;
  });

  return ACHIEVEMENT_RULES.map((rule) => {
    const matched = relevant.filter(rule.match);
    return {
      rule,
      done: matched.length > 0,
      count: matched.length,
    };
  });
}