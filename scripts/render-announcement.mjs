#!/usr/bin/env node
/**
 * Render a bilingual announcement to two PDFs, one per language.
 *
 *   node scripts/render-announcement.mjs content/drafts/<file>.md
 *
 * The source is the same `--- es ---` / `--- en ---` markdown the blog builds
 * from, so the PDF and the web post cannot drift into saying different things.
 *
 * Type and palette come from src/index.css rather than being reinvented here.
 * Fonts are inlined as base64 rather than linked: headless Chrome resolves
 * file:// font URLs inconsistently and, when it fails, silently falls back to a
 * system face and produces a PDF that looks almost right. Static weights only —
 * a variable woff2 is dropped outright with no error.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const [, , mdArg] = process.argv;
if (!mdArg) {
  process.stderr.write('usage: node scripts/render-announcement.mjs <file.md>\n');
  process.exit(1);
}

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const face = (family, weight, file) => `@font-face{font-family:'${family}';font-style:normal;
  font-weight:${weight};font-display:block;
  src:url(data:font/woff2;base64,${b64(file)}) format('woff2');}`;

const FONTS = [
  face('Satoshi', 300, 'public/fonts/Satoshi-Light.woff2'),
  face('Satoshi', 400, 'public/fonts/Satoshi-Regular.woff2'),
  face('Satoshi', 500, 'public/fonts/Satoshi-Medium.woff2'),
  face('Satoshi', 700, 'public/fonts/Satoshi-Bold.woff2'),
  face('Satoshi', 900, 'public/fonts/Satoshi-Black.woff2'),
  face('IBM Plex Mono', 400, 'public/home/fonts/ibm-plex-mono-latin-400-normal.woff2'),
  face('IBM Plex Mono', 500, 'public/home/fonts/ibm-plex-mono-latin-500-normal.woff2'),
].join('\n');

/** The brand mark, stripped to the one path so it can be recoloured by CSS. */
const MARK_PATH = readFileSync(resolve(ROOT, 'public/brand/decentralamerica-mark.svg'), 'utf8')
  .match(/ d="([^"]+)"/)[1];

const mark = (size, fill = 'currentColor') =>
  `<svg viewBox="0 0 300 300" width="${size}" height="${size}" aria-hidden="true">` +
  `<path fill="${fill}" fill-rule="nonzero" d="${MARK_PATH}"/></svg>`;

// ---------------------------------------------------------------- source

const raw = readFileSync(resolve(mdArg), 'utf8');
const fm = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
if (!fm) throw new Error('no frontmatter');
const meta = Object.fromEntries(
  fm[1].split('\n').map((l) => {
    const i = l.indexOf(':');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }),
);
const body = fm[2];
const halves = {
  es: body.split('--- es ---')[1].split('--- en ---')[0].trim(),
  en: body.split('--- en ---')[1].trim(),
};

// ---------------------------------------------------------------- markdown

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline: links, bold, and code. Deliberately small; the source is ours. */
function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => {
      const abs = href.startsWith('/') ? `https://decentralamerica.com${href}` : href;
      return `<a href="${abs}">${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function render(md) {
  const out = [];
  let list = null;
  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  for (const line of md.split('\n')) {
    const t = line.trim();
    if (!t) {
      closeList();
      continue;
    }
    const h2 = /^## (.+)$/.exec(t);
    if (h2) {
      closeList();
      out.push(`<h2>${inline(h2[1])}</h2>`);
      continue;
    }
    const ol = /^(\d+)\.\s+(.+)$/.exec(t);
    if (ol) {
      if (list !== 'ol') {
        closeList();
        out.push('<ol>');
        list = 'ol';
      }
      out.push(`<li>${inline(ol[2])}</li>`);
      continue;
    }
    const ul = /^[-*]\s+(.+)$/.exec(t);
    if (ul) {
      if (list !== 'ul') {
        closeList();
        out.push('<ul>');
        list = 'ul';
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(t)}</p>`);
  }
  closeList();
  return out.join('\n');
}

// ---------------------------------------------------------------- per-language chrome

