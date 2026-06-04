import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Browser never holds the API key — it talks to the local Express proxy.
      '/api': 'http://localhost:8787',
    },
  },
});
