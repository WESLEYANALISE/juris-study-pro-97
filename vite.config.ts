
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
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
    sourcemap: false,
    target: 'esnext',
    minify: 'terser'
  },
  server: {
    port: 8080,
    host: '::',
  }
}));
