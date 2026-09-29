/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#005FF9',       // Синий MAX
        primaryHover: '#004ecc',  // Темно-синий для ховера
        bgChat: '#F4F5F7',        // Фон чата
        bubbleMe: '#E3F2FD',      // Фон твоего сообщения (если нужен)
        bubbleThem: '#FFFFFF',    // Фон чужого сообщения
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}