import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // mkcert()
  ],
  server: {
    host: '0.0.0.0', // Bind to all available IPs
    port: 3000, // Use the port your server is on
    // https: true    
    fs: {
      cachedChecks: false
    }
  },
  build: {
    chunkSizeWarningLimit: 1000, // Adjust the limit as needed (in KB)
  },

})
