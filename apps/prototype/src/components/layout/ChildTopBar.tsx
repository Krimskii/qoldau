import React, { useState } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRoleStore } from '@/store/useRoleStore';
import { useChildSettingsStore } from '@/store/useChildSettingsStore';
import { ChildSettingsSheet } from '@/components/child/ChildSettingsSheet';
import { ExitConfirmDialog } from './ExitConfirmDialog';
import { Volume2, VolumeX, LogOut } from 'lucide-react';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

interface ChildTopBarProps {
  /** Кастомный action справа (например, назад на sub-странице). */
  rightAction?: React.ReactNode;
  className?: string;
}

/**
 * ChildTopBar — минималистичный заголовок child роли (v1.5+ D2).
 *
 * v1.5+ bugfix: убраны аватар, brand, уведомления и настройки.
 * Остались только:
 *   - «Тишина» (глобальная пауза анимаций/звука)
 *   - «Выйти» из режима ребёнка
 *
 * v1.5+ D2 персонализация: аватар+имя ребёнка показываются ТОЛЬКО
 * в режиме 'playful'. В 'calm' скрыты полностью (минимизация
 * визуального шума для сенсорно-чувствительных детей). В 'standard'
 * — скрыты по умолчанию (минимализм).
 *
 * applyChildSettings теперь вызывается в AppShell (единая точка).
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
  const child = DEMO_PRIMARY_CHILD;
  const firstLetter = child.name.charAt(0).toUpperCase();

  const handleExit = () => {
    setRole('overview');
    setExitConfirmOpen(false);
    navigate('/overview');
  };

  return (
    <>
      <header
        className={clsx(
          'flex items-center gap-2 px-3 pt-1.5 pb-1',
          className,
        )}
      >
        {/* v1.5+ D2 персонализация: аватар + имя только в playful.
            В calm/standard — скрыты (минимизация шума). */}
        {settings.sensoryMode === 'playful' && (
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex-none flex items-center justify-center text-white font-black text-base shadow-card bg-gradient-to-br from-teal to-teal-dark"
              aria-hidden="true"
            >
              {firstLetter}
            </div>
            <div className="leading-tight truncate">
              <div className="text-[15px] font-black text-ink truncate">{child.name}</div>
            </div>
          </div>
        )}

        {/* Кнопки действий — всегда справа. */}
        <div className="ml-auto flex gap-2">
          {rightAction}

          {/* «Тишина» — глобальная пауза. */}
          <button
            onClick={() => settings.set({ paused: !settings.paused })}
            className={clsx(
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
        </div>
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