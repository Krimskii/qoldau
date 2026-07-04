import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRoleStore } from '@/store/useRoleStore';
import { useChildSettingsStore, applyChildSettings } from '@/store/useChildSettingsStore';
import { ChildSettingsSheet } from '@/components/child/ChildSettingsSheet';
import { ExitConfirmDialog } from './ExitConfirmDialog';
import { Volume2, VolumeX, LogOut } from 'lucide-react';

interface ChildTopBarProps {
  /** Кастомный action справа (например, назад на sub-странице). */
  rightAction?: React.ReactNode;
  className?: string;
}

/**
 * ChildTopBar — минималистичный заголовок child роли (v1.5+).
 *
 * v1.5+ bugfix: убраны аватар, brand, уведомления и настройки.
 * Остались только:
 *   - «Тишина» (глобальная пауза анимаций/звука)
 *   - «Выйти» из режима ребёнка
 * Панель ниже (меньше padding, меньше высота кнопок) — больше
 * вертикального пространства для контента.
 *
 * Применяет font scale + paused к <html>.
 */
export const ChildTopBar: React.FC<ChildTopBarProps> = ({
  rightAction,
  className,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setRole = useRoleStore((s) => s.setRole);
  const settings = useChildSettingsStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const handleExit = () => {
    setRole('overview');
    setExitConfirmOpen(false);
    navigate('/overview');
  };

  // Применить настройки к <html> при изменении.
  useEffect(() => {
    applyChildSettings(settings);
  }, [settings.paused, settings.fontScale, settings.calmVisual, settings.highContrast]);

  return (
    <>
      <header
        className={clsx(
          // v1.5+: ниже и тоньше — pt-1.5 / pb-1 / px-3 (было pt-2 / pb-1.5 / px-5).
          'flex items-center justify-end gap-2 px-3 pt-1.5 pb-1',
          className,
        )}
      >
        {rightAction}

        {/* «Тишина» — глобальная пауза (DESIGN_RULES). */}
        <button
          onClick={() => settings.set({ paused: !settings.paused })}
          className={clsx(
            // w-9 h-9 (вместо 11) — компактнее.
            'w-9 h-9 rounded-[12px] border-0 shadow-card flex items-center justify-center transition-colors',
            settings.paused
              ? 'bg-coral-soft text-coral'
              : 'bg-white text-ink-soft hover:bg-bg',
          )}
          aria-label={settings.paused ? 'Включить движение' : 'Тишина'}
          aria-pressed={settings.paused}
          data-testid="topbar-pause"
        >
          {settings.paused ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Выход из режима Ребёнок — для взрослого. */}
        <button
          onClick={() => setExitConfirmOpen(true)}
          className="w-9 h-9 rounded-[12px] bg-white border-0 shadow-card flex items-center justify-center hover:bg-coral-soft hover:text-coral transition-colors"
          aria-label="Выйти из режима"
          title="Выйти из режима Ребёнок"
          data-testid="topbar-exit"
        >
          <LogOut className="w-4 h-4 text-ink-soft" />
        </button>
      </header>

      <ChildSettingsSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Exit confirm dialog */}
      {exitConfirmOpen && (
        <ExitConfirmDialog
          title={t('exit.childTitle')}
          hint={t('exit.childHint')}
          stayLabel={t('exit.stay')}
          leaveLabel={t('exit.leave')}
          onStay={() => setExitConfirmOpen(false)}
          onLeave={handleExit}
        />
      )}
    </>
  );
};