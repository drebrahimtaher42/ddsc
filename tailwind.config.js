/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0D224C',
        emeraldBrand: '#086958',
        mint: '#3AB498',
        canvas: '#F4F7F9',
        ink: '#0B192C',
        muted: '#64748B',
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        script: ['"Alex Brush"', 'cursive'],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(13, 34, 76, 0.06)',
        card: '0 2px 12px -2px rgba(13, 34, 76, 0.05), 0 1px 3px rgba(13, 34, 76, 0.03)',
        cardHover: '0 10px 24px -6px rgba(13, 34, 76, 0.09), 0 2px 6px rgba(13, 34, 76, 0.04)',
        nav: '0 -4px 20px rgba(13, 34, 76, 0.06)',
        pill: '0 4px 16px -2px rgba(13, 34, 76, 0.08)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sheetUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        sheetUp: 'sheetUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
