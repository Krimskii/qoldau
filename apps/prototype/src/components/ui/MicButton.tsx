import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import clsx from 'clsx';

interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  size?: 'md' | 'lg' | 'xl';
  className?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  isRecording,
  onClick,
  size = 'lg',
  className,
}) => {
  const sizeClasses = {
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        'rounded-full flex items-center justify-center transition-all',
        'focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2',
        sizeClasses[size],
        className
      )}
      style={{
        background: isRecording
          ? 'radial-gradient(circle, #0AA99D 0%, #057E78 68%, #DFF6F2 70%, #F2FBF9 100%)'
          : 'linear-gradient(135deg, var(--teal), #037A76)',
        boxShadow: '0 18px 45px rgba(7, 149, 139, 0.22)',
      }}
    >
      {isRecording ? (
        <MicOff className="w-1/2 h-1/2 text-white" />
      ) : (
        <Mic className="w-1/2 h-1/2 text-white" />
      )}
    </button>
  );
};
