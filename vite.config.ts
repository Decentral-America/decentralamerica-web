import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    /**
     * Inline the app marks and nothing else. A flat byte limit high enough for the
     * marks also swept in @fontsource's 8-11KB woff subsets, and `font-src 'self'`
     * refuses a data: URI, so every monospace face on the site was blocked.
     */
    assetsInlineLimit: (filePath: string) =>
      filePath.includes('/assets/apps/')
        ? true
        : /\.(woff2?|ttf|otf|eot)$/.test(filePath)
          ? false
          : undefined,
    outDir: 'dist',
    // 1.3MB and a third of everything shipped, for no user benefit. The source is
    // public on GitHub for anyone who wants to read it.
    sourcemap: false,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
