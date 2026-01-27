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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundColor: {
        'primary-theme': 'rgb(var(--color-bg-primary) / <alpha-value>)',
        'secondary-theme': 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        'tertiary-theme': 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
        'card-theme': 'rgb(var(--color-card-bg) / <alpha-value>)',
      },
      textColor: {
        'primary-theme': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'secondary-theme': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'tertiary-theme': 'rgb(var(--color-text-tertiary) / <alpha-value>)',
      },
      borderColor: {
        'theme': 'rgb(var(--color-border) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
