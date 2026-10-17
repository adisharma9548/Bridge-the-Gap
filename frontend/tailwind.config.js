/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Setu Permanent Design System: Aubergine, Persimmon & Porcelain
        brand: {
          primary: {
            DEFAULT: '#633B72',
            hover: '#4E2E5B',
            soft: '#F0E8F3',
          },
          secondary: {
            DEFAULT: '#E46D45',
            hover: '#C95431',
            soft: '#FBECE5',
          },
          highlight: '#E5BD55',
        },
        aubergine: {
          DEFAULT: '#633B72',
          hover: '#4E2E5B',
          soft: '#F0E8F3',
          dark: '#3A1E44',
          light: '#7A4B8C',
        },
        persimmon: {
          DEFAULT: '#E46D45',
          hover: '#C95431',
          soft: '#FBECE5',
          dark: '#9F3718',
          light: '#EC8562',
        },
        brass: {
          DEFAULT: '#E5BD55',
          hover: '#D3A73B',
          soft: '#FAF3E0',
        },

        // Neutral Foundation
        canvas: '#F7F4F0',
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#FFFCF8',
          muted: '#EEE9E3',
        },
        border: {
          DEFAULT: '#DDD5CE',
          subtle: '#DDD5CE',
          strong: '#B8ADA3',
          grey: '#DDD5CE',
        },
        text: {
          primary: '#29232B',
          secondary: '#665D68',
          muted: '#776F78',
        },

        // Semantic Colors
        semantic: {
          success: {
            DEFAULT: '#216E4E',
            soft: '#E7F4EC',
          },
          warning: {
            DEFAULT: '#875700',
            soft: '#FFF2D6',
          },
          error: {
            DEFAULT: '#B42332',
            soft: '#FCEBED',
          },
          info: {
            DEFAULT: '#454B9A',
            soft: '#ECEEFC',
          },
        },

        // Aliases mapping old tokens cleanly to the new permanent palette
        navy: {
          DEFAULT: '#29232B',
          deep: '#1F1A21',
          muted: '#665D68',
        },
        ivory: {
          DEFAULT: '#F7F4F0',
          surface: '#FFFFFF',
          dark: '#EEE9E3',
        },
        slate: {
          subtle: '#665D68',
          dark: '#29232B',
          light: '#776F78',
        },
        pale: {
          blue: '#F0E8F3', // Brand-tinted aubergine soft
          mint: '#E7F4EC', // Semantic success soft
          amber: '#FFF2D6', // Semantic warning soft
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(41, 35, 43, 0.04)',
        card: '0 1px 3px 0 rgba(41, 35, 43, 0.06), 0 1px 2px -1px rgba(41, 35, 43, 0.04)',
        elevated: '0 10px 25px -5px rgba(41, 35, 43, 0.08), 0 8px 10px -6px rgba(41, 35, 43, 0.04)',
        tactile: '0 4px 0 0 #4E2E5B',
        'tactile-pressed': '0 0 0 0 #4E2E5B',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
