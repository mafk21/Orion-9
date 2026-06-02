import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#04070f',
          900: '#080e1b',
          800: '#121d34',
          700: '#1c2c4b',
          600: '#17253d'
        },
        neon: {
          blue: '#67e8f9',
          teal: '#2dd4bf',
          violet: '#c084fc',
          amber: '#fbbf24',
          rose: '#fb7185'
        },
        alert: {
          info: '#22d3ee',
          warning: '#fbbf24',
          success: '#34d399',
          danger: '#fb7185'
        }
      },
      boxShadow: {
        neon: '0 0 40px rgba(56, 189, 248, 0.18), 0 0 80px rgba(168, 85, 247, 0.12)',
        holo: '0 18px 46px rgba(8, 14, 27, 0.45), 0 0 0 1px rgba(125, 211, 252, 0.08)',
        warning: '0 0 32px rgba(251, 191, 36, 0.2)'
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Fira Code"', 'monospace']
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 rgba(56, 189, 248, 0.15)' },
          '50%': { boxShadow: '0 0 18px rgba(56, 189, 248, 0.35)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        scan: {
          '0%': { transform: 'translateX(-8%)', opacity: '0.2' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateX(108%)', opacity: '0.2' }
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.6s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        scan: 'scan 2.4s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
