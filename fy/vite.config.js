import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType:'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Set to 5MB
      },
      manifest:{
        "name": "Transport Book",
        "short_name": "TransBook",
        "description":"Book Your Rides, Get Your Receipts.",
        "screenshots": [
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "1024x1024",
            "type": "image/png",
            "purpose":"maskable",
            "form_factor":"narrow"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "360x360",
            "type": "image/png",
            "purpose":"maskable",
            "form_factor":"wide"
          }
        ],
        "icons": [
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose":"any",
            "form_factor":"wide"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "32x32",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "256x256",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "180x180",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose":"maskable"    
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "1024x1366",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "1024x1024",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "414x736",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "720x1440",
            "type": "image/png",
            "purpose":"maskable"
          },
          {
            "src": "/transBook_logo_circular.png",
            "sizes": "353x745",  
            "type": "image/png",
            "purpose":"any"
          }
        ],
        "related_applications":[],
        "start_url": "/",
        "id":"floral-decor",
        "background_color": "#FFFFFF",
        "theme_color": "#2C3E50",
        "display_override": ["fullscreen", "minimal-ui"],
        "display": "standalone",
        "orientation": "portrait",
        "animation":"pulse",
        "scope":"/",
        "protocol_handlers":[
          {
            "protocol":"web+balloondecor",
            "url":"/handler?/=%s"
          },
          {
            "protocol":"tel",
            "url":"/handler?/=%s"
          },
          {
            "protocol":"web+balloondecor",
            "url":"/handler?/=%s"
          }
        ]
      }
    })
  ],
  base:'/',
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Moves dependencies into a separate chunk
          }
        },
      },
    },
  },
})
