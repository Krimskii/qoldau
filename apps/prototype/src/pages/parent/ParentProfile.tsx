import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Smartphone, Shield, ChevronRight } from 'lucide-react';
import { DEMO_PRIMARY_CHILD, DEMO_PARENTS, DEMO_TUTORS, DEMO_SPECIALISTS } from '@/data/demoDataset';

export const ParentProfile: React.FC = () => {
  const navigate = useNavigate();
  const child = DEMO_PRIMARY_CHILD;
  const mother = DEMO_PARENTS[0];
  const tutor = DEMO_TUTORS[0];
  const specialist = DEMO_SPECIALISTS[0];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={`Профиль ${child.name}`} subtitle="Семья и сопровождение" />

      {/* Child summary */}
      <Card variant="tinted-teal">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-card-soft">
            👦
          </div>
          <div>
            <h3 className="font-black text-lg text-ink">{child.name}</h3>
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
      </Card>

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

      <Card variant="tinted-yellow">
        <p className="text-xs text-ink-2 leading-relaxed">
          <strong>Важно.</strong> Это профиль наблюдений, не диагноз. Все AI-выводы формулируются осторожно. Можно обсудить со специалистом.
        </p>
      </Card>
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