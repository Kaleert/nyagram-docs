/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        // Фирменные цвета из логотипа
        nya: {
          primary: '#E94033',    // Красный (верх лого)
          secondary: '#F08D43',  // Оранжевый (низ лого)
          dark: '#121212',       // Глубокий черный фон
          surface: '#1E1E1E',    // Чуть светлее для карточек
          border: '#2A2A2A',     // Границы в темной теме
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'], // Моноширинный шрифт для кода
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}