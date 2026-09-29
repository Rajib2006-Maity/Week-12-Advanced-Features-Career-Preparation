import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

// Performance requirements from Day 5 of the brief:
// - gzip compression of the production build output
// - manual vendor chunk splitting so React/router/socket.io are cached
//   separately from application code that changes more often
export default defineConfig({
  plugins: [react(), viteCompression({ algorithm: 'gzip' })],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          sockets: ['socket.io-client']
        }
      }
    }
  },
  server: {
    port: 3000
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true
  }
});
