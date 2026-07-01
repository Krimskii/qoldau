import React from 'react';

/**
 * Child 2D icon set (v0.3.15) — inline SVG, gradient-filled, animated.
 *
 * Используется в child UI (ChildHome / ChildCards / CalmMode / ChildSpeak /
 * PhraseBuilderPage). Каждая иконка — самодостаточный SVG с градиентом.
 *
 * API:
 *   <Water2DIcon size={56} animated />       // animated = true по умолчанию
 *   <Water2DIcon size={56} animated={false} />
 *
 * Все иконки используют 48x48 viewBox, и анимированная обёртка (`g.qoldau-icon-*`)
 * применяет CSS-анимации (float / sway / pulse / blink). При prefers-reduced-motion
 * анимации отключаются глобально через animations.css.
 */

export type Child2DAnimation = 'float' | 'sway' | 'pulse' | 'blink' | 'heartbeat' | 'none';

interface Child2DProps {
  size?: number;
  animated?: boolean;
  className?: string;
  ariaLabel?: string;
}

const defGrad = (id: string, c1: string, c2: string): React.ReactNode => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor={c1} />
    <stop offset="1" stopColor={c2} />
  </linearGradient>
);

const wrap = (
  anim: Child2DAnimation,
  children: React.ReactNode,
  _size: number,
  withAnim: boolean,
): React.ReactNode => {
  if (!withAnim || anim === 'none') return children;
  const cls = `qoldau-icon-${anim}`;
  return (
    <g className={cls} style={{ transformOrigin: '50% 50%', transformBox: 'fill-box' }}>
      {children}
    </g>
  );
};

const SvgShell: React.FC<{
  size: number;
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ size, ariaLabel, children, className }) => (
  <svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    style={{ overflow: 'visible' }}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  >
    {children}
  </svg>
);

// === Actions (для ChildHome, ChildCards) ===

export const Water2DIcon: React.FC<Child2DProps> = ({
  size = 48,
  animated = true,
  className,
  ariaLabel,
}) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('w2d-1', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <>
        <path d="M24 6c6 8 12 15 12 21a12 12 0 0 1-24 0c0-6 6-13 12-21z" fill="url(#w2d-1)" />
        <path d="M18 26a6 8 0 0 0 3 8" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.7} />
        <circle cx={20} cy={18} r={2} fill="#fff" opacity={0.5} />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Toilet2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('t2d-1', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <>
        <rect x={14} y={19} width={20} height={13} rx={6} fill="url(#t2d-1)" />
        <rect x={16} y={12} width={16} height={9} rx={4} fill="#b7e2f2" />
        <ellipse cx={24} cy={25} rx={6} ry={4} fill="#eaf5fb" />
        <path d="M17 32l1.5 6M31 32l-1.5 6" stroke="#3a9fd4" strokeWidth={3} strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Help2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('h2d-1', '#f0b4b4', '#d97a7a')}</defs>
    {wrap('sway', (
      <path d="M16 26c0-2 2-3 3-1l2 4V14a2.5 2.5 0 0 1 5 0v8a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v8c0 5-4 9-9 9h-3c-3 0-5-1-7-4l-6-9c-1-2 1-4 3-2l2 2z" fill="url(#h2d-1)" />
    ), size, animated)}
  </SvgShell>
);

