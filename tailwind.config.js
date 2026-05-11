/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fbf7ec',
          100: '#f6efe1',
          200: '#ece0c5',
          300: '#dec9a1',
          400: '#c9ad77',
          500: '#b59159',
          600: '#9a7544',
          700: '#7a5b36',
          800: '#5d4429',
          900: '#3e2d1c',
        },
        ink: {
          DEFAULT: '#2a1f14',
          soft: '#5d4429',
          muted: '#8b7355',
        },
        accent: {
          DEFAULT: '#a23e2c',
          soft: '#c95a45',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        book: '0 8px 24px -8px rgba(58, 38, 21, 0.25), 0 2px 4px rgba(58, 38, 21, 0.08)',
        card: '0 1px 2px rgba(58, 38, 21, 0.06), 0 4px 12px -4px rgba(58, 38, 21, 0.12)',
      },
    },
  },
  plugins: [],
};
