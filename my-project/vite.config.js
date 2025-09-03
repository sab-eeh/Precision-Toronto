import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() , tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
  server: {
    allowedHosts: [
      'd22f1ff557df.ngrok-free.app', // your ngrok domain
      '*.ngrok-free.app',            // allow any ngrok subdomain
      '*.loca.lt'                    // if using localtunnel
    ],
    host: true,  // allow external access
    port: 5173
  }
})
