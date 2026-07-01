/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surface
        bg: '#F7FAFA',
        'bg-soft': '#F0F7F7',
        panel: '#FFFFFF',
        'panel-soft': '#F8FCFB',

        // Ink
        ink: '#071B3A',
        'ink-2': '#334E68',
        muted: '#6B7C8F',

        // Border
        line: '#DDE8EA',
        'line-soft': '#EAF1F2',

        // Primary teal
        teal: {
          DEFAULT: '#009688',
          dark: '#008C8C',
          light: '#00AFA5',
          soft: '#DDF5F0',
          tint: '#EAF8F6',
        },
        mint: '#BFECE4',

        // Semantic
        blue: {
          DEFAULT: '#2385D6',
          dark: '#1A6BB0',
          soft: '#EAF5FF',
        },
        purple: {
          DEFAULT: '#7C5CCB',
          soft: '#F1EDFF',
        },
        yellow: {
          DEFAULT: '#F7C948',
          soft: '#FFF6DF',
        },
        coral: {
          DEFAULT: '#E56F5D',
          soft: '#FFEAEA',
        },
        green: {
          DEFAULT: '#4EC28A',
          dark: '#3DA876',
          soft: '#EAF8F0',
        },
      },
      borderRadius: {
        sm: '12px',
        md: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
      },
      boxShadow: {
        card: '0 8px 30px rgba(7, 27, 58, 0.06)',
        'card-soft': '0 4px 16px rgba(7, 27, 58, 0.05)',
        'card-hover': '0 12px 40px rgba(7, 27, 58, 0.10)',
        inner: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        'inner-soft': 'inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        'ring-teal': '0 0 0 4px rgba(0, 150, 136, 0.15)',
        'ring-coral': '0 0 0 4px rgba(229, 111, 93, 0.20)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.95' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 240ms ease-out',
        breathe: 'breathe 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        slideUp: 'slideUp 280ms ease-out',
      },
    },
  },
  plugins: [],
};