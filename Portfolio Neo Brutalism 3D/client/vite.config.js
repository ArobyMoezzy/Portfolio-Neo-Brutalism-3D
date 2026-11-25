import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Saat development, request /api diteruskan ke backend Express
    proxy: { '/api': 'http://localhost:5000' }
  },
  build: {
    rollupOptions: {
      output: {
        // Pisahkan library besar agar cache browser lebih efisien
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['motion'],
          three: ['three'],
          gsap: ['gsap', '@gsap/react']
        }
      }
    }
  }
});
