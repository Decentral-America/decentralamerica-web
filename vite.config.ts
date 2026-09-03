import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Serves the static scroll-driven pages in dev.
 *
 * `/landing2` and `/landing3` are hand-built static pages in `public/`, not
 * React routes. Vite's public-dir middleware serves files but does not resolve
 * a directory to its `index.html`, so the request fell through to the SPA
 * fallback, got the app shell, and the router's unknown-path branch rendered
 * the ordinary landing page. The URL looked like it worked and silently showed
 * the wrong page, which is the worst version of this bug.
 *
 * Dev only. The production deploy prerenders every route to a real file and has
 * no catch-all rewrite, so `dist/landingN/index.html` is served directly.
 */
function staticPagesDev(): Plugin {
  const pages = [{ file: 'home.html', path: '/' }];
  return {
    apply: 'serve',
    // Installed ahead of Vite's own middlewares, so this runs before the SPA
    // fallback that was swallowing the request.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0] ?? '';
        const page = pages.find((p) => path === p.path);
        if (!page) return next();
        // Read per request: the pages are hand-edited and dev should reflect a
        // save without a restart.
        const file = fileURLToPath(new URL(`./${page.file}`, import.meta.url));
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(readFileSync(file));
      });
    },
    name: 'static-pages-dev',
  };
}

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
  plugins: [react(), tailwindcss(), staticPagesDev()],
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
