/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0D3B6E', 600: '#0A2F58', 700: '#072342' },
        mint: { DEFAULT: '#4ECFA8', 100: '#C7F1E2', 600: '#2DB98D' },
        amber: { DEFAULT: '#E8A838' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}
