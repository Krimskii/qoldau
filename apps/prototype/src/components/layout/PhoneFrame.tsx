import React from 'react';
import clsx from 'clsx';

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PhoneFrame — визуальная обёртка для desktop preview (v0.3.15).
 *
 * На desktop имитирует мобильный телефон:
 * - Width 390px, max-height 96vh
 * - Border 8px #10343a (тёмно-зелёный, как в child_v2.html mockup)
 * - Rounded 44px
 * - Soft shadow (var(--shadow-lg))
 *
 * На mobile (< 480px) рендерит children напрямую без рамки.
 *
 * Используется в AppShell для роли `child` на desktop.
 */
export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, className }) => {
  return (
    <>
      {/* Desktop frame */}
      <div
        className={clsx(
          'phone-frame-wrap hidden md:flex w-full justify-center items-center bg-[#dde8e8]',
          'min-h-screen p-5',
          className,
        )}
      >
        <div
          className="phone-frame relative flex flex-col overflow-hidden"
          style={{
            width: 390,
            maxWidth: '100%',
            height: 844,
            maxHeight: '96vh',
            background: '#f4f8f8',
            borderRadius: 44,
            border: '8px solid #10343a',
            boxShadow: '0 12px 30px rgba(23,48,57,0.12)',
          }}
        >
          {children}
        </div>
      </div>

      {/* Mobile direct (no frame) */}
      <div className="md:hidden w-full">{children}</div>
    </>
  );
};