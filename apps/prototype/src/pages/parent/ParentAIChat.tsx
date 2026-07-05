import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DEMO_PRIMARY_CHILD, getFamilyChildName, getDemoTimelineSummary } from '@/data/demoDataset';
import { useCurrentChild } from '@/store/useCurrentChild';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const PRESETS = [
  'Что сегодня чаще повторялось?',
  'Какие сигналы появились?',
  'Что помогало?',
  'Что показать специалисту?',
];

const initialMessages: Message[] = [
  {
    role: 'ai',
    text: 'Привет! Это демо-помощник Qoldau: отвечает по заготовленным шаблонам на основе ваших наблюдений. Реальный AI появится в следующей версии. Все ответы — гипотезы, не диагноз.',
  },
];

function generateAnswer(
  question: string,
  summary: ReturnType<typeof getDemoTimelineSummary>,
  hasData: boolean,
): string {
  // Если данных пока нет — честный ответ вместо выдуманных чисел.
  if (!hasData) {
    return 'Похоже, наблюдений пока немного — добавьте голосом или AAC-карточкой, и я смогу ответить точнее. Это наблюдение, не диагноз.';
  }

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
  // E7.3: используем выбранного ребёнка из ChildSelector (консистентно с
  // другими parent-страницами). Если выбран тот же primary — fallback ОК.
  const { child: currentChild } = useCurrentChild();
  const summary = getDemoTimelineSummary(currentChild.id);
  const hasData = summary.total > 0;
  // Реальное имя ребёнка (если семья настроила через FamilySetupCard).
  const childName = getFamilyChildName() ?? currentChild.name ?? DEMO_PRIMARY_CHILD.name;

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
        { role: 'ai', text: generateAnswer(question, summary, hasData) },
      ]);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-180px)]">
      <PageHeader
        title="AI-помощник"
        subtitle={`Спросите по наблюдениям ${childName}`}
        showBack
        rightAction={<DemoBadge label="AI — демо" />}
      />

      <div ref={scrollRef} className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'self-end bg-teal text-white rounded-br-md shadow-card-soft'
                : 'self-start bg-teal-soft border border-teal/20 text-ink rounded-bl-md'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESETS.map((q) => (
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

      <p className="text-[11px] text-muted text-center italic px-2">
        Ответы AI — гипотезы, не медицинский диагноз. Можно обсудить со специалистом.
      </p>

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
          className="w-10 h-10 rounded-xl bg-teal text-white flex items-center justify-center hover:bg-teal-dark transition-colors"
          aria-label="Отправить"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};