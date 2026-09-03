/**
 * Renders every route to static HTML after `vite build`.
 *
 * The site has no backend: it reads the public mainnet node straight from the
 * browser. So the deploy is a folder of finished HTML files, and every route has
 * to exist as one — both for the reader with a cold cache and for the crawler
 * that never runs the bundle.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SSR = join(ROOT, '.ssr');

// Build the server bundle from the same source the browser bundle uses, so the
// two cannot drift.
execFileSync(
  'npx',
  ['vite', 'build', '--ssr', 'src/entry-server.tsx', '--outDir', '.ssr', '--logLevel', 'warn'],
  { cwd: ROOT, stdio: 'inherit' },
);

const mod = await import(pathToFileURL(join(SSR, 'entry-server.js')).href);
const {
  DESCRIPTION,
  POST_PATHS,
  POSTS,
  ROUTE_META,
  ROUTE_PATHS,
  SITE,
  canonicalFor,
  escapeHtml,
  render,
  TITLE,
} = mod;

/**
 * The card for a route. Blog posts share the publications card rather than each
 * getting one: a post's card would have to restate its title, and og.mjs draws
 * from ROUTE_META, which posts are not in.
 */
const ogImage = (path) =>
  existsSync(join(ROOT, 'public/og', `${path === '/' ? 'home' : path.slice(1)}.png`))
    ? `/og/${path === '/' ? 'home' : path.slice(1)}.png`
    : '/og/publicaciones.png';

const template = readFileSync(join(DIST, 'index.html'), 'utf8');

/**
 * The template has to be Vite's own output, with an empty root. Running this
 * script twice without an intervening `vite build` reads the already-prerendered
 * landing page back in as the template, and every route then inherits the
 * landing body while still reporting success. That failure is invisible in the
 * log and survives all the way to a deploy, so it is an error rather than a
 * warning.
 */
if (!template.includes('<div id="root"></div>')) {
  throw new Error(
    "dist/index.html is not Vite's shell. Run `vite build` before this script: " +
      'the home page overwrites it at the end, so a second run without a rebuild ' +
      'would read the scroll page back in as the template.',
  );
}
const routes = [...ROUTE_PATHS, ...POST_PATHS];

for (const path of routes) {
  const body = await render(path, 'es');
  const post = POSTS.find((p) => `/publicaciones/${p.slug}` === path);
  const meta = ROUTE_META[path];
  const title = post ? `${post.title.es} — DecentralAmerica` : (meta?.title.es ?? TITLE.es);
  const desc = post ? post.description.es : (meta?.description.es ?? DESCRIPTION.es);

  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      '</head>',
      `  <meta name="description" content="${escapeHtml(desc)}" />\n` +
        `  <link rel="canonical" href="${canonicalFor(path)}" />\n` +
        `  <meta property="og:title" content="${escapeHtml(title)}" />\n` +
        `  <meta property="og:description" content="${escapeHtml(desc)}" />\n` +
        `  <meta property="og:type" content="website" />\n` +
        `  <meta property="og:url" content="${canonicalFor(path)}" />\n` +
        `  <meta property="og:site_name" content="DecentralAmerica" />\n` +
        `  <meta property="og:locale" content="es_CR" />\n` +
        // A card per route, drawn by scripts/og.mjs from this page's own title.
        // Absolute: a relative og:image is ignored by every crawler that reads it.
        `  <meta property="og:image" content="${SITE}${ogImage(path)}" />\n` +
        `  <meta property="og:image:width" content="1200" />\n` +
        `  <meta property="og:image:height" content="630" />\n` +
        `  <meta property="og:image:alt" content="${escapeHtml(title)}" />\n` +
        `  <meta name="twitter:card" content="summary_large_image" />\n` +
        `  <meta name="twitter:title" content="${escapeHtml(title)}" />\n` +
        `  <meta name="twitter:description" content="${escapeHtml(desc)}" />\n` +
        `  <meta name="twitter:image" content="${SITE}${ogImage(path)}" />\n` +
        '</head>',
    )
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  const out = path === '/' ? join(DIST, 'index.html') : join(DIST, path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`  prerendered ${path}`);
}

/**
 * The home page is hand-built, not rendered from React, so it is copied over
 * Vite's shell after every route has been written. It goes last for the reason
 * the guard above exists: this file is the template until this moment.
 */
writeFileSync(join(DIST, 'index.html'), readFileSync(join(ROOT, 'home.html'), 'utf8'));
console.log('  copied      / (home.html)');


const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', ...routes].map((p) => `  <url><loc>${SITE}${p === '/' ? '' : p}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

rmSync(SSR, { force: true, recursive: true });
console.log(`\n${routes.length} routes prerendered, plus the home page.`);
