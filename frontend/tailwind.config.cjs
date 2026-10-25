/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0D0F', // global background
        surface: '#131619', // primary surfaces
        elevated: '#1A1E22', // elevated surfaces
        border: '#292E32', // borders
        primary: '#F3F4F2', // primary text
        secondary: '#929A9E', // secondary text
        accent: '#C7F36B', // electric lime
        warning: '#F2B45B',
        error: '#F07878',
      },
      fontFamily: {
        sans: ['system-ui', "'Segoe UI'", 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
