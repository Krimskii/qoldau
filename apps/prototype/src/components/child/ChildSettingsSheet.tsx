import React from 'react';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { useChildSettingsStore } from '@/store/useChildSettingsStore';

interface ChildSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testId?: string;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, checked, onChange, testId }) => (
  <button
    onClick={() => onChange(!checked)}
    role="switch"
    aria-checked={checked}
    data-testid={testId}
    className="w-full flex items-start gap-3 py-3 border-b border-line-soft last:border-0 text-left active:scale-[0.99] transition-transform"
  >
    <div
      className={`flex-shrink-0 w-12 h-7 rounded-full p-0.5 transition-colors ${
        checked ? 'bg-teal' : 'bg-line'
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-black text-ink leading-tight">{label}</div>
      <div className="text-xs text-muted leading-snug mt-0.5">{description}</div>
    </div>
  </button>
);

interface ChoiceRowProps<T extends string | number> {
  label: string;
  description: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}

function ChoiceRow<T extends string | number>({ label, description, options, value, onChange }: ChoiceRowProps<T>) {
  return (
    <div className="py-3 border-b border-line-soft last:border-0">
      <div className="text-sm font-black text-ink leading-tight mb-1">{label}</div>
      <div className="text-xs text-muted leading-snug mb-2.5">{description}</div>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
              value === opt.value
                ? 'bg-teal text-white border-teal'
                : 'bg-white text-ink-2 border-line hover:border-teal/40'
            }`}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * ChildSettingsSheet — bottom-sheet настроек ребёнка (v0.3.16).
 *
 * Обязательные настройки (DESIGN_RULES):
 * - «Спокойный визуал» — убирает градиенты, тени, анимации.
 * - «Крупные иконки» — увеличивает иконки.
 * - «Высокий контраст» — bolder text, без muted.
 * - «Тишина» — глобальная пауза анимаций/звука.
 * - «Размер шрифта» — 1× / 1.1× / 1.2×.
 */
export const ChildSettingsSheet: React.FC<ChildSettingsSheetProps> = ({ isOpen, onClose }) => {
  const settings = useChildSettingsStore();
  const { set } = settings;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Настройки"
      style={{ background: 'rgba(7,27,58,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-bg rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle + close */}
        <div className="flex items-center justify-between p-4 border-b border-line-soft">
          <div className="w-10" />
          <div className="w-10 h-1.5 rounded-full bg-line" />
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white border border-line flex items-center justify-center text-ink-soft"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <QoldauCard variant="default" padding="md" className="mx-4 mt-3">
          <h2 className="text-lg font-black text-ink mb-1">Настройки</h2>
          <p className="text-xs text-muted leading-snug">
            Сделай интерфейс удобным для себя. Можно менять в любой момент.
          </p>
        </QoldauCard>

        <QoldauCard variant="default" padding="md" className="mx-4 mt-3">
          <h3 className="text-xs font-black text-muted uppercase tracking-wide mb-2">Визуал</h3>
          <ToggleRow
            label="Спокойный визуал"
            description="Без градиентов, теней и анимаций"
            checked={settings.calmVisual}
            onChange={(v) => set({ calmVisual: v })}
            testId="setting-calm"
          />
          <ToggleRow
            label="Крупные иконки"
            description="Иконки в карточках станут больше"
            checked={settings.largeIcons}
            onChange={(v) => set({ largeIcons: v })}
            testId="setting-large-icons"
          />
          <ToggleRow
            label="Высокий контраст"
            description="Чётче текст и ярлыки"
            checked={settings.highContrast}
            onChange={(v) => set({ highContrast: v })}
            testId="setting-contrast"
          />
        </QoldauCard>

        <QoldauCard variant="default" padding="md" className="mx-4 mt-3">
          <h3 className="text-xs font-black text-muted uppercase tracking-wide mb-2">Звук и движение</h3>
          <ToggleRow
            label="Тишина"
            description="Остановить все анимации и звуки"
            checked={settings.paused}
            onChange={(v) => set({ paused: v })}
            testId="setting-paused"
          />
        </QoldauCard>

        <QoldauCard variant="default" padding="md" className="mx-4 mt-3 mb-6">
          <ChoiceRow
            label="Размер шрифта"
            description="Если сложно читать — увеличь"
            value={settings.fontScale}
            onChange={(v) => set({ fontScale: v })}
            options={[
              { value: 1, label: 'А' },
              { value: 1.1, label: 'А+' },
              { value: 1.2, label: 'А++' },
            ]}
          />
        </QoldauCard>
      </div>
    </div>
  );
};