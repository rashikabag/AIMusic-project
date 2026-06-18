import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname, 'client'),
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/generate-loop': 'http://127.0.0.1:8000',
      '/historical-presets': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/client'),
    emptyOutDir: true,
  },
});
