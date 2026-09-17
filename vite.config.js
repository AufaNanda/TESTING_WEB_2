import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages project site: https://<user>.github.io/website-portofolio/
  // Every asset URL in the app is built from import.meta.env.BASE_URL (see
  // src/lib/paths.js) so this is the one place the sub-path is set.
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
