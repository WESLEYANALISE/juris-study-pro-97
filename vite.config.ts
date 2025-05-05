
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Improve performance by using babel's runtime JSX transform
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react-pdf', 
      'pdfjs-dist', 
      'react-router-dom', 
      'framer-motion', 
      '@tanstack/react-query'
    ],
    esbuildOptions: {
      // Improve tree-shaking
      treeShaking: true,
    }
  },
  
  build: {
    // Use faster minification
    minify: 'esbuild',
    
    // Generate separate chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split PDF.js into a separate chunk to manage its size
          pdfjs: ['react-pdf', 'pdfjs-dist'],
          
          // Split other large dependencies
          core: [
            'react', 
            'react-dom', 
            'react-router-dom',
          ],
          
          // Separate state management
          state: [
            '@tanstack/react-query',
            '@tanstack/react-query-persist-client',
            '@tanstack/query-sync-storage-persister'
          ],
          
          // Animations
          animation: [
            'framer-motion',
          ],
          
          // UI libraries
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-icons',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            'lucide-react'
          ]
        },
      },
    },
    
    // Generate source maps for better debugging
    sourcemap: mode === 'development',
    
    // Target modern browsers for smaller bundles
    target: 'esnext',
    
    // Increase the warning limit to avoid noise
    chunkSizeWarningLimit: 1000,
  },
  
  server: {
    port: 8080,
    host: '::',
    // Improve hot module replacement performance
    hmr: {
      overlay: true,
    },
  },
  
  // Cache dependencies during development
  cacheDir: '.vite_cache',
  
  // Improve CSS handling
  css: {
    devSourcemap: true, // Enable CSS source maps
  },
  
  // Improve previews
  preview: {
    port: 8080,
    host: '::',
  }
}));