export const Pause2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('p2d-1', '#efc884', '#d9a24e')}</defs>
    {wrap('pulse', (
      <>
        <rect x={16} y={12} width={7} height={24} rx={3.5} fill="url(#p2d-1)" />
        <rect x={25} y={12} width={7} height={24} rx={3.5} fill="url(#p2d-1)" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Fav2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('f2d-1', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('pulse', (
      <>
        <path d="M24 39S7 29 7 17.5A8.5 8.5 0 0 1 24 14a8.5 8.5 0 0 1 17 3.5C41 29 24 39 24 39z" fill="url(#f2d-1)" />
        <path d="M15 18a5 6 0 0 1 4-4" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6} />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Mic2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('m2d-1', '#7fd1c9', '#12807a')}</defs>
    {wrap('pulse', (
      <>
        <rect x={19} y={9} width={10} height={20} rx={5} fill="url(#m2d-1)" />
        <path d="M14 24a10 10 0 0 0 20 0" stroke="#12807a" strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M24 34v5M18 39h12" stroke="#12807a" strokeWidth={3} strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Food2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('fd-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <>
        <ellipse cx={24} cy={31} rx={16} ry={8} fill="url(#fd-2d)" />
        <ellipse cx={24} cy={29} rx={16} ry={7} fill="#b7e2f2" />
        <circle cx={18} cy={26} r={4.5} fill="#66bb87" />
        <circle cx={27} cy={24} r={4.5} fill="#ef9a9a" />
        <circle cx={30} cy={29} r={3.5} fill="#f2c14e" />
        <circle cx={21} cy={29} r={3} fill="#f6a5c0" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Hurt2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('hr-2d', '#f0b4b4', '#d97a7a')}</defs>
    <circle cx={24} cy={24} r={15} fill="url(#hr-2d)" />
    {wrap('pulse', (
      <>
        <path d="M16 20l4 3M20 20l-4 3M28 20l4 3M32 20l-4 3" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
        <path d="M18 32a7 7 0 0 1 12 0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Tired2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('tr-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <path d="M34 30a13 13 0 1 1-16-17 10 10 0 0 0 16 17z" fill="url(#tr-2d)" />
    ), size, animated)}
    {wrap('pulse', (
      <>
        <path d="M30 12h6l-6 6h6" stroke="#b7e2f2" strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M36 21h4l-4 4h4" stroke="#b7e2f2" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Home2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('hm-2d', '#efc884', '#d9a24e')}</defs>
    {wrap('float', (
      <>
        <path d="M11 24l13-11 13 11v13a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2z" fill="#f5dcab" />
        <path d="M9 24l15-13 15 13" stroke="url(#hm-2d)" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={21} y={28} width={7} height={11} rx={1.5} fill="url(#hm-2d)" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Play2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('pl-2d', '#77c797', '#3aa06b')}</defs>
    {wrap('float', (
      <>
        <rect x={9} y={18} width={30} height={15} rx={7.5} fill="url(#pl-2d)" />
        <path d="M16 26v-4M14 24h4" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={30} cy={23} r={2} fill="#fff" />
        <circle cx={33} cy={28} r={2} fill="#fff" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Hug2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('hg-2d', '#efc884', '#d9a24e')}</defs>
    {wrap('pulse', (
      <path d="M24 37S8 28 8 17.5A7.5 7.5 0 0 1 24 14a7.5 7.5 0 0 1 16 3.5C40 28 24 37 24 37z" fill="url(#hg-2d)" />
    ), size, animated)}
  </SvgShell>
);

export const No2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('n-2d', '#f0b4b4', '#d97a7a')}</defs>
    {wrap('pulse', (
      <>
        <circle cx={24} cy={24} r={14} fill="none" stroke="url(#n-2d)" strokeWidth={5} />
        <path d="M15 15l18 18" stroke="url(#n-2d)" strokeWidth={5} strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Mom2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('mm-2d', '#f0b4b4', '#d97a7a')}</defs>
    {wrap('float', (
      <>
        <circle cx={24} cy={17} r={7} fill="url(#mm-2d)" />
        <path d="M11 39a13 13 0 0 1 26 0z" fill="url(#mm-2d)" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Tutor2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('tu-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('float', (
      <>
        <circle cx={24} cy={18} r={6.5} fill="url(#tu-2d)" />
        <path d="M12 39a12 12 0 0 1 24 0z" fill="url(#tu-2d)" />
        <path d="M15 13l9-4 9 4-9 3z" fill="#8a6fc9" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Cartoon2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('ct-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('float', (
      <>
        <rect x={9} y={13} width={30} height={21} rx={6} fill="url(#ct-2d)" />
        <path d="M21 21l8 4.5-8 4.5z" fill="#fff" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Music2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('ms-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('sway', (
      <path d="M21 13v16a5 5 0 1 1-3-4.6V17l12-3v11a5 5 0 1 1-3-4.6V11z" fill="url(#ms-2d)" />
    ), size, animated)}
  </SvgShell>
);

export const Animals2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('an-2d', '#77c797', '#3aa06b')}</defs>
    {wrap('float', (
      <>
        <circle cx={24} cy={27} r={12} fill="url(#an-2d)" />
        <circle cx={15} cy={16} r={4.5} fill="#3aa06b" />
        <circle cx={33} cy={16} r={4.5} fill="#3aa06b" />
        <circle cx={20} cy={25} r={2.2} fill="#fff" />
        <circle cx={28} cy={25} r={2.2} fill="#fff" />
        <ellipse cx={24} cy={31} rx={3} ry={2.2} fill="#0d5c5c" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Car2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('cr-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <>
        <path d="M9 29l3-8h24l3 8v6a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2z" fill="url(#cr-2d)" />
        <path d="M15 21l2-4h14l2 4z" fill="#b7e2f2" />
        <circle cx={17} cy={35} r={3.5} fill="#0d5c5c" />
        <circle cx={31} cy={35} r={3.5} fill="#0d5c5c" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const CalmVid2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('cv-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('float', (
      <>
        <path d="M34 30a13 13 0 1 1-16-17 10 10 0 0 0 16 17z" fill="url(#cv-2d)" />
        <circle cx={30} cy={14} r={1.8} fill="#e0d3f7" />
        <circle cx={35} cy={20} r={1.3} fill="#e0d3f7" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Breath2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('br-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('pulse', (
      <path d="M9 27c4-9 8 9 12 0s8 9 12 0 8-6 8-6" stroke="url(#br-2d)" strokeWidth={4} fill="none" strokeLinecap="round" />
    ), size, animated)}
  </SvgShell>
);

export const Headphones2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('hp-2d', '#77c797', '#3aa06b')}</defs>
    {wrap('float', (
      <>
        <path d="M13 25a11 11 0 0 1 22 0" stroke="url(#hp-2d)" strokeWidth={4} fill="none" />
        <rect x={9} y={24} width={7} height={13} rx={3.5} fill="url(#hp-2d)" />
        <rect x={32} y={24} width={7} height={13} rx={3.5} fill="url(#hp-2d)" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Dark2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('dk-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <path d="M34 30a13 13 0 1 1-16-17 10 10 0 0 0 16 17z" fill="url(#dk-2d)" />
    ), size, animated)}
  </SvgShell>
);

// === Special: heart for "Позвать маму" CTA ===

export const Heart2DIcon: React.FC<Child2DProps> = ({ size = 26, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>
      {defGrad('hrt-2d', '#e88', '#c95f5f')}
    </defs>
    {wrap('heartbeat', (
      <path d="M12 21s-7.5-4.9-10-9.4C.3 8.2 1.9 4.5 5.3 4.5c2 0 3.4 1.1 4.2 2.4.4.6.6 1 .6 1s.2-.4.6-1c.8-1.3 2.2-2.4 4.2-2.4 3.4 0 5 3.7 3.3 7.1C19.5 16.1 12 21 12 21z" fill="url(#hrt-2d)" />
    ), size, animated)}
  </SvgShell>
);

// === Mic (large, for ChildSpeak) — used inline in ChildSpeak === //
// (Not exposed as icon to avoid the animation prop coupling)

// === Mascot: child-style monster для hero карточки ===

export const ChildMonsterMascot: React.FC<{ size?: number; animated?: boolean }> = ({
  size = 66,
  animated = true,
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{ overflow: 'visible' }}
    aria-label="Маскот"
  >
    <defs>{defGrad('cmg', '#8fd8d0', '#1ba39a')}</defs>
    <g className={animated ? 'qoldau-icon-pulse' : ''} style={{ transformOrigin: '50% 90%' }}>
      <ellipse cx="50" cy="58" rx="30" ry="32" fill="url(#cmg)" />
      <ellipse cx="42" cy="46" rx="10" ry="8" fill="#fff" opacity={0.25} />
      <path d="M40 26 Q44 12 50 24" stroke="#12807a" strokeWidth={4} strokeLinecap="round" fill="none" />
      <path d="M50 24 Q56 12 60 26" stroke="#12807a" strokeWidth={4} strokeLinecap="round" fill="none" />
      <g className={animated ? 'qoldau-icon-blink' : ''} style={{ transformOrigin: '50px 55px' }}>
        <circle cx="42" cy="55" r="4.5" fill="#173039" />
        <circle cx="58" cy="55" r="4.5" fill="#173039" />
        <circle cx="43.5" cy="53.5" r="1.5" fill="#fff" />
        <circle cx="59.5" cy="53.5" r="1.5" fill="#fff" />
      </g>
      <path d="M43 68 Q50 74 57 68" stroke="#12807a" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <circle className={animated ? 'qoldau-icon-pulse' : ''} cx="34" cy="64" r="4" fill="#f6b8b0" />
      <circle className={animated ? 'qoldau-icon-pulse' : ''} cx="66" cy="64" r="4" fill="#f6b8b0" />
    </g>
  </svg>
);

// === Cloud mascot для CalmMode ===

export const ChildCloudMascot: React.FC<{ size?: number; animated?: boolean }> = ({
  size = 124,
  animated = true,
}) => (
  <svg
    viewBox="0 0 120 120"
    width={size}
    height={size}
    style={{ overflow: 'visible' }}
    aria-label="Облачко"
  >
    <g className={animated ? 'qoldau-icon-cloud-float' : ''}>
      <path d="M35 78a20 20 0 0 1 3-40 24 24 0 0 1 46-4 18 18 0 0 1 6 44H35z" fill="#cfe6f5" />
      <g className={animated ? 'qoldau-icon-blink' : ''} style={{ transformOrigin: '48px 66px' }}>
        <circle cx="48" cy="66" r="4" fill="#173039" />
      </g>
      <g className={animated ? 'qoldau-icon-blink' : ''} style={{ transformOrigin: '72px 66px' }}>
        <circle cx="72" cy="66" r="4" fill="#173039" />
      </g>
      <path d="M52 74a8 8 0 0 0 16 0" stroke="#173039" strokeWidth={3} fill="none" strokeLinecap="round" />
      <circle cx="40" cy="72" r="5" fill="#f6b8b0" opacity={0.6} />
      <circle cx="80" cy="72" r="5" fill="#f6b8b0" opacity={0.6} />
    </g>
  </svg>
);

// === Puzzle icon (для "Собрать фразу") ===

export const Puzzle2DIcon: React.FC<Child2DProps> = ({ size = 34, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('pz-2d', '#a487d9', '#8a6fc9')}</defs>
    {wrap('sway', (
      <path d="M8 8h9a3 3 0 0 1 6 0h9v9a3 3 0 0 1 0 6v9h-9a3 3 0 0 0-6 0H8v-9a3 3 0 0 0 0-6z" fill="url(#pz-2d)" />
    ), size, animated)}
  </SvgShell>
);

// === Checkmark (для status chip) ===

export const Check2DIcon: React.FC<Child2DProps> = ({ size = 14, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <path d="M20 6 9 17l-5-5" stroke="#1f7a5e" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </SvgShell>
);

// === Back arrow (для sub-pages) ===

export const BackArrowIcon: React.FC<{ size?: number; className?: string; ariaLabel?: string }> = ({
  size = 22,
  className,
  ariaLabel,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="#4a6670"
    strokeWidth={2.5}
    strokeLinecap="round"
    className={className}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

// === Bell (для TopBar) ===

export const Bell2DIcon: React.FC<{ size?: number; className?: string }> = ({ size = 22, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="#4a6670"
    strokeWidth={2}
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

// === Settings (sun-cog) для TopBar ===

export const Settings2DIcon: React.FC<{ size?: number; className?: string }> = ({ size = 22, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="#4a6670"
    strokeWidth={2}
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const Tap2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('tap-2d', '#efc884', '#d9a24e')}</defs>
    {wrap('pulse', (
      <>
        <ellipse cx={24} cy={18} rx={6} ry={9} fill="url(#tap-2d)" />
        <ellipse cx={24} cy={36} rx={14} ry={4} fill="#e0d6f7" opacity={0.5} />
        <circle cx={20} cy={20} r={1.5} fill="#fff" />
        <circle cx={28} cy={20} r={1.5} fill="#fff" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Text2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('txt-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('float', (
      <>
        <rect x={8} y={12} width={32} height={24} rx={3} fill="url(#txt-2d)" />
        <text x={24} y={28} fontSize={16} fontWeight={800} fill="#fff" textAnchor="middle" fontFamily="sans-serif">Аа</text>
      </>
    ), size, animated)}
  </SvgShell>
);

export const Eye2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('eye-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('blink', (
      <>
        <ellipse cx={24} cy={24} rx={18} ry={11} fill="url(#eye-2d)" />
        <circle cx={24} cy={24} r={6} fill="#fff" />
        <circle cx={24} cy={24} r={3} fill="#173039" />
        <circle cx={25.5} cy={22.5} r={1} fill="#fff" />
      </>
    ), size, animated)}
  </SvgShell>
);

// === Color families для child cards (используется в QoldauActionCard-style wrappers) ===

export type ChildCardFamily = 'need' | 'do' | 'feel' | 'fav' | 'help';

export const CHILD_FAMILY_STYLES: Record<
  ChildCardFamily,
  { icoBg: string; lbl: string; ico: string }
> = {
  need:  { icoBg: 'bg-[#EAF5FB]', lbl: 'text-[#1F5F7D]', ico: 'text-[#3A9FD4]' },
  do:    { icoBg: 'bg-[#EAF6EF]', lbl: 'text-[#276B48]', ico: 'text-[#3AA06B]' },
  feel:  { icoBg: 'bg-[#FBF3E6]', lbl: 'text-[#8A5D17]', ico: 'text-[#D9A24E]' },
  fav:   { icoBg: 'bg-[#F1EEFB]', lbl: 'text-[#5B47A0]', ico: 'text-[#8A6FC9]' },
  help:  { icoBg: 'bg-[#FBEDED]', lbl: 'text-[#A24545]', ico: 'text-[#D97A7A]' },
};

// === Дополнительные иконки для полного покрытия builtinKey ===

export const Speak2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('sp-2d', '#7fd1c9', '#12807a')}</defs>
    {wrap('pulse', (
      <>
        <path d="M6 12a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H18l-8 6v-6a3 3 0 0 1-4-3z" fill="url(#sp-2d)" />
        <path d="M14 18a5 5 0 0 1 0 8M19 16a8 8 0 0 1 0 12M24 14a11 11 0 0 1 0 16" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.85} />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Call2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('cl-2d', '#7fd1c9', '#12807a')}</defs>
    {wrap('pulse', (
      <path d="M14 14a4 4 0 0 1 4-4h2l2 5-2.5 1.5a11 11 0 0 0 6 6L27 20l5 2v2a4 4 0 0 1-4 4 18 18 0 0 1-18-18z" fill="url(#cl-2d)" />
    ), size, animated)}
  </SvgShell>
);

export const Star2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('st-2d', '#f7c948', '#d9a24e')}</defs>
    {wrap('pulse', (
      <path d="M24 6l4 9 10 1-7.5 6.5L33 33l-9-5-9 5 2.5-10.5L10 16l10-1z" fill="url(#st-2d)" stroke="#fff" strokeWidth={1.5} />
    ), size, animated)}
  </SvgShell>
);

export const Now2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('nw-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('pulse', (
      <>
        <circle cx={24} cy={24} r={16} fill="url(#nw-2d)" />
        <circle cx={24} cy={24} r={13} fill="#fff" />
        <path d="M24 14v10l7 4" stroke="url(#nw-2d)" strokeWidth={3} fill="none" strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Next2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('nx-2d', '#77c797', '#3aa06b')}</defs>
    {wrap('sway', (
      <path d="M16 10l14 14-14 14z" fill="url(#nx-2d)" />
    ), size, animated)}
  </SvgShell>
);

export const Study2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('sd-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('float', (
      <>
        <path d="M10 14a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2z" fill="url(#sd-2d)" />
        <path d="M10 14h24M10 18h24" stroke="#fff" strokeWidth={1.5} />
        <path d="M14 24h6M14 28h12" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Yes2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('ys-2d', '#77c797', '#3aa06b')}</defs>
    {wrap('pulse', (
      <>
        <circle cx={24} cy={24} r={16} fill="url(#ys-2d)" />
        <path d="M14 24l7 7 14-14" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Trip2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('tr2-2d', '#efc884', '#d9a24e')}</defs>
    {wrap('float', (
      <>
        <path d="M10 18a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v14H10z" fill="url(#tr2-2d)" />
        <path d="M14 14a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v4" stroke="url(#tr2-2d)" strokeWidth={2.5} fill="none" />
        <path d="M18 26h12" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const SOS2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('so-2d', '#f0b4b4', '#d97a7a')}</defs>
    {wrap('pulse', (
      <>
        <path d="M24 6l5 11 12 1.5-9 8 2.5 12L24 32l-10.5 6.5L16 26l-9-8 12-1.5z" fill="url(#so-2d)" />
        <text x={24} y={28} fontSize={11} fontWeight={800} fill="#fff" textAnchor="middle">SOS</text>
      </>
    ), size, animated)}
  </SvgShell>
);

export const Message2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('mg-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <path d="M8 12a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H18l-8 6v-6a4 4 0 0 1-2-4z" fill="url(#mg-2d)" />
    ), size, animated)}
  </SvgShell>
);

export const Calm2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('cl2-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('pulse', (
      <>
        <path d="M34 30a13 13 0 1 1-16-17 10 10 0 0 0 16 17z" fill="url(#cl2-2d)" />
        <circle cx={20} cy={20} r={1.6} fill="#fff" />
        <circle cx={26} cy={16} r={1.2} fill="#fff" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Tablet2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('tb-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <>
        <rect x={9} y={6} width={30} height={36} rx={4} fill="url(#tb-2d)" />
        <rect x={13} y={10} width={22} height={26} rx={1} fill="#fff" />
        <circle cx={24} cy={40} r={1.5} fill="#fff" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Sparkle2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    {wrap('pulse', (
      <path d="M24 6l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#f7c948" stroke="#fff" strokeWidth={1.5} />
    ), size, animated)}
  </SvgShell>
);

export const Trophy2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('trp-2d', '#f7c948', '#d9a24e')}</defs>
    {wrap('pulse', (
      <>
        <path d="M14 8h20v8a10 10 0 0 1-20 0z" fill="url(#trp-2d)" />
        <path d="M14 12H8a4 4 0 0 0 4 6M34 12h6a4 4 0 0 1-4 6" stroke="url(#trp-2d)" strokeWidth={2.5} fill="none" />
        <rect x={18} y={28} width={12} height={6} fill="url(#trp-2d)" />
        <rect x={14} y={34} width={20} height={4} rx={1} fill="url(#trp-2d)" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Check2DIconLg: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('chk-2d', '#77c797', '#3aa06b')}</defs>
    {wrap('pulse', (
      <>
        <circle cx={24} cy={24} r={18} fill="url(#chk-2d)" />
        <path d="M14 24l7 7 14-14" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Phrase2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('ph-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('pulse', (
      <>
        <path d="M6 12a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H18l-8 6v-6a3 3 0 0 1-4-3z" fill="url(#ph-2d)" />
        <path d="M12 17h6M12 22h14M12 27h10" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Calendar2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('cal-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <>
        <rect x={8} y={10} width={32} height={30} rx={3} fill="url(#cal-2d)" />
        <rect x={8} y={10} width={32} height={8} fill="#fff" />
        <path d="M16 6v8M32 6v8" stroke="#3a9fd4" strokeWidth={3} strokeLinecap="round" />
        <circle cx={18} cy={26} r={2} fill="#fff" />
        <circle cx={24} cy={26} r={2} fill="#fff" />
        <circle cx={30} cy={26} r={2} fill="#fff" />
        <circle cx={18} cy={32} r={2} fill="#fff" />
        <circle cx={24} cy={32} r={2} fill="#fff" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Chart2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('ch-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('pulse', (
      <>
        <rect x={8} y={26} width={6} height={14} rx={1.5} fill="url(#ch-2d)" />
        <rect x={20} y={18} width={6} height={22} rx={1.5} fill="url(#ch-2d)" />
        <rect x={32} y={10} width={6} height={30} rx={1.5} fill="url(#ch-2d)" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const User2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('us-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <>
        <circle cx={24} cy={17} r={7} fill="url(#us-2d)" />
        <path d="M11 39a13 13 0 0 1 26 0z" fill="url(#us-2d)" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Walk2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('wk-2d', '#77c797', '#3aa06b')}</defs>
    {wrap('float', (
      <>
        <circle cx={22} cy={10} r={4} fill="url(#wk-2d)" />
        <path d="M22 18l-2 10 6 4 2 8" stroke="url(#wk-2d)" strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M20 18l8 4 4-2" stroke="url(#wk-2d)" strokeWidth={3} fill="none" strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const Dad2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('dd-2d', '#8fd0ea', '#3a9fd4')}</defs>
    {wrap('float', (
      <>
        <circle cx={24} cy={17} r={7} fill="url(#dd-2d)" />
        <path d="M11 39a13 13 0 0 1 26 0z" fill="url(#dd-2d)" />
        <path d="M18 12h12" stroke="#3a9fd4" strokeWidth={2.5} strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

// === Event icons (для IconRenderer event types) ===

export const CommunicationEvent2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('ce-2d', '#c3aef0', '#8a6fc9')}</defs>
    {wrap('pulse', (
      <>
        <path d="M6 12a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H18l-8 6v-6a3 3 0 0 1-4-3z" fill="url(#ce-2d)" />
        <circle cx={16} cy={20} r={2} fill="#fff" />
        <circle cx={24} cy={20} r={2} fill="#fff" />
        <circle cx={32} cy={20} r={2} fill="#fff" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const VoiceEvent2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('ve-2d', '#7fd1c9', '#12807a')}</defs>
    {wrap('pulse', (
      <>
        <rect x={19} y={9} width={10} height={20} rx={5} fill="url(#ve-2d)" />
        <path d="M14 24a10 10 0 0 0 20 0" stroke="#12807a" strokeWidth={3} fill="none" strokeLinecap="round" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const AACEvent2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('ae-2d', '#7fd1c9', '#12807a')}</defs>
    {wrap('pulse', (
      <>
        <rect x={6} y={10} width={16} height={12} rx={2} fill="url(#ae-2d)" />
        <rect x={26} y={10} width={16} height={12} rx={2} fill="url(#ae-2d)" />
        <rect x={6} y={26} width={16} height={12} rx={2} fill="url(#ae-2d)" />
        <rect x={26} y={26} width={16} height={12} rx={2} fill="url(#ae-2d)" />
      </>
    ), size, animated)}
  </SvgShell>
);

export const QuestionEvent2DIcon: React.FC<Child2DProps> = ({ size = 48, animated = true, className, ariaLabel }) => (
  <SvgShell size={size} ariaLabel={ariaLabel} className={className}>
    <defs>{defGrad('qe-2d', '#f7c948', '#d9a24e')}</defs>
    {wrap('pulse', (
      <>
        <circle cx={24} cy={24} r={18} fill="url(#qe-2d)" />
        <path d="M18 18a6 6 0 0 1 12 0c0 4-6 4-6 8" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx={24} cy={32} r={2} fill="#fff" />
      </>
    ), size, animated)}
  </SvgShell>
);

// === Mascot: альтернативный динозаврик (для PhraseBuilder/Choice) ===

export const DinoMascot2D: React.FC<{ size?: number; animated?: boolean }> = ({
  size = 80,
  animated = true,
}) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    style={{ overflow: 'visible' }}
    aria-label="Динозаврик"
  >
    <defs>{defGrad('dng', '#8fd8d0', '#1ba39a')}</defs>
    <g className={animated ? 'qoldau-icon-float' : ''}>
      <ellipse cx="50" cy="58" rx="28" ry="28" fill="url(#dng)" />
      <ellipse cx="40" cy="48" rx="9" ry="7" fill="#fff" opacity={0.3} />
      <path d="M22 50l-6-3 6-3M78 50l6-3-6-3" fill="#0d5c5c" />
      <path d="M30 70l-4 6M70 70l4 6" stroke="#0d5c5c" strokeWidth={3} strokeLinecap="round" />
      <circle cx="42" cy="55" r="3.5" fill="#173039" />
      <circle cx="58" cy="55" r="3.5" fill="#173039" />
      <circle cx="43" cy="54" r="1.2" fill="#fff" />
      <circle cx="59" cy="54" r="1.2" fill="#fff" />
      <path d="M44 66 Q50 70 56 66" stroke="#0d5c5c" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

// === Реестр builtinKey → 2D компонент ===
// (заменяет SOFT_FIRST_REGISTRY)

export const CHILD_2D_REGISTRY: Record<string, React.FC<{ size?: number; animated?: boolean; className?: string; ariaLabel?: string }>> = {
  // actions
  Water: Water2DIcon,
  Food: Food2DIcon,
  Toilet: Toilet2DIcon,
  Help: Help2DIcon,
  Pause: Pause2DIcon,
  Favorites: Fav2DIcon,
  Microphone: Mic2DIcon,
  Sleep: Tired2DIcon,
  Call: Call2DIcon,
  Star: Star2DIcon,
  Now: Now2DIcon,
  Next: Next2DIcon,
  Study: Study2DIcon,
  No: No2DIcon,
  Home: Home2DIcon,
  Yes: Yes2DIcon,
  Hug: Hug2DIcon,
  Play: Play2DIcon,
  Trip: Trip2DIcon,
  Music: Music2DIcon,
  Headphones: Headphones2DIcon,
  SOS: SOS2DIcon,
  Message: Message2DIcon,
  Calm: Calm2DIcon,
  Animals: Animals2DIcon,
  Cars: Car2DIcon,
  Cartoon: Cartoon2DIcon,
  Speak: Speak2DIcon,
  Video: CalmVid2DIcon,
  Breath: Breath2DIcon,
  Tablet: Tablet2DIcon,
  Sparkle: Sparkle2DIcon,
  Trophy: Trophy2DIcon,
  Check: Check2DIconLg,
  Phrase: Phrase2DIcon,
  Calendar: Calendar2DIcon,
  Chart: Chart2DIcon,
  User: User2DIcon,
  Walk: Walk2DIcon,
  Mom: Mom2DIcon,
  Dad: Dad2DIcon,
  Tutor: Tutor2DIcon,
  Sad: Hurt2DIcon,
  Moon: Dark2DIcon,
  // events
  CommunicationEvent: CommunicationEvent2DIcon,
  VoiceEvent: VoiceEvent2DIcon,
  AACEvent: AACEvent2DIcon,
  QuestionEvent: QuestionEvent2DIcon,
  // mascots
  CloudMascot: ChildCloudMascot,
  DinoMascot: DinoMascot2D,
};