import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redireciona requisições de /backend para o seu servidor Flask
      '/backend': {
        target: 'http://127.0.0.1:5000', // Endereço do seu backend
        changeOrigin: true,
        // Reescreve o caminho para remover /backend antes de enviar para o Flask
        rewrite: (path) => path.replace(/^\/backend/, '') 
      }
    }
  }
})