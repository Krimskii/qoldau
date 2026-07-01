import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { User, Users, Smartphone, Shield, Bell, ChevronRight } from 'lucide-react';
import { DEMO_PRIMARY_CHILD, DEMO_PARENTS, DEMO_TUTORS, DEMO_SPECIALISTS } from '@/data/demoDataset';

export const ParentProfile: React.FC = () => {
  const navigate = useNavigate();
  const child = DEMO_PRIMARY_CHILD;
  const mother = DEMO_PARENTS[0];
  const tutor = DEMO_TUTORS[0];
  const specialist = DEMO_SPECIALISTS[0];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`Профиль ${child.name}`}
        subtitle="Семья, сопровождение, настройки"
        rightAction={
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DDF5F0] to-[#E8F3FF] border border-line flex items-center justify-center font-bold text-teal-dark">
            {child.avatar}
          </div>
        }
      />

      {/* Child summary */}
      <Card variant="default" className="bg-gradient-to-br from-teal-soft to-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white border border-line flex items-center justify-center text-2xl font-black text-teal">
            {child.avatar}
          </div>
          <div>
            <h3 className="font-bold text-lg">{child.name}</h3>
            <p className="text-xs text-muted">
              {child.age} лет · Сейчас: {child.currentState}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {child.mainSignals.slice(0, 4).map((s) => (
            <span
              key={s.id}
              className="px-2 py-1 bg-white border border-line rounded-full text-xs font-bold text-ink-2"
            >
              {s.signal}
            </span>
          ))}
        </div>
      </Card>

      {/* Сопровождение */}
      <p className="text-xs font-bold text-muted uppercase tracking-wide px-2">Сопровождение</p>

      <button
        onClick={() => showProfileInfo(`${mother.name} — основной контакт`)}
        className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-soft transition-shadow"
      >
        <div className="w-10 h-10 rounded-xl bg-teal-soft flex items-center justify-center text-teal">
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-sm font-bold">{mother.name}</h4>
          <p className="text-xs text-muted">Мама · {mother.lastAction}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted" />
      </button>

      <button
        onClick={() => navigate('/tutor/report')}
        className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-soft transition-shadow"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-soft flex items-center justify-center text-purple">
          <Users className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-sm font-bold">Тьютор — {tutor.name}</h4>
          <p className="text-xs text-muted">{tutor.scheduleToday}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted" />
      </button>

      <button
        onClick={() => navigate('/specialist/communication-profile')}
        className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-soft transition-shadow"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-soft flex items-center justify-center text-blue">
          <Users className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-sm font-bold">{specialist.name}</h4>
          <p className="text-xs text-muted">{specialist.specialty}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted" />
      </button>

      {/* Настройки */}
      <p className="text-xs font-bold text-muted uppercase tracking-wide px-2 mt-2">Настройки</p>

      <div className="flex flex-col gap-2.5">
        <ProfileItem
          icon={Bell}
          label="Уведомления"
          sublabel="AAC-карточки, SOS, отчёты тьютора"
        />
        <ProfileItem
          icon={Smartphone}
          label="Устройства"
          sublabel="Планшет · Будущий кулон"
          badge="online"
        />
        <ProfileItem
          icon={Shield}
          label="Согласия и приватность"
          sublabel="Аудио, хранение, экспорт"
        />
      </div>

      <Card variant="default" className="bg-yellow-soft border-yellow/20">
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
  badge?: string;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ icon: Icon, label, sublabel, badge }) => (
  <div className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3 hover:shadow-card-soft transition-shadow cursor-pointer">
    <Icon className="w-5 h-5 text-muted" />
    <div className="flex-1">
      <h4 className="text-sm font-bold">{label}</h4>
      <p className="text-xs text-muted">{sublabel}</p>
    </div>
    {badge && (
      <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-soft text-teal-dark">
        {badge}
      </span>
    )}
    <ChevronRight className="w-4 h-4 text-muted" />
  </div>
);

// dummy handler so TS doesn't complain about unused
function showProfileInfo(_text: string) {
  // in real app — show modal
}