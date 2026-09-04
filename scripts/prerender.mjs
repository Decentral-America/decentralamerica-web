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
  PAGE_BRIEFS,
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
const ORG = { '@id': `${SITE}/#organization` };

/**
 * A crawler reading this site found one structured-data block, on the home page.
 * Every other route described itself in meta tags alone, and the articles did not
 * say they were articles: no date, no author, no headline.
 *
 * A post is a BlogPosting. Everything else is a WebPage carrying a breadcrumb, so
 * a result can show where in the site it sits. Both reference the Organization
 * the home page already declares rather than restating it.
 */
const jsonLd = (path, post, title, desc) => {
  const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` }];
  if (path.startsWith('/publicaciones/')) {
    crumbs.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Publicaciones',
      item: `${SITE}/publicaciones`,
    });
  }
  if (path !== '/') {
    crumbs.push({
      '@type': 'ListItem',
      position: crumbs.length + 1,
      name: (post ? post.title.es : title).split(' — ')[0],
      item: canonicalFor(path),
    });
  }

  const main = post
    ? {
        '@type': 'BlogPosting',
        author: ORG,
        datePublished: post.date,
        dateModified: post.date,
        description: post.description.es,
        headline: post.title.es,
        image: `${SITE}${ogImage(path)}`,
        inLanguage: 'es',
        keywords: post.tags.join(', '),
        mainEntityOfPage: canonicalFor(path),
        publisher: ORG,
        url: canonicalFor(path),
      }
    : {
        '@type': 'WebPage',
        description: desc,
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/#website` },
        name: title,
        publisher: ORG,
        url: canonicalFor(path),
      };

  // A page that answers questions in its own body says so here. Built from the
  // same PAGE_BRIEFS the page renders, so a rich result cannot quote a question
  // the page does not ask.
  const brief = PAGE_BRIEFS[path];
  const faq = brief && {
    '@type': 'FAQPage',
    mainEntity: brief.faqs.map((f) => ({
      '@type': 'Question',
      acceptedAnswer: { '@type': 'Answer', text: f.a.es },
      name: f.q.es,
    })),
  };

  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      main,
      { '@type': 'BreadcrumbList', itemListElement: crumbs },
      ...(faq ? [faq] : []),
    ],
  })}</script>`;
};

/**
 * Analytics and Search Console, injected only when the environment supplies the
 * ids. Absent them this is a no-op, so a clone builds a site with no third-party
 * script in it at all, which is the behaviour a contributor should get by
 * default. Railway holds the real values.
 */
const GA4 = process.env.VITE_GA4_ID ?? '';
const GSC = process.env.GSC_VERIFICATION ?? '';

const analytics = () =>
  (GSC ? `  <meta name="google-site-verification" content="${escapeHtml(GSC)}" />\n` : '') +
  (GA4
    ? `  <script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4)}"></script>\n` +
      '  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}' +
      `gtag('js',new Date());gtag('config','${GA4}')</script>\n`
    : '');

const routes = [...ROUTE_PATHS, ...POST_PATHS];

