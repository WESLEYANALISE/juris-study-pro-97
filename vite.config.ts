
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react-pdf'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Put PDF.js worker in a separate chunk
          pdfjs: ['react-pdf', 'pdfjs-dist'],
        },
      },
    },
  },
  server: {
    port: 8080
  }
});
