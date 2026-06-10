import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Конфигурация для разных режимов
  if (mode === 'production') {
    return {
      plugins: [react()],
      build: {
        // Собираем в frontend/dist для гибкой интеграции с Django
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        manifest: true, // Генерируем manifest.json для django-vite
        sourcemap: false, // Отключаем sourcemaps для продакшена (безопасность)
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Удаляем console.log в продакшене
          },
        },
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Разделение зависимостей на чанки для лучшей кэшируемости
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
                return 'react';
              }
              if (id.includes('node_modules/@reduxjs/toolkit') || id.includes('node_modules/react-redux')) {
                return 'redux';
              }
              if (id.includes('node_modules/bootstrap') || id.includes('node_modules/react-bootstrap-icons')) {
                return 'bootstrap';
              }
            },
          },
        },
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
