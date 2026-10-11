import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // mengekspos server ke jaringan lokal (misal: http://10.233.69.167:5173)
    port: 5173
  }
})
