import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Конфигурация для разных режимов
  if (mode === 'production') {
    return {
      plugins: [react()],
      build: {
        outDir: 'dist',
        sourcemap: false, // Отключаем sourcemaps для продакшена (безопасность)
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Удаляем console.log в продакшене
          },
        },
        rollupOptions: {
          output: {
            manualChunks: {
              // Разделение зависимостей на чанки для лучшей кэшируемости
              react: ['react', 'react-dom', 'react-router-dom'],
              redux: ['@reduxjs/toolkit', 'react-redux'],
              bootstrap: ['bootstrap', 'react-bootstrap-icons'],
            },
          },
        },
      },
      server: {
        port: 5173,
        host: true,
      },
    }
  }
  
  // Конфигурация для разработки
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/media': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
