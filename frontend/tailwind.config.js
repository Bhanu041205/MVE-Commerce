/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937',
        secondary: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444',
        light: '#f3f4f6',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
