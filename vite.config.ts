
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are linked relatively (important for GitHub Pages/Vercel)
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Removed minify: 'terser' to use default 'esbuild' and avoid the missing dependency error
    chunkSizeWarningLimit: 1600,
  }
});
