
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Reduce memory usage during build
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: mode === 'development', 
    // Improve chunking strategy to reduce memory usage
    rollupOptions: {
      output: {
        manualChunks: {
          // Optimize chunks for better memory usage
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-tooltip', 
            '@radix-ui/react-tabs'
          ],
          // Separate PDF library into its own chunk to reduce memory pressure
          'pdf-viewer': ['react-pdf', '@/lib/pdf-config'],
          'pdf-lib': ['pdfjs-dist'],
          'framer-motion': ['framer-motion'],
          'tanstack': ['@tanstack/react-query'],
          'shadcn-ui': [
            '@/components/ui/button',
            '@/components/ui/input',
            '@/components/ui/dialog',
            '@/components/ui/drawer',
          ],
        },
        // Output chunking strategy
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')){
            return 'assets/images/[name]-[hash][extname]';
          }
          
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }

          if (/\.pdf$/.test(name ?? '')) {
            return 'assets/docs/[name]-[hash][extname]';
          }
          
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Optimize terser options
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    // Set memory limit for node during build
    chunkSizeWarningLimit: 1600, // Increase the warning limit
  },
  // Optimize PDF.js handling - crucial for proper worker loading
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'pdfjs-dist': path.resolve(__dirname, 'node_modules/pdfjs-dist'),
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'placeholder.svg'],
      manifest: {
        name: 'Direito 360',
        short_name: 'Direito 360',
        description: 'Plataforma completa para estudantes e profissionais de direito',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          },
          {
            src: 'https://imgur.com/G15NKWM.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ].filter(Boolean),
}));
