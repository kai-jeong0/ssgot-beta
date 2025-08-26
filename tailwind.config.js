/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        carrot: '#FF7419',
        primary: {
          background: '#ffffff',
          text: '#000000',
          body: '#4b5563',
        },
        accent: {
          yellow: '#eab308',
          blue: '#3b82f6',
          green: '#10b981',
          red: '#ef4444',
          purple: '#8b5cf6',
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
