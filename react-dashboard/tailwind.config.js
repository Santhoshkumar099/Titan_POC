/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#FDFAF2',
          100: '#F8EFD0',
          200: '#F0D98A',
          300: '#E4C050',
          400: '#C8A24A',
          500: '#A88030',
          600: '#8A6420',
          DEFAULT: '#C8A24A',
          light: '#EDD898',
          dark:  '#9A6E20',
        },
        maroon: {
          50:  '#FCF2F5',
          100: '#F5CCDA',
          200: '#E880A4',
          300: '#C84478',
          400: '#8B2A4E',
          500: '#6D213C',
          600: '#4A1628',
          700: '#2E0D18',
          DEFAULT: '#6D213C',
          light: '#8B2A4E',
          dark:  '#4A1628',
        },
        cream: {
          DEFAULT: '#FAF7F2',
          50:  '#FDFCFA',
          100: '#FAF7F2',
          200: '#F0EBE0',
          300: '#E5DDD0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10), 0 20px 48px rgba(0,0,0,0.08)',
        'glow-gold':   '0 0 24px rgba(200,162,74,0.18)',
        'glow-maroon': '0 0 24px rgba(109,33,60,0.18)',
        'inner-gold':  'inset 0 1px 0 rgba(200,162,74,0.2)',
      },
      backgroundImage: {
        'gradient-gold':   'linear-gradient(135deg, #C8A24A 0%, #EDD898 50%, #C8A24A 100%)',
        'gradient-maroon': 'linear-gradient(135deg, #6D213C 0%, #4A1628 100%)',
        'shimmer':         'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':     'spin 8s linear infinite',
        'shimmer-slide': 'shimmer 2s ease-in-out infinite',
        'fade-in':       'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
