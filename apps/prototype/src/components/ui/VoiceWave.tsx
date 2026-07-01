import React from 'react';

export const VoiceWave: React.FC<{ bars?: number }> = ({ bars = 15 }) => {
  return (
    <div className="wave-animation flex items-center justify-center gap-1 h-11 w-full">
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} />
      ))}
    </div>
  );
};
