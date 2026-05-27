/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0D3B6E', 50: '#E8EFF8', 100: '#C5D6ED', 200: '#8AAED9', 300: '#5086C5', 400: '#2E6AAE', 500: '#0D3B6E', 600: '#0A2F58', 700: '#072342', 800: '#04172C', 900: '#020B16' },
        mint: { DEFAULT: '#4ECFA8', 50: '#EDFAF4', 100: '#C7F1E2', 200: '#A0E8CF', 300: '#79DFBC', 400: '#61D7B2', 500: '#4ECFA8', 600: '#2DB98D', 700: '#229070', 800: '#186852', 900: '#0E4035' },
        amber: { DEFAULT: '#E8A838', 50: '#FDF5E5', 100: '#FAE4B3', 200: '#F5CC7A', 300: '#F0B441', 400: '#E8A838', 500: '#D4921E', 600: '#B07516', 700: '#8C590F', 800: '#683E08', 900: '#442504' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      backgroundColor: { page: '#F4F6FA' },
    },
  },
  plugins: [],
}
