import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { User, Users, Smartphone, Shield, Trash2, ChevronRight } from 'lucide-react';
import { mockChild } from '@/data/mockChild';

const menuItems = [
  { icon: User, label: 'Профиль ребёнка', sublabel: 'Сигналы, карточки, особенности', color: 'text-teal' },
  { icon: Users, label: 'Пользователи и доступ', sublabel: 'Мама, тьютор, специалист', color: 'text-blue' },
  { icon: Smartphone, label: 'Устройства', sublabel: 'Планшет, телефон, будущий кулон', color: 'text-purple', badge: 'online' },
  { icon: Shield, label: 'Согласия и приватность', sublabel: 'Аудио, хранение, экспорт', color: 'text-green' },
  { icon: Trash2, label: 'Удалить или выгрузить данные', sublabel: 'Контроль семьи над данными', color: 'text-coral' },
];

export const ParentProfile: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Профиль Алихана"
        subtitle="Настройки семьи и доступа"
        rightAction={
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DDF5F0] to-[#E8F3FF] border border-line flex items-center justify-center font-bold text-teal-dark">
            {mockChild.avatar}
          </div>
        }
      />

      <div className="flex flex-col gap-2.5">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center justify-between bg-white border border-line rounded-2xl p-3 cursor-pointer hover:shadow-card-soft transition-shadow"
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <div>
                  <h4 className="text-xs font-bold">{item.label}</h4>
                  <p className="text-xs text-muted">{item.sublabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-soft text-teal-dark">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-[#EAF9F6] to-[#F8FCFB] border border-[#C7ECE5] rounded-2xl p-3 flex gap-2.5 items-start mt-auto">
        <Shield className="w-4 h-4 text-teal mt-0.5" />
        <p className="text-xs text-ink-2 leading-relaxed">
          Данные защищены. Доступ тьютора ограничен только нужной информацией для сопровождения.
        </p>
      </div>
    </div>
  );
};
