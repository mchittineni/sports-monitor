import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    css: true,
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html', 'json-summary'],
    },
    server: {
      deps: {
        inline: ['axios'],
      },
    },
  },
});
