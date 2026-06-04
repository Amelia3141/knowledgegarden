import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Soft Animal-Crossing pastel palette
        mint: '#bde6cf',
        blush: '#ffc9d4',
        butter: '#ffe9a8',
        sky: '#bfe3ff',
        lilac: '#dcc9ff',
        sage: '#9fd8b4',
        bark: '#a87c5a',
        soil: '#c9a27a',
        cream: '#fff7ec',
        leaf: '#6cc28a',
      },
      fontFamily: {
        round: ['"Baloo 2"', '"Quicksand"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(120, 100, 80, 0.35)',
        pop: '0 4px 0 0 rgba(120, 100, 80, 0.22)',
      },
      borderRadius: {
        blob: '40% 60% 55% 45% / 55% 45% 60% 40%',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
