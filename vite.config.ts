import { defineConfig } from 'vite';

export default defineConfig({
  base: '/hotdog-geist/',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
  server: {
    port: 5173,
  },
});
