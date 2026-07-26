import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    // МАГИЯ: Автоматически копируем index.html в 404.html после сборки
    {
      name: 'copy-index-to-404',
      closeBundle() {
        fs.copyFileSync('dist/index.html', 'dist/404.html')
      }
    }
  ],
  base: '/',
  server: {
    allowedHosts: ["kaleert.ru", "kaleert.pro"]
  }
})
