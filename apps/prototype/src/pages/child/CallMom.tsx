import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ChildCall: React.FC = () => {
  const navigate = useNavigate();

  const contacts = [
    { id: 'mom', name: 'Позвать маму', emoji: '👩', bg: 'bg-[#eefbf2]' },
    { id: 'tutor', name: 'Позвать тьютора', emoji: '👨', bg: 'bg-[#edf6ff]' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className={`grid grid-cols-[56px_1fr_48px_48px] gap-2.5 items-center min-h-[76px] rounded-2xl border border-[#dce9f4] ${contact.bg} p-3`}
        >
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-3xl">
            {contact.emoji}
          </div>
          <div className="font-black text-[#173760] leading-tight">
            {contact.name}
          </div>
          <button className="w-12 h-12 rounded-full bg-[#39bb72] flex items-center justify-center text-2xl text-white">
            ☎
          </button>
          <button className="w-12 h-12 rounded-full bg-[#2d9bf0] flex items-center justify-center text-xl text-white">
            ▣
          </button>
        </div>
      ))}

      {/* SOS */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-[#ffe7e5] border border-[#ffc2be] rounded-2xl p-4 text-3xl font-black text-[#cc251d]">
        <span>!</span>
        <span>SOS</span>
        <span>☎</span>
      </div>

      {/* Message */}
      <button className="min-h-[58px] border border-[#dce9f4] rounded-2xl bg-white flex items-center justify-center gap-3 font-black text-[#376488]">
        💬 Написать сообщение
      </button>
    </div>
  );
};
