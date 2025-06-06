/** @type {import('tailwindcss').Config} */

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@nethesis/vue-components/dist/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        // tailwind cyan palette
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: 'rgb(0, 165, 255)',
          400: '#22d3ee',
          500: 'rgb(0, 165, 255)',
          600: 'rgb(0, 165, 255)',
          700: 'rgb(0, 165, 255)',
          800: '#155e75',
          900: '#164e63',
          950: '#083344'
        }
      },
      screens: {
        '3xl': '1792px',
        '4xl': '2048px',
        '5xl': '2560px',
        '6xl': '3072px',
        '7xl': '3584px'
      },
      animation: {
        'spin-fast': 'spin 0.5s linear infinite'
      }
    }
  },
  variants: {
    extend: {
      textColor: ['group-hover']
    }
  },
  plugins: [require('@tailwindcss/forms')],
  darkMode: 'class'
}
