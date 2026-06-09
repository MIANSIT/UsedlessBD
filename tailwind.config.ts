import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'system-ui', 'sans-serif'],
      },
      colors: {
        // uselessbd brand — #0B5FFF primary blue
        primary: {
          50:  '#EEF4FF',
          100: '#D4E4FF',
          200: '#A9C8FF',
          300: '#7EAAFF',
          400: '#538CFF',
          500: '#2B6AFF',
          600: '#0B5FFF', // Brand primary
          700: '#0A4FD6',
          800: '#0840AD',
          900: '#063184',
          950: '#041B5C',
        },
        // #00C897 accent green
        secondary: {
          50:  '#E6FAF5',
          100: '#CCFFEE',
          200: '#99FFDD',
          300: '#66F5CC',
          400: '#33EBB6',
          500: '#00C897', // Brand accent/CTA
          600: '#00A07A',
          700: '#008063',
          800: '#00604B',
          900: '#004033',
          950: '#002020',
        },
        // Semantic tokens matching PRD
        danger:  '#E63946',
        warning: '#F4A261',
        // Neutrals
        charcoal: '#1A1A2E', // PRD text-primary
        snow:     '#F7F9FC', // PRD background
        muted:    '#6B7280', // PRD text-secondary
        border:   '#E5E7EB', // PRD border
      },
      borderRadius: {
        card:  '8px',
        input: '6px',
        badge: '4px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
