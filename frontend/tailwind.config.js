/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          base: '#09090b',
          surface: '#111113',
          elevated: '#18181b',
          hover: '#1f1f23',
        },
        border: {
          subtle: '#1f1f23',
          DEFAULT: '#27272a',
          strong: '#3f3f46',
        },
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#52525b',
          disabled: '#3f3f46',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          muted: '#312e81',
          subtle: '#1e1b4b',
        },
        success: { DEFAULT: '#22c55e', muted: '#16a34a', subtle: '#052e16' },
        warning: { DEFAULT: '#f59e0b', muted: '#d97706', subtle: '#1c1007' },
        danger: { DEFAULT: '#ef4444', muted: '#dc2626', subtle: '#1f0707' },
        orange: { DEFAULT: '#f97316', subtle: '#1c0e03' },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0,0,0,0.4)',
        card: '0 1px 4px rgba(0,0,0,0.6)',
        elevated: '0 4px 16px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [],
}
