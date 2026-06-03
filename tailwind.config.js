/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50, #f0f9ff)',
          100: 'var(--color-primary-100, #e0f2fe)',
          200: 'var(--color-primary-200, #bae6fd)',
          300: 'var(--color-primary-300, #7dd3fc)',
          400: 'var(--color-primary-400, #38bdf8)',
          500: 'var(--color-primary-500, #0ea5e9)',
          600: 'var(--color-primary-600, #0284c7)',
          700: 'var(--color-primary-700, #0369a1)',
          800: 'var(--color-primary-800, #075985)',
          900: 'var(--color-primary-900, #0c4a6e)',
        },
        secondary: {
          50: 'var(--color-secondary-50, #fdf4ff)',
          100: 'var(--color-secondary-100, #fae8ff)',
          200: 'var(--color-secondary-200, #f5d0fe)',
          300: 'var(--color-secondary-300, #f0abfc)',
          400: 'var(--color-secondary-400, #e879f9)',
          500: 'var(--color-secondary-500, #d946ef)',
          600: 'var(--color-secondary-600, #c026d3)',
          700: 'var(--color-secondary-700, #a21caf)',
          800: 'var(--color-secondary-800, #86198f)',
          900: 'var(--color-secondary-900, #701a75)',
        },
        accent: {
          50: 'var(--color-accent-50, #ecfdf5)',
          100: 'var(--color-accent-100, #d1fae5)',
          200: 'var(--color-accent-200, #a7f3d0)',
          300: 'var(--color-accent-300, #6ee7b7)',
          400: 'var(--color-accent-400, #34d399)',
          500: 'var(--color-accent-500, #10b981)',
          600: 'var(--color-accent-600, #059669)',
          700: 'var(--color-accent-700, #047857)',
          800: 'var(--color-accent-800, #065f46)',
          900: 'var(--color-accent-900, #064e3b)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans, Inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading, Poppins)', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm, 0.375rem)',
        md: 'var(--radius-md, 0.5rem)',
        lg: 'var(--radius-lg, 0.75rem)',
        xl: 'var(--radius-xl, 1rem)',
        '2xl': 'var(--radius-2xl, 1.5rem)',
      },
    },
  },
  plugins: [],
};
