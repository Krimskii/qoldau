import React from 'react';
import type { QoldauAsset, AssetColor } from '@/types/assets';
import type { IconProps } from '@/components/icons';
import { getBuiltinByKey } from '@/data/assetRegistry';
import { CHILD_2D_REGISTRY } from '@/components/icons/child2d';

interface IconRendererProps {
  asset?: QoldauAsset;
  /** Если asset не передан или не рендерится — fallback иконка. */
  fallbackIcon?: React.FC<IconProps>;
  size?: number;
  className?: string;
  /** Если true — asset.dataUrl/imgUrl заполняет контейнер (object-cover). */
  rounded?: boolean;
  /** Отключить CSS-анимации (для списков где много иконок). */
  animated?: boolean;
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
 * Резолвит builtinKey → React-компонент из 2D-набора (child2d.tsx).
 * Это единая точка входа для всех child-иконок в приложении.
 */
function resolveBuiltinComponent(
  key?: string,
): React.FC<{ size?: number; animated?: boolean; className?: string; ariaLabel?: string }> | undefined {
  if (!key) return undefined;
  return CHILD_2D_REGISTRY[key];
}

/**
 * IconRenderer — единый рендер ассета (v0.3.15).
 *
 * Поддерживает:
 * - builtin_svg (через 2D child2d registry).
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
  animated = true,
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

  // 4. Built-in 2D icon
  if (asset?.builtinKey) {
    const Comp = resolveBuiltinComponent(asset.builtinKey);
    if (Comp) {
      return (
        <Comp
          size={size}
          animated={animated}
          className={className}
          ariaLabel={asset.label}
        />
      );
    }

    // Резолвим через registry (для safety, если компонент не зарегистрирован)
    const builtin = getBuiltinByKey(asset.builtinKey);
    if (builtin) {
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
 */
export const BuiltinIcon: React.FC<{
  builtinKey?: string;
  color?: AssetColor;
  size?: number;
  className?: string;
  animated?: boolean;
}> = ({ builtinKey, color, size = 48, className = '', animated = true }) => {
  const Comp = resolveBuiltinComponent(builtinKey);
  if (!Comp) return null;
  return (
    <Comp
      size={size}
      animated={animated}
      className={`${color ? COLOR_TEXT[color] : ''} ${className}`}
      ariaLabel={builtinKey}
    />
  );
};