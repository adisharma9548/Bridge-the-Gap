/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Distinctive Civic Palette: Midnight Teal, Saffron Ochre, Forest Emerald & Warm Sand Linen
        cobalt: {
          DEFAULT: '#0C4A60',
          hover: '#08384A',
          dark: '#052632',
          light: '#146380',
        },
        teal: {
          DEFAULT: '#0C4A60',
          hover: '#08384A',
          dark: '#052632',
          light: '#146380',
        },
        royal: {
          DEFAULT: '#0284C7',
          hover: '#0369A1',
        },
        saffron: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          light: '#F59E0B',
          dark: '#92400E',
        },
        jade: {
          DEFAULT: '#059669',
          hover: '#047857',
          light: '#10B981',
          dark: '#065F46',
        },
        emerald: {
          DEFAULT: '#059669',
          hover: '#047857',
          light: '#10B981',
          dark: '#065F46',
        },
        ivory: {
          DEFAULT: '#FAF8F5',
          surface: '#FFFFFF',
          dark: '#F2EFE9',
        },
        navy: {
          DEFAULT: '#18181B',
          deep: '#09090B',
          muted: '#27272A',
        },
        slate: {
          subtle: '#52525B',
          dark: '#3F3F46',
          light: '#71717A',
        },
        pale: {
          blue: '#E6F4F8',
          mint: '#E6F7ED',
          amber: '#FEF3C7',
        },
        border: {
          grey: '#E4E1D9',
          subtle: '#ECE9E2',
          strong: '#D1CCC0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(23, 36, 58, 0.04)',
        card: '0 1px 3px 0 rgba(23, 36, 58, 0.06), 0 1px 2px -1px rgba(23, 36, 58, 0.04)',
        elevated: '0 10px 25px -5px rgba(23, 36, 58, 0.08), 0 8px 10px -6px rgba(23, 36, 58, 0.04)',
        tactile: '0 4px 0 0 #1D3BB6',
        'tactile-pressed': '0 0 0 0 #1D3BB6',
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
