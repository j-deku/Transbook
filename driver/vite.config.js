import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',         // let Workbox generate its own sw.js
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      },
      manifest: {
        name: "TOLI-TOLI",
        short_name: "TOLI-TOLI",
        description: "Book Your Rides, Get Your Receipts.",
        screenshots: [
          { src: "/TT-logo-1024x1024.png", sizes: "1024x1024", type: "image/png", purpose: "maskable", form_factor: "narrow" },
          { src: "/TT-logo.png", sizes: "360x360", type: "image/png", purpose: "maskable", form_factor: "wide" }
        ],
        icons: [
          { src: "/TT-logo-144x144.png", sizes: "144x144", type: "image/png", purpose: "any", form_factor: "wide" },
          { src: "/TT-logo-32x32.png", sizes: "32x32", type: "image/png", purpose: "maskable" },
          { src: "/TT-logo.png", sizes: "180x180", type: "image/png", purpose: "maskable" },
          { src: "/TT-logo-1024x1024.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
          { src: "/TT-logo-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/TT-logo-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" }
        ],
        related_applications: [],
        start_url: "/",
        id: "floral-decor",
        background_color: "#FFFFFF",
        theme_color: "#2C3E50",
        display_override: ["fullscreen", "minimal-ui"],
        display: "standalone",
        orientation: "portrait",
        animation: "pulse",
        scope: "/",
        protocol_handlers: [
          { protocol: "web+tolitoli", url: "/handler?/=%s" },
          { protocol: "tel", url: "/handler?/=%s" }
        ]
      }
    })
  ],
  base: '/',
  server: {
    proxy: {
      '/api': import.meta.url,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})
