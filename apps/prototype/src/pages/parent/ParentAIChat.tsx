import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';

const messages = [
  { role: 'user', text: 'Почему после еды он становится беспокойным?' },
  {
    role: 'ai',
    text: 'Это может быть связано с пищеварением, сенсорной чувствительностью или реакцией на отдельные продукты. Наблюдайте за едой, водой и туалетом — вы уже делаете это отлично.',
  },
  { role: 'user', text: 'Как понять, что его что-то перегружает?' },
  {
    role: 'ai',
    text: 'Обратите внимание на признаки: закрывает уши, отводит взгляд, раздражается, уходит. Пауза, тихое место и вода часто помогают снизить нагрузку.',
  },
];

const suggestions = ['Что помогало?', 'Когда туалет?', 'Новые сигналы'];

export const ParentAIChat: React.FC = () => {
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-200px)]">
      <PageHeader
        title="AI-помощник"
        subtitle="Спросите по данным Алихана"
        showBack
        rightAction={<Sparkles className="w-5 h-5 text-teal" />}
      />

      {/* Chat */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'self-end bg-blue text-white rounded-br-lg'
                : 'self-start bg-[#F1FAF8] border border-[#D2ECE7] text-ink-2 rounded-bl-lg'
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border border-line rounded-xl p-2.5 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спросите что угодно…"
          className="flex-1 bg-transparent text-sm text-muted outline-none"
        />
        <button className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center text-white">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
