/**
 * NotFoundPage (v0.6.3) — 404 экран.
 *
 * Показывается когда route не найден. CTA → landing /overview.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AppIcon } from '@/components/ui/AppIcon';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const safeTopStyle: React.CSSProperties = {
    paddingTop: 'max(env(safe-area-inset-top), 0px)',
  };

  return (
    <div className="min-h-screen bg-bg" style={safeTopStyle}>
      <div className="max-w-[1100px] mx-auto px-6 pt-16 pb-12 flex flex-col items-center">
        <div className="w-full max-w-[420px]">
          <QoldauCard variant="elevated" padding="lg">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-soft to-teal/15 flex items-center justify-center">
                <AppIcon component={Compass} size={40} colorClass="text-teal-dark" />
              </div>
              <h1 className="text-3xl font-black text-ink mt-2">404</h1>
              <p className="text-base font-bold text-ink-2">Страница не найдена</p>
              <p className="text-sm text-muted leading-relaxed">
                Возможно, ссылка устарела или вы перешли по неправильному адресу.
              </p>
              <div className="flex flex-col gap-2 w-full mt-3">
                <button
                  onClick={() => navigate('/overview')}
                  className="w-full px-5 py-3 rounded-2xl bg-gradient-to-br from-teal to-teal-dark text-white font-bold text-sm shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <AppIcon component={Home} size={16} colorClass="text-white" />
                  На главную
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-line text-ink font-bold text-sm hover:bg-bg transition-colors flex items-center justify-center gap-1.5"
                >
                  <AppIcon component={ArrowLeft} size={14} />
                  Назад
                </button>
              </div>
            </div>
          </QoldauCard>
        </div>
      </div>
    </div>
  );
};