/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F9F8',
        panel: '#FFFFFF',
        'panel-soft': '#F8FCFB',
        ink: '#102A43',
        'ink-2': '#334E68',
        muted: '#6B7C93',
        line: '#DCEAE7',
        teal: {
          DEFAULT: '#07958B',
          dark: '#075E59',
          soft: '#DDF5F0',
        },
        mint: '#BFECE4',
        blue: {
          DEFAULT: '#2385D6',
          soft: '#E8F3FF',
        },
        purple: {
          DEFAULT: '#7C5CCB',
          soft: '#F0EBFF',
        },
        yellow: {
          DEFAULT: '#E3A62F',
          soft: '#FFF3D8',
        },
        coral: {
          DEFAULT: '#E56F5D',
          soft: '#FFEDEA',
        },
        green: {
          DEFAULT: '#2E9F6E',
          soft: '#E9F8F0',
        },
      },
      borderRadius: {
        xl: '24px',
      },
      boxShadow: {
        card: '0 18px 55px rgba(12, 74, 68, .10)',
        'card-soft': '0 8px 25px rgba(12, 74, 68, .08)',
      },
    },
  },
  plugins: [],
};
