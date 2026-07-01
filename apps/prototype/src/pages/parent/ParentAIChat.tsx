import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DEMO_PRIMARY_CHILD, getDemoTimelineSummary } from '@/data/demoDataset';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const PRESET_QUESTIONS = [
  'Что сегодня чаще повторялось?',
  'Какие сигналы появились?',
  'Что помогало?',
  'Что показать специалисту?',
];

const initialMessages: Message[] = [
  {
    role: 'ai',
    text: 'Привет! Я AI-помощник Qoldau. Могу ответить на вопросы по наблюдениям Алихана. Все ответы — гипотезы, не диагноз.',
  },
];

function generateAnswer(question: string, summary: ReturnType<typeof getDemoTimelineSummary>): string {
  const lower = question.toLowerCase();
  if (lower.includes('повторялос') || lower.includes('чаще')) {
    return `Похоже, в последние дни чаще всего встречаются события типа «Вода» (${summary.byType.water}) и «AAC-карточки» (${summary.byType.aac_card}). Это наблюдение, не диагноз.`;
  }
  if (lower.includes('сигналы') || lower.includes('появились')) {
    return 'Похоже, ребёнок активнее использует звук «ва» для воды и карточку «Туалет». Это наблюдение, не диагноз. Можно отслеживать в Коммуникационном профиле.';
  }
  if (lower.includes('помог') || lower.includes('помогло')) {
    return 'По данным Event Timeline, похоже, помогали короткие паузы и тихое место. Также тьютор отмечал, что визуальное расписание помогает при переходах. Это наблюдение, не диагноз.';
  }
  if (lower.includes('специалист') || lower.includes('показать')) {
    return 'Можно показать специалисту: события с тегом «шум» (сенсорные реакции), паттерн «туалет» и развитие звука «ва». Эти наблюдения помогут специалисту увидеть динамику.';
  }
  return 'Похоже, я не нашёл точных данных по вашему вопросу в Event Timeline. Можно уточнить вопрос или посмотреть раздел «Аналитика».';
}

export const ParentAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const summary = getDemoTimelineSummary(DEMO_PRIMARY_CHILD.id);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const question = (text ?? input).trim();
    if (!question) return;
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: generateAnswer(question, summary) },
      ]);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-160px)]">
      <PageHeader
        title="AI-помощник"
        subtitle={`Спросите по данным ${DEMO_PRIMARY_CHILD.name}`}
        showBack
        rightAction={<Sparkles className="w-5 h-5 text-teal" />}
      />

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[88%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'self-end bg-teal text-white rounded-br-md'
                : 'self-start bg-teal-soft border border-mint text-ink-2 rounded-bl-md'
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* Preset questions */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESET_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-3 py-2 bg-white border border-line rounded-full text-xs font-bold text-ink-2 hover:border-teal hover:text-teal-dark transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="text-[11px] text-muted text-center italic px-4">
        Ответы AI — гипотезы, не медицинский диагноз. Можно обсудить со специалистом.
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border border-line rounded-2xl p-2 bg-white shadow-card-soft">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Спросите что угодно…"
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted px-2"
        />
        <button
          onClick={() => handleSend()}
          className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center text-white hover:bg-teal-dark transition-colors"
          aria-label="Отправить"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};