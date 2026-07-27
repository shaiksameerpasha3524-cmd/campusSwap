/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B5CFF',
          hover: '#004ee6',
          light: '#3d7eff',
        },
        secondary: {
          DEFAULT: '#4DA3FF',
          hover: '#2690ff',
          light: '#80bdff',
        },
        appBg: {
          DEFAULT: '#F5F7FB',
          dark: '#0B0F19',
        },
        cardBg: {
          DEFAULT: '#FFFFFF',
          dark: '#161F30',
        },
        textMain: {
          DEFAULT: '#1E293B',
          dark: '#F8FAFC',
        },
        textMuted: {
          DEFAULT: '#64748B',
          dark: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -2px rgba(11, 92, 255, 0.04), 0 2px 8px -1px rgba(0, 0, 0, 0.02)',
        'soft-hover': '0 20px 40px -4px rgba(11, 92, 255, 0.08), 0 8px 16px -2px rgba(11, 92, 255, 0.02)',
        premium: '0 10px 30px -10px rgba(11, 92, 255, 0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
