import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        emerald: {
          500: '#10b981',
        },
        gold: '#fbbf24',
      },
    },
  },
  plugins: [],
};

export default config;
