import React from 'react';
import type { IconProps } from './flat';

/**
 * AssetIcon — рендерит PNG/JPG-ассет как иконку.
 *
 * Совместим с IconProps (size, className, aria-label).
 * Используется для soft 3D ассетов (ChatGPT-generated PNG).
 *
 * NOTE: className с text-* классами не применяется к <img>, но безвреден —
 *       прозрачный PNG рендерится со своими цветами.
 */
interface AssetIconProps extends IconProps {
  src: string;
  alt?: string;
}

export const AssetIcon: React.FC<AssetIconProps> = ({
  src,
  alt,
  size = 32,
  className = '',
  'aria-label': ariaLabel,
}) => (
  <img
    src={src}
    alt={alt ?? ariaLabel ?? ''}
    width={size}
    height={size}
    className={className}
    style={{ width: size, height: size, objectFit: 'contain' }}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  />
);

// =============================================================================
// Soft 3D — Child-friendly 3D PNG assets (Qoldau Soft Care UI)
// =============================================================================
//
// Иконки сгенерированы вне проекта (ChatGPT image generation), лежат в
// public/assets/icons/{actions,events,mascots}/. Постепенно заменяют
// плоские SVG-аналоги из flat.tsx в child-режиме.
//
// Все компоненты имеют тот же API что flat SVG: size, className, aria-label.
// Можно использовать вместо flat иконок через прямой импорт.

// ----- Actions (24) -----

export const WaterSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/water.png" alt="Вода" />
);
export const FoodSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/food.png" alt="Еда" />
);
export const ToiletSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/toilet.png" alt="Туалет" />
);
export const HelpSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/help.png" alt="Помощь" />
);
export const PauseSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/pause.png" alt="Пауза" />
);
export const FavoritesSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/favorite.png" alt="Любимое" />
);
export const MicrophoneSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/microphone.png" alt="Сказать" />
);
export const SleepSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/sleep.png" alt="Сон" />
);
export const CallSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/call.png" alt="Позвонить" />
);
export const StarSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/star.png" alt="Молодец" />
);
export const NowSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/now.png" alt="Сейчас" />
);
export const NextSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/next.png" alt="Потом" />
);
export const StudySoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/study.png" alt="Учёба" />
);
export const NoSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/no.png" alt="Нет" />
);
export const HomeSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/home.png" alt="Домой" />
);
export const YesSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/yes.png" alt="Да" />
);
export const HugSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/hug.png" alt="Обниматься" />
);
export const PlaySoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/play.png" alt="Играть" />
);
export const TripSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/trip.png" alt="Поездка" />
);
export const MusicSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/music.png" alt="Музыка" />
);
export const HeadphonesSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/headphones.png" alt="Наушники" />
);
export const SOSSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/sos.png" alt="SOS" />
);
export const MessageSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/message.png" alt="Сообщение" />
);
export const CalmSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/calm.png" alt="Успокоиться" />
);
export const AnimalsSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/animals.png" alt="Животные" />
);
export const CartoonSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/cartoon.png" alt="Мультик" />
);
export const SpeakSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/speak.png" alt="Сказать" />
);
export const VideoSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/actions/video.png" alt="Спокойное видео" />
);

// ----- Events (4) -----

export const CommunicationEventSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/events/communication-event.png" alt="Общение" />
);
export const VoiceEventSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/events/voice-event.png" alt="Голос" />
);
export const AACEventSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/events/aac-event.png" alt="Альтернативная коммуникация" />
);
export const QuestionEventSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/events/question-event.png" alt="Вопрос" />
);

// ----- Mascots (2) -----

export const CloudMascotSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/mascots/cloud-mascot.png" alt="Облачко" />
);
export const DinoMascotSoftIcon: React.FC<IconProps> = (p) => (
  <AssetIcon {...p} src="/assets/icons/mascots/dino-mascot.png" alt="Динозавр" />
);

// =============================================================================
// Soft-first registry — единая точка входа для IconRenderer
// =============================================================================
//
// Ключи соответствуют builtinKey в IconRenderer / assetRegistry.
// Если soft-версия существует — рендерим её, иначе fallback на flat SVG.

export const SOFT_FIRST_REGISTRY: Record<string, React.FC<IconProps>> = {
  // actions
  Water: WaterSoftIcon,
  Food: FoodSoftIcon,
  Toilet: ToiletSoftIcon,
  Help: HelpSoftIcon,
  Pause: PauseSoftIcon,
  Favorites: FavoritesSoftIcon,
  Microphone: MicrophoneSoftIcon,
  Sleep: SleepSoftIcon,
  Call: CallSoftIcon,
  Star: StarSoftIcon,
  Now: NowSoftIcon,
  Next: NextSoftIcon,
  Study: StudySoftIcon,
  No: NoSoftIcon,
  Home: HomeSoftIcon,
  Yes: YesSoftIcon,
  Hug: HugSoftIcon,
  Play: PlaySoftIcon,
  Trip: TripSoftIcon,
  Music: MusicSoftIcon,
  Headphones: HeadphonesSoftIcon,
  SOS: SOSSoftIcon,
  Message: MessageSoftIcon,
  Calm: CalmSoftIcon,
  Animals: AnimalsSoftIcon,
  Cartoon: CartoonSoftIcon,
  Speak: SpeakSoftIcon,
  Video: VideoSoftIcon,
  // events
  CommunicationEvent: CommunicationEventSoftIcon,
  VoiceEvent: VoiceEventSoftIcon,
  AACEvent: AACEventSoftIcon,
  QuestionEvent: QuestionEventSoftIcon,
  // mascots
  CloudMascot: CloudMascotSoftIcon,
  DinoMascot: DinoMascotSoftIcon,
};