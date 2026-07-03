/**
 * Категории для /child/cards (v0.3.25).
 *
 * Каждая категория — набор «интересных» карточек:
 * - «Потребности» → открывает NeedCard (вода/еда/туалет).
 * - «Мир вокруг» → открывает sub-page с grid items (мультики/животные/машинки/музыка).
 *
 * Tap на item внутри категории создаёт `phrase` event с названием,
 * показывает success-toast и возвращает на главную.
 */
import {
  Water2DIcon,
  Food2DIcon,
  Toilet2DIcon,
  Hurt2DIcon,
  Tired2DIcon,
  Help2DIcon,
  Pause2DIcon,
  Play2DIcon,
  Home2DIcon,
  Yes2DIcon,
  No2DIcon,
  Cartoon2DIcon,
  Animals2DIcon,
  Car2DIcon,
  Music2DIcon,
  Sparkle2DIcon,
  Calm2DIcon,
  Mom2DIcon,
  Puzzle2DIcon,
} from '@/components/icons/child2d';

export type IconComponent = React.FC<{ size?: number; animated?: boolean; className?: string }>;

export interface CategoryItem {
  /** Уникальный id внутри категории */
  id: string;
  /** Название для отображения + для event payload */
  label: string;
  /** Иконка из child2d.tsx */
  Icon: IconComponent;
  /** Цвет фона плитки иконки */
  iconBg: string;
  /** Цвет лейбла */
  iconColor: string;
  /** Широкая карточка на col-span-2 (для крупных элементов) */
  wide?: boolean;
}

export interface Category {
  id: 'cartoon' | 'animals' | 'cars' | 'music' | 'sounds';
  title: string;
  /** Лозунг / описание */
  description: string;
  /** Большая иконка категории */
  Icon: IconComponent;
  /** Цвет фона для обложки (для featured карточки) */
  coverFrom: string;
  coverTo: string;
  /** Цвет лейбла */
  accent: string;
  /** Список items внутри категории */
  items: CategoryItem[];
}

/* ───────── Потребности (8 «быстрых действий» для Wave 0) ─────────
 * Базовые сигналы ребёнка:
 *  - пить / есть / туалет — физические потребности
 *  - больно / устал — самочувствие
 *  - помоги / пауза / играть / домой — коммуникация и сенсорика
 * Цветовая кодировка помогает ребёнку ориентироваться без чтения.
 * ВАЖНО: эти карточки — для коммуникации, не для «исправления поведения».
 * Они озвучивают потребности ребёнка, который не может их выразить словами.
 * ────────────────────────────────────────────────────────────────────── */

export interface QuickNeed {
  id:
    | 'water' | 'food' | 'toilet'
    | 'hurt' | 'tired'
    | 'help' | 'pause' | 'play' | 'home'
    | 'yes' | 'no';
  title: string;
  Icon: IconComponent;
  bg: string;
  text: string;
  go: string;
}

export const QUICK_NEEDS: QuickNeed[] = [
  // Базовые потребности
  { id: 'water',  title: 'Хочу пить',  Icon: Water2DIcon,  bg: 'bg-[#EAF5FF]', text: 'text-[#1c6cb8]', go: '/child/water' },
  { id: 'food',   title: 'Хочу есть',  Icon: Food2DIcon,   bg: 'bg-[#EAF6EF]', text: 'text-[#276b48]', go: '/child/food' },
  { id: 'toilet', title: 'Туалет',     Icon: Toilet2DIcon, bg: 'bg-[#EAF5FF]', text: 'text-[#1c6cb8]', go: '/child/toilet' },
  // Самочувствие
  { id: 'hurt',   title: 'Больно',     Icon: Hurt2DIcon,   bg: 'bg-[#FBEDED]', text: 'text-[#a24545]', go: '/child/phrase-builder' },
  { id: 'tired',  title: 'Устал',      Icon: Tired2DIcon,  bg: 'bg-[#F1EDFF]', text: 'text-[#5a3eb4]', go: '/child/calm' },
  // Коммуникация и сенсорика
  { id: 'help',   title: 'Помоги',     Icon: Help2DIcon,   bg: 'bg-[#EAF6EF]', text: 'text-[#276b48]', go: '/child/call' },
  { id: 'pause',  title: 'Пауза',      Icon: Pause2DIcon,  bg: 'bg-[#F1EDFF]', text: 'text-[#5a3eb4]', go: '/child/calm' },
  { id: 'play',   title: 'Играть',     Icon: Play2DIcon,   bg: 'bg-[#FFF6DF]', text: 'text-[#9a7820]', go: '/child/cards' },
  { id: 'home',   title: 'Домой',      Icon: Home2DIcon,   bg: 'bg-[#E9F7F5]', text: 'text-[#0d5c5c]', go: '/child/phrase-builder' },
  // Ответы
  { id: 'yes',    title: 'Да',         Icon: Yes2DIcon,    bg: 'bg-[#EAF6EF]', text: 'text-[#276b48]', go: '/child/phrase-builder' },
  { id: 'no',     title: 'Нет',        Icon: No2DIcon,     bg: 'bg-[#FBEDED]', text: 'text-[#a24545]', go: '/child/phrase-builder' },
];

/* ───────── Категории «Мир вокруг» ───────── */

const ITEM_BG = {
  pink:    'bg-[#FBEDED]',
  blue:    'bg-[#EAF5FF]',
  green:   'bg-[#EAF6EF]',
  yellow:  'bg-[#FFF6DF]',
  purple:  'bg-[#F1EDFF]',
  mint:    'bg-[#E9F7F5]',
};

