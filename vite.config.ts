
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
    // No longer exclude pdfjs-dist to ensure proper bundling
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split PDF.js into a separate chunk to manage its size
          pdfjs: ['react-pdf'],
          // Split other large dependencies
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            'framer-motion',
            '@tanstack/react-query'
          ],
          ui: [
            '@radix-ui',
            'lucide-react'
          ]
        },
      },
    },
    sourcemap: true, // Enable sourcemaps for easier debugging
    target: 'esnext',
    minify: 'esbuild', // Change from terser to esbuild for faster builds
    chunkSizeWarningLimit: 1000, // Increase the warning limit
  },
  server: {
    port: 8080,
    host: '::',
  }
}));
