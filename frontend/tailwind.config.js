/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        brand: {
          primary: '#FF6B35',
          secondary: '#FF8C61',
          dark: '#E55A2B',
          light: '#FFAB91',
          accent: '#FF4500',
        },
        dark: {
          900: '#0a0a0f',
          800: '#151520',
          700: '#1f1f2e',
          600: '#2a2a3d',
        }
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-orange': 'linear-gradient(135deg, #FF6B35 0%, #FF8C61 50%, #FFAB91 100%)',
        'mesh-dark': 'linear-gradient(180deg, #0a0a0f 0%, #1f1f2e 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.6)' },
        },
      },
      boxShadow: {
        'glow-orange': '0 0 30px rgba(255, 107, 53, 0.4)',
        'glow-sm': '0 0 15px rgba(255, 107, 53, 0.3)',
        'card': '0 10px 40px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}