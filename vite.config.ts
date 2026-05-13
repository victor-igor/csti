/// <reference types="vitest" />
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (['react', 'react-dom', 'react-router-dom'].some(p => id.includes(`/node_modules/${p}/`))) return 'vendor-react'
          if (['@tanstack/react-query', '@tanstack/react-query-persist-client', '@tanstack/query-sync-storage-persister'].some(p => id.includes(`/node_modules/${p}/`))) return 'vendor-query'
          if (id.includes('/node_modules/@supabase/')) return 'vendor-supabase'
          if (['lucide-react', '@base-ui/react', '@radix-ui/react-dropdown-menu'].some(p => id.includes(`/node_modules/${p}/`))) return 'vendor-ui'
          if (['react-hook-form', '@hookform/resolvers', 'zod'].some(p => id.includes(`/node_modules/${p}/`))) return 'vendor-forms'
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'react-hook-form',
      'zod',
      '@hookform/resolvers/zod',
      'sonner',
      'lucide-react',
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/.claude/**', '**/dist/**'],
  },
})
