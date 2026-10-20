/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F172A',
          slate: '#1E293B',
          muted: '#334155',
          teal: '#0D9488',
          tealLight: '#14B8A6',
          tealDark: '#0F766E',
          indigo: '#4F46E5',
          violet: '#6366F1',
          violetLight: '#818CF8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
