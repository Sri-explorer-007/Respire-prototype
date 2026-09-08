import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Ensure sufficient stack space for Rolldown / Rust compiler threads on Windows
process.env.RUST_MIN_STACK = process.env.RUST_MIN_STACK || '8388608';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    hmr: {
      overlay: false,
    },
  },
});
