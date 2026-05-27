/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        canvas: 'hsl(var(--canvas) / <alpha-value>)',
        'surface-soft': 'hsl(var(--surface-soft) / <alpha-value>)',
        'surface-card': 'hsl(var(--surface-card) / <alpha-value>)',
        'surface-elevated': 'hsl(var(--surface-elevated) / <alpha-value>)',
        hairline: 'hsl(var(--hairline) / <alpha-value>)',
        'hairline-strong': 'hsl(var(--hairline-strong) / <alpha-value>)',
        ink: 'hsl(var(--ink) / <alpha-value>)',
        body: 'hsl(var(--body) / <alpha-value>)',
        'body-strong': 'hsl(var(--body-strong) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        'muted-soft': 'hsl(var(--muted-soft) / <alpha-value>)',
        olive: {
          DEFAULT: '#7C7E2C',
          active: '#686A24',
          disabled: '#2f3014',
        },
        emerald: { DEFAULT: '#22c55e' },
        rose: { DEFAULT: '#ef4444' },
        info: { DEFAULT: '#3b82f6' },
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
      letterSpacing: {
        'display-xl': '-0.0347em',
        'display-lg': '-0.0357em',
        'display-md': '-0.0375em',
        'display-sm': '-0.03125em',
        'title-lg': '-0.0125em',
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.05', fontWeight: '700' }],
        'display-lg': ['56px', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['40px', { lineHeight: '1.15', fontWeight: '700' }],
        'display-sm': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-lg': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'title-md': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'title-sm': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        stat: ['56px', { lineHeight: '1.0', fontWeight: '700' }],
        'caption-up': ['12px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.125em' }],
      },
      spacing: {
        section: '96px',
      },
    },
  },
  plugins: [],
};
