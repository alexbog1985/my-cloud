import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Загружаем переменные из backend/.env
  const backendEnvPath = path.resolve(__dirname, '../backend')
  const env = loadEnv(mode, backendEnvPath, '')
  
  return {
    plugins: [react()],
    base: '/static/',
    build: {
      outDir: 'dist',
      manifest: true,
      emptyOutDir: true,
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.API_URL || 'http://localhost:8000/api'),
    },
  }
})
