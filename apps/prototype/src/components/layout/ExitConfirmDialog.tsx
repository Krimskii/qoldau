import React from 'react';
import { LogOut } from 'lucide-react';

interface ExitConfirmDialogProps {
  title: string;
  hint: string;
  stayLabel: string;
  leaveLabel: string;
  onStay: () => void;
  onLeave: () => void;
}

/** Shared confirm-exit modal — used by AppShell (parent/tutor) and ChildTopBar (child). */
export const ExitConfirmDialog: React.FC<ExitConfirmDialogProps> = ({
  title,
  hint,
  stayLabel,
  leaveLabel,
  onStay,
  onLeave,
}) => (
  <div
    className="fixed inset-0 z-[95] flex items-center justify-center px-5 bg-ink/50 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label={title}
    onClick={onStay}
  >
    <div
      className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-card-hover"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-coral-soft">
        <LogOut className="w-7 h-7 text-coral" />
      </div>
      <h3 className="text-lg font-black text-ink text-center mb-1">{title}</h3>
      <p className="text-sm text-muted text-center mb-5 leading-relaxed">{hint}</p>
      <div className="flex gap-2">
        <button
          onClick={onStay}
          className="flex-1 py-3 rounded-2xl border-2 border-line text-ink font-bold text-sm hover:bg-bg transition-colors"
        >
          {stayLabel}
        </button>
        <button
          onClick={onLeave}
          className="flex-1 py-3 rounded-2xl text-white font-black text-sm transition-transform active:scale-[0.97] bg-gradient-to-br from-coral to-[#cc251d] shadow-card hover:shadow-card-hover"
        >
          {leaveLabel}
        </button>
      </div>
    </div>
  </div>
);
