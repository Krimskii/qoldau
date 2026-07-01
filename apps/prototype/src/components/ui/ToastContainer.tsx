import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, ToastType } from '@/store/useToastStore';

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-green text-white',
  error: 'bg-red text-white',
  warning: 'bg-yellow text-ink',
  info: 'bg-teal text-white',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${TOAST_STYLES[toast.type]} rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg animate-slide-down`}
        >
          {TOAST_ICONS[toast.type]}
          <span className="flex-1 text-sm font-bold">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
