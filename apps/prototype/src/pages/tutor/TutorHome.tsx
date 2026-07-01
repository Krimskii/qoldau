import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Bell, CircleHelp } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { mockChild } from '@/data/mockChild';
import { mockTutorHints } from '@/data/mockTutor';

export const TutorHome: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    { id: 'reject', label: 'Отказ от задания', color: 'bg-[#ffecec]' },
    { id: 'pause', label: 'Пауза', color: 'bg-[#fff2d7]' },
    { id: 'toilet', label: 'Туалет', color: 'bg-[#e5f4ff]' },
    { id: 'food', label: 'Еда', color: 'bg-[#e8faef]' },
    { id: 'nervous', label: 'Нервничает', color: 'bg-[#f2ecff]' },
    { id: 'calm', label: 'Успокоился', color: 'bg-[#eaf9ef]' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`${mockChild.name}, ${mockChild.age} лет`}
        subtitle="Сегодня, 1 июля"
        rightAction={
          <div className="flex items-center gap-2">
            <button className="relative w-10 h-10 rounded-xl bg-[#F7FBFA] border border-line flex items-center justify-center text-ink">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
            </button>
          </div>
        }
      />

      {/* Status */}
      <div className="bg-gradient-to-br from-[#E9F8F0] to-[#F6FFFC] border border-[#BDE6D0] rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green shadow-[0_0_0_5px_rgba(46,159,110,0.12)]" />
          <strong className="text-sm">Сейчас: спокойный</strong>
        </div>
      </div>

      {/* Voice CTA */}
      <button
        onClick={() => navigate('/tutor/voice')}
        className="w-full border-0 rounded-2xl p-4 bg-gradient-to-br from-teal to-[#037A76] text-white font-bold text-base flex items-center justify-center gap-3"
      >
        <Mic className="w-5 h-5" />
        Наговорить событие
      </button>

      {/* Hints */}
      <div className="bg-[#F5F0FF] border border-[#DDD1FF] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3 font-bold text-sm text-purple">
          <CircleHelp className="w-4 h-4" />
          Подсказки
        </div>
        {mockTutorHints.map((hint, i) => (
          <div key={i} className="text-sm text-ink-2 leading-relaxed mb-2 last:mb-0">
            • {hint}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-bold text-ink-2 mb-2">Быстрые действия</p>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className={`min-h-[70px] rounded-xl ${action.color} flex items-center justify-center text-xs font-bold text-ink text-center p-2`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Child Profile Link */}
      <button
        onClick={() => navigate('/tutor/child-profile')}
        className="w-full bg-white border border-line rounded-2xl p-4 flex items-center justify-between"
      >
        <span className="text-sm font-bold">Профиль ребёнка</span>
        <span className="text-muted">→</span>
      </button>
    </div>
  );
};
