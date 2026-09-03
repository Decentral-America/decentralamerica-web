#!/usr/bin/env node
/**
 * Share cards, one per route, drawn at 1200x630.
 *
 *   node scripts/og.mjs
 *
 * A link preview is the only part of this site most people will ever see, so the
 * card follows the same rules as the page: the warm ground, the mark, one
 * enormous line of human language, and a small monospace line under a hairline.
 * No gradient, no glass, no colour. `--color-confirmed` is not here on purpose;
 * it means a record is confirmed and would be decoration on a share card.
 *
 * Headlines are read out of src/lib/seo.ts rather than restated, so a card
 * cannot drift from the page it points at. A route whose title cannot be found
 * is an error: a blank card is worse than no card, because it still gets shared.
 *
 * Rendered with headless Chrome because it is already on the machine and the
 * fonts are the identity — measuring them with anything else would be drawing a
 * different brand. The faces are the static woff2 files, not a variable font,
 * which Chrome silently drops in this mode.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/og');
const PUB = join(ROOT, 'public');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** The home card says what the site is; the rest say which page you are opening. */
const HOME = {
  name: 'home',
  headline: 'La memoria pública de América Latina.',
  foot: 'decentralamerica.com',
};

/** `Nodo Público — DecentralAmerica` -> `Nodo Público` */
function routeHeadlines() {
  const src = readFileSync(join(ROOT, 'src/lib/seo.ts'), 'utf8');
  const block = src.slice(src.indexOf('export const ROUTE_META'));
  const out = [];
  for (const m of block.matchAll(/'(\/[a-z-]*)': \{/g)) {
    const seg = block.slice(m.index + m[0].length, m.index + m[0].length + 900);
    const t = seg.match(/title: \{[^}]*es:\s*'((?:[^'\\]|\\.)*)'/s);
    if (!t) throw new Error(`no Spanish title for ${m[1]} in seo.ts`);
    out.push({
      name: m[1].replace(/^\//, '') || 'home',
      headline: t[1].replace(/\s*—\s*DecentralAmerica\s*$/, ''),
      foot: `decentralamerica.com${m[1]}`,
    });
  }
  if (!out.length) throw new Error('ROUTE_META parsed to nothing; the shape changed');
  return out;
}

const face = (family, file, weight) =>
  `@font-face{font-family:'${family}';src:url('file://${join(PUB, 'fonts', file)}') format('woff2');font-weight:${weight};font-display:block}`;

function html({ headline, foot }) {
  const mark = readFileSync(join(PUB, 'brand/decentralamerica-mark.svg'), 'utf8');
  // Long headlines shrink rather than wrap to four lines; the card is fixed and
  // overflow would crop a word off the bottom edge.
  const size = headline.length > 34 ? 72 : 88;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${face('Satoshi', 'Satoshi-Bold.woff2', 700)}
${face('Satoshi', 'Satoshi-Medium.woff2', 500)}
@font-face{font-family:'Plex';src:url('file://${join(PUB, 'home/fonts/ibm-plex-mono-latin-500-normal.woff2')}') format('woff2');font-weight:500;font-display:block}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#fcfcfa;color:#0a0a0b;
  font-family:'Satoshi';display:flex;flex-direction:column;justify-content:space-between;padding:76px 84px}
.row{display:flex;align-items:center;justify-content:space-between;gap:64px;flex:1}
.mark{width:236px;height:236px;flex:none}
.mark svg{width:100%;height:100%;display:block}
h1{font-size:${size}px;font-weight:700;line-height:1.04;letter-spacing:-0.035em;max-width:14ch}
.rule{height:1px;background:rgba(10,10,11,0.09);margin-bottom:22px}
.foot{display:flex;justify-content:space-between;align-items:baseline;
  font-family:'Plex';font-weight:500;font-size:20px;letter-spacing:0.02em;color:rgba(10,10,11,0.62)}
.foot b{color:#0a0a0b;font-weight:500}
</style></head><body>
<div class="row"><h1>${headline}</h1><div class="mark">${mark}</div></div>
<div><div class="rule"></div><div class="foot"><b>${foot}</b><span>Registro público permanente</span></div></div>
</body></html>`;
}

rmSync(OUT, { force: true, recursive: true });
mkdirSync(OUT, { recursive: true });
const tmp = join(ROOT, '.og-tmp');
mkdirSync(tmp, { recursive: true });

const cards = [HOME, ...routeHeadlines()];
for (const card of cards) {
  const page = join(tmp, `${card.name}.html`);
  writeFileSync(page, html(card));
  execFileSync(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      `--screenshot=${join(OUT, `${card.name}.png`)}`,
      `file://${page}`,
    ],
    { stdio: ['ignore', 'ignore', 'ignore'] },
  );
  console.log(`  og/${card.name}.png   ${card.headline}`);
}
rmSync(tmp, { force: true, recursive: true });
console.log(`\n${cards.length} share cards drawn.`);
