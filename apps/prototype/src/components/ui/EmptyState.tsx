import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-soft flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-teal" />}
      </div>
      <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
      {description && <p className="text-sm text-muted max-w-xs">{description}</p>}
    </div>
  );
};
