import React from 'react';
import { QoldauEvent } from '@/types/qoldau';
import { Utensils, Droplet, Moon, Smile, MessageCircle, Brain, ShoppingBag } from 'lucide-react';
import { formatTime } from '@/utils/dateFormat';

interface TimelineItemProps {
  event: QoldauEvent;
  onClick?: () => void;
}

const getEventIcon = (type: QoldauEvent['type']) => {
  switch (type) {
    case 'food':
      return <Utensils className="w-4 h-4" />;
    case 'water':
    case 'toilet':
      return <Droplet className="w-4 h-4" />;
    case 'sleep':
      return <Moon className="w-4 h-4" />;
    case 'behavior':
    case 'state':
      return <Smile className="w-4 h-4" />;
    case 'communication':
      return <MessageCircle className="w-4 h-4" />;
    case 'sensory':
      return <Brain className="w-4 h-4" />;
    default:
      return <ShoppingBag className="w-4 h-4" />;
  }
};

const getEventColor = (type: QoldauEvent['type']) => {
  switch (type) {
    case 'food':
      return 'text-green';
    case 'water':
    case 'toilet':
      return 'text-blue';
    case 'sleep':
      return 'text-yellow';
    case 'behavior':
      return 'text-purple';
    case 'communication':
      return 'text-blue';
    case 'sensory':
      return 'text-yellow';
    case 'state':
      return 'text-green';
    default:
      return 'text-teal';
  }
};

export const TimelineItem: React.FC<TimelineItemProps> = ({ event, onClick }) => {
  const time = formatTime(event.timestamp);

  return (
    <div
      className="relative grid grid-cols-[44px_1fr] gap-2.5 items-start mb-3 cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute left-4 top-4 w-2.5 h-2.5 rounded-full bg-teal shadow-[0_0_0_5px_#E7F8F5]" />
      <div className="pt-1 text-xs text-muted font-bold">{time}</div>
      <div className="bg-white border border-line rounded-xl p-3 flex gap-2.5 items-start hover:shadow-card-soft transition-shadow">
        <span className={getEventColor(event.type)}>{getEventIcon(event.type)}</span>
        <div>
          <h4 className="text-xs font-bold">{event.title}</h4>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{event.description}</p>
        </div>
      </div>
    </div>
  );
};
