import React from 'react';
import type { QoldauAsset, AssetColor } from '@/types/assets';
import {
  WaterIcon,
  FoodIcon,
  ToiletIcon,
  HelpIcon,
  PauseIcon,
  HomeIcon,
  SadIcon,
  SleepIcon,
  SparkleIcon,
  MoonIcon,
  NoIcon,
  YesIcon,
  PlayIcon,
  MusicIcon,
  HeadphonesIcon,
  WalkIcon,
  StudyIcon,
  MomIcon,
  DadIcon,
  TutorIcon,
  HugIcon,
  BreathIcon,
  CartoonIcon,
  AnimalsIcon,
  CarsIcon,
  TabletIcon,
  StarIcon,
  TrophyIcon,
  CheckIcon,
  SOSIcon,
  MessageIcon,
  PhraseIcon,
  SpeakIcon,
  CalendarIcon,
  ChartIcon,
  UserIcon,
  ArrowLeftIcon,
  PlusIcon,
  type IconProps,
} from '@/components/icons';
import { getBuiltinByKey } from '@/data/assetRegistry';
import { SOFT_FIRST_REGISTRY } from '@/components/icons/soft3d';

interface IconRendererProps {
  asset?: QoldauAsset;
  /** Если asset не передан или не рендерится — fallback иконка. */
  fallbackIcon?: React.FC<IconProps>;
  size?: number;
  className?: string;
  /** Если true — asset.dataUrl/imgUrl заполняет контейнер (object-cover). */
  rounded?: boolean;
}

const COLOR_TEXT: Record<AssetColor, string> = {
  blue: 'text-[#1c6cb8]',
  green: 'text-[#158647]',
  teal: 'text-[#00796F]',
  yellow: 'text-[#9a7820]',
  purple: 'text-[#5a3eb4]',
  coral: 'text-[#cc251d]',
};

/**
 * Резолвит builtinKey → React-компонент из icons/index.tsx.
 * Возвращает undefined, если ключ не найден.
 */
function resolveBuiltinComponent(key?: string): React.FC<IconProps> | undefined {
  if (!key) return undefined;
  // Soft-first: если есть soft 3D версия — рендерим её.
  const soft = SOFT_FIRST_REGISTRY[key];
  if (soft) return soft;
  const map: Record<string, React.FC<IconProps>> = {
    Water: WaterIcon,
    Food: FoodIcon,
    Toilet: ToiletIcon,
    Help: HelpIcon,
    Pause: PauseIcon,
    Home: HomeIcon,
    Sad: SadIcon,
    Sleep: SleepIcon,
    Sparkle: SparkleIcon,
    Moon: MoonIcon,
    No: NoIcon,
    Yes: YesIcon,
    Play: PlayIcon,
    Music: MusicIcon,
    Headphones: HeadphonesIcon,
    Walk: WalkIcon,
    Study: StudyIcon,
    Mom: MomIcon,
    Dad: DadIcon,
    Tutor: TutorIcon,
    Hug: HugIcon,
    Breath: BreathIcon,
    Cartoon: CartoonIcon,
    Animals: AnimalsIcon,
    Cars: CarsIcon,
    Tablet: TabletIcon,
    Star: StarIcon,
    Trophy: TrophyIcon,
    Check: CheckIcon,
    SOS: SOSIcon,
    Message: MessageIcon,
    Phrase: PhraseIcon,
    Speak: SpeakIcon,
    Calendar: CalendarIcon,
    Chart: ChartIcon,
    User: UserIcon,
    ArrowLeft: ArrowLeftIcon,
    Plus: PlusIcon,
  };
  return map[key];
}

/**
 * IconRenderer — единый рендер ассета.
 *
 * Поддерживает:
 * - builtin_svg (через builtinKey → компонент).
 * - emoji.
 * - uploaded_image / uploaded_photo / media_cover (через dataUrl).
 * - Fallback (если ничего не подходит).
 */
export const IconRenderer: React.FC<IconRendererProps> = ({
  asset,
  fallbackIcon: Fallback,
  size = 48,
  className = '',
  rounded = true,
}) => {
  // 1. Uploaded image / photo / media cover — через dataUrl
  if (asset?.dataUrl) {
    return (
      <img
        src={asset.dataUrl}
        alt={asset.label}
        width={size}
        height={size}
        className={`object-cover ${rounded ? 'rounded-2xl' : ''} ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // 2. imageUrl (например, для remote app icons)
  if (asset?.imageUrl) {
    return (
      <img
        src={asset.imageUrl}
        alt={asset.label}
        width={size}
        height={size}
        className={`object-cover ${rounded ? 'rounded-2xl' : ''} ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // 3. Emoji
  if (asset?.emoji) {
    return (
      <span
        className={`inline-flex items-center justify-center leading-none ${className}`}
        style={{ fontSize: size * 0.7, width: size, height: size }}
        aria-label={asset.label}
        role="img"
      >
        {asset.emoji}
      </span>
    );
  }

  // 4. Built-in SVG
  if (asset?.builtinKey) {
    const Comp = resolveBuiltinComponent(asset.builtinKey);
    if (Comp) {
      const colorClass = asset.color ? COLOR_TEXT[asset.color] : '';
      return (
        <Comp size={size} className={`${colorClass} ${className}`} aria-label={asset.label} />
      );
    }

    // Резолвим через registry (для safety, если компонент не зарегистрирован)
    const builtin = getBuiltinByKey(asset.builtinKey);
    if (builtin) {
      // Всё равно пытаемся через тот же map
      return (
        <span
          className={`inline-flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
          aria-label={asset.label}
        >
          {builtin.emoji ?? '·'}
        </span>
      );
    }
  }

  // 5. Fallback icon
  if (Fallback) {
    return <Fallback size={size} className={className} aria-label={asset?.label} />;
  }

  // 6. Last resort — neutral placeholder
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl bg-bg border border-line text-muted text-xs ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      ?
    </span>
  );
};

/**
 * Helper для получения только builtin-иконки (без asset обёртки).
 * Удобно когда хочется быстро использовать built-in без assetId.
 */
export const BuiltinIcon: React.FC<{
  builtinKey?: string;
  color?: AssetColor;
  size?: number;
  className?: string;
}> = ({ builtinKey, color, size = 48, className = '' }) => {
  const Comp = resolveBuiltinComponent(builtinKey);
  if (!Comp) return null;
  return (
    <Comp
      size={size}
      className={`${color ? COLOR_TEXT[color] : ''} ${className}`}
    />
  );
};