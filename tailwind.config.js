/** @type {import('tailwindcss').Config} */
// Tokens synchronisés avec src/theme.json
// Pour changer la couleur principale de tout le site : modifier "brand.primary" ici ET dans theme.json
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tokens marque — source unique de vérité
        brand: {
          primary:    '#F97316', // orange principal (= orange-500 Tailwind, couleur du logo)
          primaryHover: '#EA580C', // orange-600
          secondary:  '#000000', // noir
          bg:         '#FFFFFF',
          surface:    '#F5F5F5',
          surfaceAlt: '#1A1A1A',
          muted:      '#999999',
          success:    '#00D084',
          warning:    '#FF9F0A',
          error:      '#FF3B30',
          accent:     '#FFD60A',
        },
      },
      fontFamily: {
        sans: ["'Helvetica Neue'", 'Arial', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ["'Helvetica Neue'", "'Arial Black'", 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '20px',
        pill: '50px',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,0.08)',
        md: '0 4px 16px rgba(0,0,0,0.12)',
        lg: '0 8px 32px rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [],
};
