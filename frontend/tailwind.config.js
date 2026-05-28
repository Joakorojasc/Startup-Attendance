/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          base:    '#f1f5f9',
          surface: '#ffffff',
          elevated:'#f8fafc',
          hover:   '#f1f5f9',
        },
        border: {
          subtle:  '#e2e8f0',
          DEFAULT: '#cbd5e1',
          strong:  '#94a3b8',
        },
        text: {
          primary:  '#0f172a',
          secondary:'#475569',
          muted:    '#94a3b8',
          disabled: '#cbd5e1',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover:   '#4f46e5',
          muted:   '#e0e7ff',
          subtle:  '#eef2ff',
        },
        success: { DEFAULT: '#059669', muted: '#047857', subtle: '#ecfdf5' },
        warning: { DEFAULT: '#d97706', muted: '#b45309', subtle: '#fffbeb' },
        danger:  { DEFAULT: '#dc2626', muted: '#b91c1c', subtle: '#fef2f2' },
        orange:  { DEFAULT: '#ea580c', subtle: '#fff7ed' },
      },
      borderRadius: {
        sm:  '6px',
        DEFAULT: '8px',
        md:  '10px',
        lg:  '12px',
        xl:  '16px',
      },
      boxShadow: {
        subtle:   '0 1px 2px rgba(0,0,0,0.06)',
        card:     '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        elevated: '0 4px 16px rgba(0,0,0,0.10)',
        'glow-accent': '0 0 20px rgba(99,102,241,0.25)',
        'glow-success': '0 0 20px rgba(5,150,105,0.2)',
      },
      animation: {
        'slide-up': 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':  'fadeIn 0.18s ease-out both',
        'scale-in': 'scaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        slideUp:  { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
