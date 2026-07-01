import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { Bell2DIcon, Settings2DIcon } from '@/components/icons/child2d';
import { useChildSettingsStore, applyChildSettings } from '@/store/useChildSettingsStore';
import { ChildSettingsSheet } from '@/components/child/ChildSettingsSheet';
import { Volume2, VolumeX } from 'lucide-react';

interface ChildTopBarProps {
  /** Кастомный action справа (например, назад на sub-странице). */
  rightAction?: React.ReactNode;
  className?: string;
}

/**
 * ChildTopBar — заголовок child роли (v0.3.16).
 *
 * Содержит:
 * - Avatar с первой буквой имени ребёнка.
 * - Brand.
 * - Кнопка "Тишина" — глобальная пауза анимаций/звука (DESIGN_RULES).
 * - Кнопка уведомлений (bell).
 * - Кнопка настроек (gear) → ChildSettingsSheet.
 *
 * Применяет font scale + paused к <html>.
 */
export const ChildTopBar: React.FC<ChildTopBarProps> = ({
  rightAction,
  className,
}) => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const settings = useChildSettingsStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const child = DEMO_PRIMARY_CHILD;
  const firstLetter = child.name.charAt(0).toUpperCase();

  const notifCount = events.filter(
    (e) =>
      e.childId === child.id &&
      (e.sourceRole === 'child' || e.sourceRole === 'tutor' || e.sourceRole === 'specialist'),
  ).length;

  // Применить настройки к <html> при изменении
  useEffect(() => {
    applyChildSettings(settings);
  }, [settings.paused, settings.fontScale, settings.calmVisual, settings.highContrast]);

  return (
    <>
      <header
        className={clsx('flex items-center gap-3 px-5 pt-4 pb-1.5', className)}
      >
        {/* Avatar */}
        <div
          className="w-[46px] h-[46px] rounded-2xl flex-none flex items-center justify-center text-white font-black text-lg shadow-card"
          style={{
            background: 'linear-gradient(140deg, #7fd1c9 0%, #1ba39a 100%)',
          }}
          aria-hidden="true"
        >
          {firstLetter}
        </div>

        {/* Brand */}
        <div className="leading-tight">
          <div className="text-xs text-ink-soft font-semibold">Qoldau AI</div>
          <div className="text-[19px] font-black text-ink">{child.name}</div>
        </div>

        {/* Top actions */}
        <div className="ml-auto flex gap-2.5">
          {rightAction}

          {/* "Тишина" — глобальная пауза (DESIGN_RULES) */}
          <button
            onClick={() => settings.set({ paused: !settings.paused })}
            className={clsx(
              'w-11 h-11 rounded-[14px] border-0 shadow-card flex items-center justify-center transition-colors',
              settings.paused
                ? 'bg-coral-soft text-coral'
                : 'bg-white text-ink-soft hover:bg-bg',
            )}
            aria-label={settings.paused ? 'Включить движение' : 'Тишина'}
            aria-pressed={settings.paused}
            data-testid="topbar-pause"
          >
            {settings.paused ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Уведомления */}
          <button
            onClick={() => navigate('/parent/notifications')}
            className="relative w-11 h-11 rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
            aria-label="Уведомления"
          >
            <Bell2DIcon size={22} />
            {notifCount > 0 && (
              <span
                className="absolute w-4 h-4 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center"
                style={{ transform: 'translate(11px, -11px)' }}
                aria-label={`${Math.min(notifCount, 9)} новых`}
              >
                {Math.min(notifCount, 9)}
              </span>
            )}
          </button>

          {/* Настройки → ChildSettingsSheet */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-11 h-11 rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-bg transition-colors"
            aria-label="Настройки"
            data-testid="topbar-settings"
          >
            <Settings2DIcon size={22} />
          </button>
        </div>
      </header>

      <ChildSettingsSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};