const COPY = {
  es: {
    kicker: 'Anuncio',
    date: '3 de septiembre de 2026',
    stats: [
      ['190', 'archivos mensuales', 'dic 2010 – sep 2026'],
      ['~6M', 'registros', 'historia consultable'],
      ['400+', 'huellas ancladas', 'en DecentralChain'],
      ['<$1', 'al año', 'costo de operación'],
    ],
    verify: 'Compruébelo usted mismo',
    verifyLines: [
      ['Las copias y las comparaciones', 'decentralamerica.com/evidencia'],
      ['La cuenta que firma las huellas', '3DTwG5ZydbJDuLdEmwfgDEH3NuwDrgwQFtF'],
      ['El código, con licencia MIT', 'github.com/dylanpersonguy/ancla'],
      ['La fuente de los datos', 'observatoriocomprapublica.go.cr'],
    ],
    foot: 'decentralamerica.com/evidencia',
  },
  en: {
    kicker: 'Announcement',
    date: '3 September 2026',
    stats: [
      ['190', 'monthly archives', 'Dec 2010 – Sep 2026'],
      ['~6M', 'records', 'queryable history'],
      ['400+', 'anchored fingerprints', 'on DecentralChain'],
      ['<$1', 'per year', 'running cost'],
    ],
    verify: 'Check it yourself',
    verifyLines: [
      ['The copies and the comparisons', 'decentralamerica.com/evidencia'],
      ['The account that signs the fingerprints', '3DTwG5ZydbJDuLdEmwfgDEH3NuwDrgwQFtF'],
      ['The code, MIT licensed', 'github.com/dylanpersonguy/ancla'],
      ['Where the data comes from', 'observatoriocomprapublica.go.cr'],
    ],
    foot: 'decentralamerica.com/evidencia',
  },
};

const CSS = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  /* From src/index.css. Warm white rather than #fff: pure white under a
     near-black display face reads clinical. */
  --ground:#fcfcfa; --ground-2:#f5f5f1; --panel:#ffffff;
  --ink:#0a0a0b; --muted:rgba(10,10,11,.62); --faint:rgba(10,10,11,.48);
  --hairline:rgba(10,10,11,.09); --hairline-2:rgba(10,10,11,.16);
  --confirmed:#1fd98a; --confirmed-ink:#067a48;
  --altered:#b2431a;
  --sans:'Satoshi',ui-sans-serif,system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,'SF Mono',monospace;
}

@page{size:A4;margin:19mm 20mm 17mm;}
@page:first{margin:0;}

html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}

/* No background on the interior pages, deliberately.
   Chrome paints html and body backgrounds only inside the @page margin box, so
   a warm interior draws a hard-edged rectangle down the middle of every sheet
   with a white strip around it. There is no way to reach the full bleed without
   @page{margin:0} and hand-paginating the flow. A warm cover and a clean
   interior is the ordinary way a printed document is set anyway. */
body{
  font-family:var(--sans);color:var(--ink);
  font-size:10.2pt;line-height:1.62;font-weight:400;
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none;border-bottom:.4pt solid var(--hairline-2);}
code{font-family:var(--mono);font-size:.9em;}
strong{font-weight:700;}

/* ---------------------------------------------------------------- cover */

.cover{
  height:297mm;padding:24mm 20mm 18mm;display:flex;flex-direction:column;
  page-break-after:always;background:var(--ground);
}
.cover__top{display:flex;align-items:center;gap:5mm;}
.cover__top svg{display:block;}
.wordmark{font-size:12pt;font-weight:700;letter-spacing:-.02em;}
.kicker{
  margin-left:auto;font-family:var(--mono);font-size:8pt;text-transform:uppercase;
  letter-spacing:.14em;color:var(--faint);
}
.cover h1{
  margin-top:34mm;font-size:40pt;line-height:1.0;letter-spacing:-.032em;
  font-weight:700;max-width:19ch;text-wrap:balance;
}
.cover .lede{
  margin-top:9mm;font-size:12.5pt;line-height:1.5;color:var(--muted);
  max-width:60ch;font-weight:400;
}
/* One accent, and only where a live claim is being made. */
.ribbon{
  margin-top:11mm;display:inline-flex;align-items:center;gap:2.6mm;
  font-family:var(--mono);font-size:8.4pt;letter-spacing:.04em;
  color:var(--confirmed-ink);background:rgba(31,217,138,.12);
  padding:2.2mm 4mm;border-radius:1.6mm;align-self:flex-start;
}
.ribbon i{width:1.9mm;height:1.9mm;border-radius:50%;background:var(--confirmed);display:block;}

.stats{
  margin-top:16mm;display:grid;grid-template-columns:repeat(4,1fr);
  border-top:.6pt solid var(--hairline-2);padding-top:6mm;gap:4mm;
}
.stat b{display:block;font-size:20pt;font-weight:700;letter-spacing:-.03em;line-height:1;}
.stat span{display:block;margin-top:2mm;font-size:8.6pt;color:var(--muted);line-height:1.35;}
.stat em{display:block;margin-top:.8mm;font-style:normal;font-size:7.6pt;color:var(--faint);
  font-family:var(--mono);letter-spacing:.01em;}

.cover__foot{
  margin-top:auto;padding-top:8mm;display:flex;justify-content:space-between;align-items:baseline;
  font-family:var(--mono);font-size:8.2pt;color:var(--faint);letter-spacing:.02em;
}

/* ---------------------------------------------------------------- body */

