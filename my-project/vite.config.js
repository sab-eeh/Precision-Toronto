import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCompression({ algorithm: "brotliCompress" }), // ✅ smaller build size
  ],

  server: {
    host: true, // allow external access
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // backend server
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      "d22f1ff557df.ngrok-free.app", // your ngrok domain
      "*.ngrok-free.app", // allow any ngrok subdomain
      "*.loca.lt", // if using localtunnel
    ],
  },

  build: {
    chunkSizeWarningLimit: 1000, // adjust if bundle is big
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});
