import React from 'react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status?: 'normal' | 'warning' | 'important';
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, status = 'normal' }) => {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#EEF4F3] py-2.5 last:border-0">
      <div className="flex items-center gap-2.5">
        <span className="text-muted">{icon}</span>
        <div>
          <h4 className="text-xs font-bold">{label}</h4>
          <p className="text-xs text-muted">{value}</p>
        </div>
      </div>
      <span
        className={`text-xs font-bold px-2 py-1 rounded-full ${
          status === 'important'
            ? 'bg-coral-soft text-coral'
            : status === 'warning'
            ? 'bg-yellow-soft text-yellow'
            : 'bg-teal-soft text-teal-dark'
        }`}
      >
        {status === 'normal' ? 'норма' : status === 'warning' ? 'внимание' : 'важно'}
      </span>
    </div>
  );
};
