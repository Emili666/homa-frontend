/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8EAF7',
          100: '#D1D5EF',
          200: '#A3ABDF',
          300: '#7581CF',
          400: '#4757BF',
          500: '#18206F',
          600: '#141A59',
          700: '#101443',
          800: '#0C0D2D',
          900: '#060717',
        },
        secondary: {
          500: '#17255A',
        },
        action: {
          500: '#BD1E1E',
        },
        neutral: {
          500: '#F5E2C8',
        },
        accent: {
          500: '#D88373',
        }
      }
    }
  },
  plugins: []
}
