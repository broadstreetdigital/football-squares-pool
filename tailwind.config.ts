import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Football theme colors
        turf: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#1a4d2e', // Main turf green
          600: '#0f3820', // Dark turf
          700: '#0a2817',
          800: '#051a0f',
          900: '#020d08',
        },
        stadium: {
          gold: '#fbbf24',
          'gold-light': '#fcd34d',
          'gold-dark': '#f59e0b',
        },
        scoreboard: {
          bg: '#1a1a1a',
          text: '#00ff41', // LED green
          glow: '#00ff4180',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-teko)', 'Impact', 'sans-serif'],
      },
      backgroundImage: {
        'yard-lines': `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 9%,
          rgba(255, 255, 255, 0.03) 9%,
          rgba(255, 255, 255, 0.03) 10%
        )`,
        'turf-gradient': 'linear-gradient(135deg, #1a4d2e 0%, #0f3820 100%)',
        'stadium-lights': 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.15) 0%, transparent 60%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3)',
        'scoreboard': '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)'
          },
          '50%': {
            opacity: '.8',
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.8)'
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
