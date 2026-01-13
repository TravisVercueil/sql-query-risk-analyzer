/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mac-bg': '#E5E5E5',
        'mac-panel': '#F8F8F8',
        'mac-primary': '#4A6FA5',
        'mac-warning': '#B94A48',
        'mac-success': '#5A7F62',
      },
      fontFamily: {
        'chicago': ['-apple-system', 'BlinkMacSystemFont', 'System UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
