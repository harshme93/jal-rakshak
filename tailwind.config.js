/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      colors: {
        water: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        dirty: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        unknown: {
          400: '#9ca3af',
          500: '#6b7280',
        },
        surface: {
          0: '#0a0f0d',
          50: '#111916',
          100: '#1a2420',
          200: '#243530',
          300: '#2d4038',
          400: '#3d5a4f',
        },
        accent: '#00e09e',
      },
    },
  },
  plugins: [],
};
