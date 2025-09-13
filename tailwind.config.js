/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
    theme: {
    extend: {
      colors: {
        primary: '#4CAF50', // A vibrant green for energy/health
        secondary: '#A5D6A7', // A lighter shade of primary
        accent: '#FF9800', // A bright, contrasting orange for CTAs
        darkText: '#333333', // Dark grey for readability
        lightBg: '#F5F5F5', // Light grey for clean backgrounds
      },
    },
  },
  plugins: [],
}