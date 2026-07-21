import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'flipkart-blue': '#2874F0',
        'flipkart-yellow': '#FFE11B',
        'flipkart-orange': '#FB641B',
        'flipkart-green': '#388E3C'
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'sans-serif']
      },
      keyframes: {
        'pulse-once': {
          '0%': { backgroundColor: 'rgba(40,116,240,0.15)' },
          '100%': { backgroundColor: 'transparent' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'stock-change': 'pulse-once 1.2s ease-out',
        'toast-in': 'fade-in-up 0.2s ease-out'
      }
    }
  },
  plugins: []
};

export default config;
