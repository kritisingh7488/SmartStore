/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 24px 60px rgba(113, 84, 55, 0.12)',
        glow: '0 0 0 1px rgba(113, 84, 55, 0.08), 0 20px 45px rgba(113, 84, 55, 0.18)'
      },
      colors: {
        cream: {
          50: '#fffdf8',
          100: '#fff8ec',
          200: '#f8ead1',
          300: '#f1d7ac',
          400: '#e8b977',
          500: '#d89b54',
          600: '#bb7939',
          700: '#8d592d',
          800: '#604024',
          900: '#3c281b'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif']
      },
      backgroundImage: {
        'cookie-glow': 'radial-gradient(circle at top, rgba(233, 187, 121, 0.34), transparent 45%), radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.8), transparent 35%)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        reveal: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        reveal: 'reveal 0.5s ease-out both'
      }
    }
  },
  plugins: []
};