.sheet{padding-top:2mm;}
h2{
  font-size:15.5pt;font-weight:700;letter-spacing:-.024em;line-height:1.14;
  margin:11mm 0 4mm;padding-top:3.5mm;border-top:.6pt solid var(--hairline);
  break-after:avoid;
}
h2:first-of-type{margin-top:0;border-top:0;padding-top:0;}
p{margin:0 0 3.4mm;max-width:74ch;}
p:last-child{margin-bottom:0;}

ol,ul{margin:0 0 3.4mm;padding-left:0;list-style:none;counter-reset:step;max-width:74ch;}
ol li{counter-increment:step;position:relative;padding-left:9mm;margin-bottom:2.6mm;}
ol li::before{
  content:counter(step,decimal-leading-zero);position:absolute;left:0;top:.15em;
  font-family:var(--mono);font-size:8.4pt;color:var(--faint);letter-spacing:.02em;
}
ul li{position:relative;padding-left:5mm;margin-bottom:2mm;}
ul li::before{
  content:'';position:absolute;left:0;top:.62em;width:2.2mm;height:.6pt;background:var(--hairline-2);
}

/* The limits section earns a different ground: it is the part that must not be
   skimmed past, and boxing it is the only place this document raises its voice. */
.caution{
  background:var(--ground-2);border-left:1.6pt solid var(--altered);
  padding:6mm 7mm;margin:6mm 0;break-inside:avoid;
}
.caution h2{margin:0 0 3.5mm;border:0;padding:0;font-size:13.5pt;}
.caution p{max-width:66ch;}
.caution p:last-child{margin-bottom:0;}

/* ---------------------------------------------------------------- verify */

.verify{
  margin-top:10mm;padding:7mm 7mm 6mm;background:var(--panel);
  border:.6pt solid var(--hairline);break-inside:avoid;
}
.verify h3{
  font-size:9pt;font-family:var(--mono);text-transform:uppercase;letter-spacing:.13em;
  color:var(--faint);font-weight:500;margin-bottom:4.5mm;
}
.verify dl{display:grid;grid-template-columns:1fr auto;gap:2.6mm 6mm;align-items:baseline;}
.verify dt{font-size:9.4pt;color:var(--muted);}
.verify dd{font-family:var(--mono);font-size:8.6pt;text-align:right;overflow-wrap:anywhere;}

.sign{
  margin-top:9mm;padding-top:4mm;border-top:.6pt solid var(--hairline);
  display:flex;align-items:center;gap:3mm;color:var(--faint);
  font-family:var(--mono);font-size:8pt;letter-spacing:.02em;
}
.sign svg{opacity:.55;flex:none;}
`;

function page(lang) {
  const c = COPY[lang];
  const md = halves[lang];
  const title = lang === 'es' ? meta.title_es : meta.title_en;
  const lede = lang === 'es' ? meta.description_es : meta.description_en;

  // The limits section is lifted out of the flow and given its own ground.
  const limitsHeading = lang === 'es' ? 'Qué demuestra y qué no' : 'What it proves and what it does not';
  let html = render(md);
  const re = new RegExp(`<h2>${limitsHeading}</h2>([\\s\\S]*?)(?=<h2>)`);
  html = html.replace(
    re,
    (_m, inner) => `<section class="caution"><h2>${limitsHeading}</h2>${inner}</section>`,
  );

  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head>
<body>
  <section class="cover">
    <div class="cover__top">
      ${mark(26)}
      <span class="wordmark">DecentralAmerica</span>
      <span class="kicker">${c.kicker}</span>
    </div>

    <h1>${title}</h1>
    <p class="lede">${lede}</p>
    <span class="ribbon"><i></i>decentralamerica.com/evidencia</span>

    <div class="stats">
      ${c.stats
        .map(([n, l, s]) => `<div class="stat"><b>${n}</b><span>${l}</span><em>${s}</em></div>`)
        .join('')}
    </div>

    <div class="cover__foot"><span>${c.date}</span><span>decentralamerica.com</span></div>
  </section>

  <main class="sheet">
    ${html}

    <section class="verify">
      <h3>${c.verify}</h3>
      <dl>${c.verifyLines.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
    </section>

    <div class="sign">${mark(15)}<span>DecentralAmerica · decentralamerica.com</span></div>
  </main>
</body></html>`;
}

for (const lang of ['es', 'en']) {
  const out = resolve(dirname(resolve(mdArg)), `${basename(mdArg, '.md')}-${lang}.pdf`);
  const tmp = `${out}.html`;
  writeFileSync(tmp, page(lang), 'utf8');
  execFileSync(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--no-pdf-header-footer',
      '--virtual-time-budget=20000',
      `--print-to-pdf=${out}`,
      `file://${tmp}`,
    ],
    { stdio: 'pipe' },
  );
  unlinkSync(tmp);
  process.stdout.write(`${basename(out)} written\n`);
}