const ITEM_COLOR = {
  pink:    'text-[#a24545]',
  blue:    'text-[#1c6cb8]',
  green:   'text-[#276b48]',
  yellow:  'text-[#9a7820]',
  purple:  'text-[#5a3eb4]',
  mint:    'text-[#0d5c5c]',
};

export const CATEGORIES: Category[] = [
  {
    id: 'cartoon',
    title: 'Мультик',
    description: 'Любимые истории',
    Icon: Cartoon2DIcon,
    coverFrom: '#fbcfe8',
    coverTo: '#f9a8d4',
    accent: '#a24545',
    items: [
      { id: 'masha',  label: 'Маша и Медведь', Icon: Cartoon2DIcon, iconBg: ITEM_BG.pink,  iconColor: ITEM_COLOR.pink,  wide: true },
      { id: 'fixiki', label: 'Фиксики',         Icon: Sparkle2DIcon, iconBg: ITEM_BG.yellow, iconColor: ITEM_COLOR.yellow },
      { id: 'smeshariki', label: 'Смешарики',   Icon: Cartoon2DIcon, iconBg: ITEM_BG.blue,  iconColor: ITEM_COLOR.blue },
      { id: 'masha2', label: 'Маша: новые',   Icon: Cartoon2DIcon, iconBg: ITEM_BG.pink,  iconColor: ITEM_COLOR.pink },
    ],
  },
  {
    id: 'animals',
    title: 'Животные',
    description: 'Кто живёт рядом',
    Icon: Animals2DIcon,
    coverFrom: '#bbf7d0',
    coverTo: '#86efac',
    accent: '#276b48',
    items: [
      { id: 'cat',     label: 'Кот',     Icon: Animals2DIcon, iconBg: ITEM_BG.green,  iconColor: ITEM_COLOR.green },
      { id: 'dog',     label: 'Собака',  Icon: Animals2DIcon, iconBg: ITEM_BG.green,  iconColor: ITEM_COLOR.green },
      { id: 'lion',    label: 'Лев',     Icon: Animals2DIcon, iconBg: ITEM_BG.yellow, iconColor: ITEM_COLOR.yellow },
      { id: 'elephant',label: 'Слон',    Icon: Animals2DIcon, iconBg: ITEM_BG.blue,   iconColor: ITEM_COLOR.blue },
      { id: 'bear',    label: 'Мишка',   Icon: Animals2DIcon, iconBg: ITEM_BG.pink,   iconColor: ITEM_COLOR.pink },
      { id: 'rabbit',  label: 'Зайка',   Icon: Animals2DIcon, iconBg: ITEM_BG.purple, iconColor: ITEM_COLOR.purple },
    ],
  },
  {
    id: 'cars',
    title: 'Машинки',
    description: 'Что едет и гудит',
    Icon: Car2DIcon,
    coverFrom: '#fde68a',
    coverTo: '#fcd34d',
    accent: '#9a7820',
    items: [
      { id: 'car',     label: 'Легковая',  Icon: Car2DIcon, iconBg: ITEM_BG.blue,   iconColor: ITEM_COLOR.blue },
      { id: 'truck',   label: 'Грузовик',  Icon: Car2DIcon, iconBg: ITEM_BG.yellow, iconColor: ITEM_COLOR.yellow },
      { id: 'bus',     label: 'Автобус',   Icon: Car2DIcon, iconBg: ITEM_BG.green,  iconColor: ITEM_COLOR.green },
      { id: 'tractor', label: 'Трактор',   Icon: Car2DIcon, iconBg: ITEM_BG.mint,   iconColor: ITEM_COLOR.mint },
    ],
  },
  {
    id: 'music',
    title: 'Музыка',
    description: 'Песни и звуки',
    Icon: Music2DIcon,
    coverFrom: '#ddd6fe',
    coverTo: '#c4b5fd',
    accent: '#5a3eb4',
    items: [
      { id: 'lullaby',  label: 'Колыбельная', Icon: Music2DIcon, iconBg: ITEM_BG.purple, iconColor: ITEM_COLOR.purple, wide: true },
      { id: 'happy',    label: 'Весёлая',     Icon: Music2DIcon, iconBg: ITEM_BG.yellow, iconColor: ITEM_COLOR.yellow },
      { id: 'calm',     label: 'Спокойная',   Icon: Calm2DIcon,    iconBg: ITEM_BG.blue,   iconColor: ITEM_COLOR.blue },
      { id: 'birds',    label: 'Птицы',       Icon: Music2DIcon, iconBg: ITEM_BG.green,  iconColor: ITEM_COLOR.green },
      { id: 'rain',     label: 'Дождь',       Icon: Music2DIcon, iconBg: ITEM_BG.blue,   iconColor: ITEM_COLOR.blue },
    ],
  },
  {
    id: 'sounds',
    title: 'Звуки вокруг',
    description: 'Что слышно рядом',
    Icon: Music2DIcon,
    coverFrom: '#fef3c7',
    coverTo: '#fde68a',
    accent: '#9a7820',
    items: [
      { id: 'mama-call', label: 'Мама зовёт',  Icon: Mom2DIcon,    iconBg: ITEM_BG.pink,   iconColor: ITEM_COLOR.pink },
      { id: 'door',      label: 'Дверь',       Icon: Home2DIcon,   iconBg: ITEM_BG.mint,   iconColor: ITEM_COLOR.mint },
      { id: 'phone',     label: 'Телефон',     Icon: Music2DIcon,  iconBg: ITEM_BG.blue,   iconColor: ITEM_COLOR.blue },
      { id: 'toy',       label: 'Игрушка',     Icon: Puzzle2DIcon, iconBg: ITEM_BG.yellow, iconColor: ITEM_COLOR.yellow },
    ],
  },
];

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);