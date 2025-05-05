
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
          'pdf-vendor': ['react-pdf'],
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
  // Optimize PDF.js handling by excluding it from transformation
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
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
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Improved caching strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif|webp)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          // Use NetworkFirst for PDFs with more relaxed memory constraints
          {
            urlPattern: ({ url }) => {
              return url.pathname.endsWith('.pdf') || url.pathname.includes('storage/v1/object');
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pdf-cache',
              expiration: {
                maxEntries: 10, // Reduce from 50 to 10
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => {
              return url.pathname.includes('vademecum');
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vademecum-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Prevent excessive memory use
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    // Add a memory limit hint for Node
    '__MEMORY_LIMIT__': JSON.stringify('4096')
  },
}));
