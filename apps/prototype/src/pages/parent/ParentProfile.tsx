import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import {
  Smartphone,
  Shield,
  ChevronRight,
  Pencil,
  Check,
  FileText,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import {
  DEMO_PARENTS,
  DEMO_TUTORS,
  DEMO_SPECIALISTS,
  setFamilyChildName,
} from '@/data/demoDataset';
import { useCurrentChild } from '@/store/useCurrentChild';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useConsentStore } from '@/store/useConsentStore';
import { useToastStore } from '@/store/useToastStore';
import { clearAllChildData, hasChildData } from '@/lib/privacy/dataControl';
import { MiniPolicy } from '@/components/privacy/MiniPolicy';

export const ParentProfile: React.FC = () => {
  const navigate = useNavigate();
  const { child } = useCurrentChild();
  const mother = DEMO_PARENTS[0];
  const tutor = DEMO_TUTORS[0];
  const specialist = DEMO_SPECIALISTS[0];

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(child.name);

  // v1.0 — privacy controls
  const consent = useConsentStore((s) => s.consent);
  const showToast = useToastStore((s) => s.showToast);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    setFamilyChildName(nameInput);
    window.location.reload();
  };

  // v1.0 — обработчик «Очистить данные» с подтверждением.
  const handleClearData = () => {
    const keys = clearAllChildData();
    setConfirmClearOpen(false);
    showToast(`Данные очищены (${keys.length} разделов).`, 'success');
    // Полная перезагрузка чтобы все stores переинициализировались
    // (consent сброшен → onboarding может открыться снова).
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={`Профиль ${child.name}`} subtitle="Семья и сопровождение" />
      <ChildSelector />

      {/* Child summary */}
      <QoldauCard variant="tinted-teal">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-card-soft">
            👦
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                  className="flex-1 min-w-0 h-9 px-3 rounded-xl border border-line focus:border-teal/60 focus:outline-none text-sm font-black text-ink"
                />
                <button
                  onClick={handleSaveName}
                  disabled={!nameInput.trim()}
                  aria-label="Сохранить имя"
                  className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-lg text-ink">{child.name}</h3>
                <button
                  onClick={() => {
                    setNameInput(child.name);
                    setEditingName(true);
                  }}
                  aria-label="Изменить имя ребёнка"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-white hover:text-teal-dark transition-colors flex-shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted">
              {child.age} лет · Сейчас: {child.currentState}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {child.mainSignals.slice(0, 4).map((s) => (
            <span
              key={s.id}
              className="px-2.5 py-1 bg-white border border-line rounded-full text-xs font-bold text-ink-2"
            >
              {s.signal}
            </span>
          ))}
        </div>
      </QoldauCard>

      <p className="text-xs font-black text-muted uppercase tracking-wide px-1">Сопровождение</p>

      <button
        onClick={() => navigate('/parent/notifications')}
        className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-soft transition-shadow"
      >
        <div className="w-11 h-11 rounded-2xl bg-teal-soft flex items-center justify-center text-2xl">
          👩‍👧
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-sm font-black text-ink">{mother.name}</h4>
          <p className="text-xs text-muted">Мама · {mother.lastAction}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted" />
      </button>

      <button
        onClick={() => navigate('/tutor/report')}
        className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-soft transition-shadow"
      >
        <div className="w-11 h-11 rounded-2xl bg-purple-soft flex items-center justify-center text-2xl">
          👨‍🏫
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-sm font-black text-ink">Тьютор — {tutor.name}</h4>
          <p className="text-xs text-muted">{tutor.scheduleToday}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted" />
      </button>

      <button
        onClick={() => navigate('/specialist/communication-profile')}
        className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-soft transition-shadow"
      >
        <div className="w-11 h-11 rounded-2xl bg-blue-soft flex items-center justify-center text-2xl">
          🧑‍⚕️
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-sm font-black text-ink">{specialist.name}</h4>
          <p className="text-xs text-muted">{specialist.specialty}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted" />
      </button>

      <p className="text-xs font-black text-muted uppercase tracking-wide px-1 mt-2">Настройки</p>

      <div className="flex flex-col gap-2.5">
        <ProfileItem
          icon={Smartphone}
          label="Устройства"
          sublabel="Планшет · Будущий кулон"
        />
        <ProfileItem
          icon={Shield}
          label="Согласия и приватность"
          sublabel="Аудио, хранение, экспорт"
        />
      </div>

      {/* v1.0 — блок приватности: политика, статус согласия, очистка данных. */}
      <p className="text-xs font-black text-muted uppercase tracking-wide px-1 mt-2">Согласия и приватность</p>

      <div className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            consent ? 'bg-teal-soft' : 'bg-yellow-soft'
          }`}
        >
          <AppIcon
            component={ShieldCheck}
            size={22}
            colorClass={consent ? 'text-teal-dark' : 'text-yellow-dark'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-ink">
            {consent ? 'Согласие дано' : 'Согласие не дано'}
          </h4>
          <p className="text-xs text-muted">
            {consent
              ? `Запись разрешена · ${new Date(consent.acceptedAt).toLocaleDateString('ru-RU')}`
              : 'Запись голоса недоступна без согласия родителя'}
          </p>
        </div>
      </div>

      <button
        onClick={() => setPolicyOpen(true)}
        className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-soft active:scale-[0.99] transition-all text-left w-full"
      >
        <div className="w-11 h-11 rounded-2xl bg-blue-soft flex items-center justify-center text-blue-dark shrink-0">
          <AppIcon component={FileText} size={20} colorClass="text-blue-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-ink">Полная политика</h4>
          <p className="text-xs text-muted">Что мы делаем и чего не делаем с данными</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted shrink-0" />
      </button>

      {hasChildData() && (
        <button
          onClick={() => setConfirmClearOpen(true)}
          className="bg-white border border-coral/40 rounded-2xl p-4 flex items-center gap-3 hover:bg-coral-soft/30 active:scale-[0.99] transition-all text-left w-full"
        >
          <div className="w-11 h-11 rounded-2xl bg-coral-soft flex items-center justify-center text-coral-dark shrink-0">
            <AppIcon component={Trash2} size={20} colorClass="text-coral-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-coral-dark">Очистить данные</h4>
            <p className="text-xs text-muted">Удалит события, имя ребёнка и согласие</p>
          </div>
          <ChevronRight className="w-4 h-4 text-coral-dark shrink-0" />
        </button>
      )}

      <QoldauCard variant="tinted-yellow">
        <p className="text-xs text-ink-2 leading-relaxed">
          <strong>Важно.</strong> Это профиль наблюдений, не диагноз. Все AI-выводы формулируются осторожно. Можно обсудить со специалистом.
        </p>
      </QoldauCard>

      <MiniPolicy open={policyOpen} onClose={() => setPolicyOpen(false)} />

      {/* Confirm modal для «Очистить данные». */}
      {confirmClearOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-clear-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          style={{ background: 'rgba(23,48,57,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={() => setConfirmClearOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-card-hover w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-line">
              <h2
                id="confirm-clear-title"
                className="text-base font-black text-ink leading-tight"
              >
                Очистить данные?
              </h2>
              <p className="text-[11px] text-muted mt-0.5">Это действие необратимо</p>
            </div>
            <div className="px-5 py-4 text-sm text-ink-2 leading-relaxed">
              <p>
                Будут удалены с этого устройства:
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-ink-2">
                <li>все события ребёнка</li>
                <li>имя ребёнка</li>
                <li>согласие на запись (потребуется дать заново)</li>
              </ul>
              <p className="mt-3 text-xs text-muted">
                Настройки приложения (тема, размер шрифта) сохранятся.
              </p>
            </div>
            <div className="px-5 py-3 border-t border-line bg-bg/30 grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="min-h-12 px-4 rounded-2xl border border-line text-ink-2 hover:bg-bg transition-colors text-sm font-bold"
              >
                Отмена
              </button>
              <button
                onClick={handleClearData}
                className="min-h-12 px-4 rounded-2xl bg-coral text-white hover:bg-coral-dark transition-colors text-sm font-bold"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProfileItemProps {
  icon: React.ElementType;
  label: string;
  sublabel: string;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ icon: Icon, label, sublabel }) => (
  <div className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-soft transition-shadow cursor-pointer">
    <Icon className="w-5 h-5 text-muted flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-ink">{label}</h4>
      <p className="text-xs text-muted">{sublabel}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-muted" />
  </div>
);