for (const path of routes) {
  const body = await render(path, 'es');
  const post = POSTS.find((p) => `/publicaciones/${p.slug}` === path);
  const meta = ROUTE_META[path];
  // A result shows about sixty characters. "Cinco republicaciones, catorce meses
  // cerrados reescritos — DecentralAmerica" is seventy-five, and the brand is the
  // half that gets cut, so it is only appended when the whole thing survives.
  // og:site_name carries the brand either way.
  // When the brand does not survive, the section is appended instead. Both keep
  // the tag distinct from the H1 below it, which is the point: two identical
  // strings waste the second-largest field a result has.
  const brand = (t) => (t.length + 19 <= 60 ? `${t} — DecentralAmerica` : `${t} — Publicaciones`);
  const title = post ? brand(post.title.es) : (meta?.title.es ?? TITLE.es);
  const desc = post ? post.description.es : (meta?.description.es ?? DESCRIPTION.es);

  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      '</head>',
      `  <meta name="description" content="${escapeHtml(desc)}" />\n` +
        `  <link rel="canonical" href="${canonicalFor(path)}" />\n` +
        `  <meta property="og:title" content="${escapeHtml(title)}" />\n` +
        `  <meta property="og:description" content="${escapeHtml(desc)}" />\n` +
        `  <meta property="og:type" content="${post ? 'article' : 'website'}" />\n` +
        (post
          ? `  <meta property="article:published_time" content="${post.date}T00:00:00+00:00" />\n` +
            post.tags
              .map((t) => `  <meta property="article:tag" content="${escapeHtml(t)}" />\n`)
              .join('')
          : '') +
        `  <meta property="og:url" content="${canonicalFor(path)}" />\n` +
        `  <meta property="og:site_name" content="DecentralAmerica" />\n` +
        `  <meta property="og:locale" content="es_CR" />\n` +
        // A card per route, drawn by scripts/og.mjs from this page's own title.
        // Absolute: a relative og:image is ignored by every crawler that reads it.
        `  <meta property="og:image" content="${SITE}${ogImage(path)}" />\n` +
        `  <meta property="og:image:width" content="1200" />\n` +
        `  <meta property="og:image:height" content="630" />\n` +
        `  <meta property="og:image:alt" content="${escapeHtml(title)}" />\n` +
        `  ${jsonLd(path, post, title, desc)}\n` +
        `  <meta name="twitter:card" content="summary_large_image" />\n` +
        `  <meta name="twitter:title" content="${escapeHtml(title)}" />\n` +
        `  <meta name="twitter:description" content="${escapeHtml(desc)}" />\n` +
        `  <meta name="twitter:image" content="${SITE}${ogImage(path)}" />\n` +
        analytics() +
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
writeFileSync(
  join(DIST, 'index.html'),
  readFileSync(join(ROOT, 'home.html'), 'utf8').replace('</head>', `${analytics()}</head>`),
);
console.log('  copied      / (home.html)');


const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', ...routes]
  .map((p) => {
    // Only posts carry a date anyone can defend. Stamping today on every static
    // route each build tells a crawler nothing and teaches it to ignore the field.
    const post = POSTS.find((x) => `/publicaciones/${x.slug}` === p);
    return `  <url><loc>${SITE}${p === '/' ? '' : p}</loc>${post ? `<lastmod>${post.date}</lastmod>` : ''}</url>`;
  })
  .join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
/**
 * llms.txt — an index of this site for automated readers.
 *
 * Same titles and descriptions the pages carry, so a model reading this and a
 * reader reading a search result are told the same thing.
 */
const llms = [
  '# DecentralAmerica',
  '',
  `> ${DESCRIPTION.es}`,
  '',
  '## Páginas',
  '',
  `- [${TITLE.es}](${SITE}/): ${DESCRIPTION.es}`,
  ...ROUTE_PATHS.map(
    (r) => `- [${ROUTE_META[r].title.es}](${SITE}${r}): ${ROUTE_META[r].description.es}`,
  ),
  '',
  '## Publicaciones',
  '',
  ...POSTS.map((p) => `- [${p.title.es}](${SITE}/publicaciones/${p.slug}): ${p.description.es}`),
  '',
  '## Capa de evidencia',
  '',
  `- [Ancla](${SITE}/evidencia): El registro verificable de la compra pública de Costa Rica y Panamá, con cada copia guardada, su raíz Merkle y el anclaje en cadena.`,
  '',
];
writeFileSync(join(DIST, 'llms.txt'), llms.join('\n'));
console.log(`  llms.txt (${ROUTE_PATHS.length + POSTS.length + 1} entries)`);

writeFileSync(
  join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\n# Index for automated readers.\n# ${SITE}/llms.txt\n\nSitemap: ${SITE}/sitemap.xml\n`,
);

rmSync(SSR, { force: true, recursive: true });
console.log(`\n${routes.length} routes prerendered, plus the home page.`);
