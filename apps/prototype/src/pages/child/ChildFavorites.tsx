import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

const favorites = [
  { id: 'tractor', label: 'Синий трактор', emoji: '🚜', bg: 'bg-gradient-to-b from-[#bdeaff] via-[#bdeaff] to-[#91da76]' },
  { id: 'masha', label: 'Маша', emoji: '👧', bg: 'bg-gradient-to-br from-[#d8f6b9] to-[#ffbfd7]' },
  { id: 'animals', label: 'Животные', emoji: '🦁', bg: 'bg-gradient-to-br from-[#cdf0ff] to-[#a4dc83]' },
  { id: 'songs', label: 'Песенки', emoji: '⭐', bg: 'bg-gradient-to-br from-[#ffe9a5] to-[#bdc8ff]' },
  { id: 'cars', label: 'Машинки', emoji: '🚗', bg: 'bg-gradient-to-br from-[#d8f0ff] to-[#9accff]' },
  { id: 'calm', label: 'Спокойные видео', emoji: '🌙', bg: 'bg-gradient-to-br from-[#244a85] to-[#0b2650]', dark: true },
];

export const ChildFavorites: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const { addEvent } = useEventStore();

  const handleSelect = (id: string, label: string) => {
    setSelected(id);

    // Create a media_request event so the request lives in Event Timeline
    addEvent({
      childId: DEMO_PRIMARY_CHILD.id,
      type: 'media_request',
      title: `Хочу: ${label}`,
      description: `Ребёнок выбрал любимое видео «${label}»`,
      timestamp: new Date().toISOString(),
      sourceRole: 'child',
      status: 'confirmed',
    });

    setTimeout(() => setSelected(null), 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/child/home')}
          className="text-3xl font-black text-[#203a60]"
          aria-label="Назад"
        >
          ‹
        </button>
        <h2 className="text-lg font-black text-[#143259]">Любимые мультики</h2>
        <div className="w-8" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {favorites.map((fav) => (
          <button
            key={fav.id}
            onClick={() => handleSelect(fav.id, fav.label)}
            className={`min-h-[112px] rounded-2xl border border-[#c9dcec] overflow-hidden relative ${fav.bg} p-3 flex items-end text-white text-base font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] hover:scale-[0.97] transition-transform ${
              selected === fav.id ? 'scale-95' : ''
            }`}
          >
            <span className="relative z-10">{fav.label}</span>
            <span className="absolute text-5xl right-2 top-4">{fav.emoji}</span>
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-black/20" />
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed bottom-24 left-4 right-4 bg-teal text-white text-center py-4 rounded-xl font-bold animate-fade-in shadow-card">
          ✓ Мама увидит запрос
          <div className="text-sm font-normal opacity-90 mt-1">Событие добавлено в Event Timeline</div>
        </div>
      )}
    </div>
  );
};