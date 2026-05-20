/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#121212',
        surface: '#1E1E1E',
        'surface-2': '#2A2A2A',
        border: '#2F2F2F',
        muted: '#9A9A9A',
        text: '#F5F5F5',
        accent: '#CCFF00',
        'accent-dim': '#9BC400',
        danger: '#FF5252',
        success: '#4CAF50',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
