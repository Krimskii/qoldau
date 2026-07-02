import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { useRoleStore } from '@/store/useRoleStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { Bell2DIcon, Settings2DIcon } from '@/components/icons/child2d';
import { useChildSettingsStore, applyChildSettings } from '@/store/useChildSettingsStore';
import { ChildSettingsSheet } from '@/components/child/ChildSettingsSheet';
import { Volume2, VolumeX, LogOut } from 'lucide-react';

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
  const setRole = useRoleStore((s) => s.setRole);
  const { events } = useEventStore();
  const settings = useChildSettingsStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const child = DEMO_PRIMARY_CHILD;
  const firstLetter = child.name.charAt(0).toUpperCase();

  const handleExit = () => {
    setRole('overview');
    setExitConfirmOpen(false);
    navigate('/overview');
  };

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
        className={clsx('flex items-center gap-3 px-5 pt-3 pb-1.5', className)}
      >
        {/* Avatar */}
        <div
          className="w-[46px] h-[46px] rounded-2xl flex-none flex items-center justify-center text-white font-black text-lg shadow-card bg-gradient-to-br from-teal to-teal-dark"
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

          {/* Выход из режима Ребёнок — для взрослого (v0.5.1) */}
          <button
            onClick={() => setExitConfirmOpen(true)}
            className="w-11 h-11 rounded-[14px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-coral-soft hover:text-coral transition-colors"
            aria-label="Выйти из режима"
            title="Выйти из режима Ребёнок"
            data-testid="topbar-exit"
          >
            <LogOut className="w-5 h-5 text-ink-soft" />
          </button>
        </div>
      </header>

      <ChildSettingsSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Exit confirm dialog */}
      {exitConfirmOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center px-5 bg-ink/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Выйти из режима?"
          onClick={() => setExitConfirmOpen(false)}
        >
          <div
            className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-coral-soft">
              <LogOut className="w-7 h-7 text-coral" />
            </div>
            <h3 className="text-lg font-black text-ink text-center mb-1">
              Выйти из режима Ребёнок?
            </h3>
            <p className="text-sm text-muted text-center mb-5 leading-relaxed">
              Вернёмся на стартовую страницу, чтобы выбрать родителя, тьютора или специалиста.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setExitConfirmOpen(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-line text-ink font-bold text-sm hover:bg-bg transition-colors"
              >
                Остаться
              </button>
              <button
                onClick={handleExit}
                className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition-transform active:scale-[0.97] bg-gradient-to-br from-coral to-[#cc251d] shadow-card hover:shadow-card-hover"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};