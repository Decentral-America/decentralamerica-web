/**
 * build-blog.mjs — content/blog/*.md  ->  src/lib/blog-generated.ts
 *
 * Plain Node, no dependencies. Run with `pnpm blog`, and automatically as the
 * first step of `pnpm build`.
 *
 * ---------------------------------------------------------------------------
 * FILE FORMAT
 * ---------------------------------------------------------------------------
 * One file per post, both languages inside it. Two files per post drift: a
 * correction lands in one language and not in the other, and nothing catches
 * it. Keeping the pair adjacent makes the gap visible while editing.
 *
 *     ---
 *     title_es: Cinco republicaciones
 *     title_en: Five republications
 *     description_es: Una línea.
 *     description_en: One line.
 *     date: 2026-08-27
 *     type: hallazgo
 *     slug: cinco-republicaciones
 *     tags: ancla, integridad
 *     ---
 *
 *     --- es ---
 *
 *     ## Qué se observó
 *
 *     Texto.
 *
 *     --- en ---
 *
 *     ## What was observed
 *
 *     Text.
 *
 * Front matter is `key: value`, split at the first colon, so a value may itself
 * contain colons. `tags` is a comma-separated list and is optional; every other
 * key is required. `type` is one of hallazgo | articulo | informe.
 *
 * The body is split on the fence markers `--- es ---` and `--- en ---`. Spanish
 * is authored and English is the translation, so `es` is written first, but the
 * order in the file does not matter.
 *
 * ---------------------------------------------------------------------------
 * RENDERER
 * ---------------------------------------------------------------------------
 * Deliberately small: headings, paragraphs, bold, italic, inline code, fenced
 * code, links, blockquotes, ordered and unordered lists. Nothing else. A post
 * that needs more than this is a post that should be rewritten. Tables in
 * particular are absent on purpose — a table that has to be scrolled sideways
 * on a phone belongs in the registry, not in prose about it.
 *
 * Every text node is escaped. This runs at build time over files committed to
 * this repository, so nothing hostile is expected to reach it, but a renderer
 * that is only safe because of where its input came from stops being safe the
 * first time the input comes from somewhere else.
 *
 * A level-1 heading in a body is a build error: the post page's <h1> is the
 * post title, and a second one on the page breaks the document outline.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = join(ROOT, 'content', 'blog');
const OUT_FILE = join(ROOT, 'src', 'lib', 'blog-generated.ts');

const TYPES = ['hallazgo', 'articulo', 'informe'];
const REQUIRED = ['title_es', 'title_en', 'description_es', 'description_en', 'date', 'type', 'slug'];

/** Placeholder sentinel. Stripped from every source file on read. */
const NUL = '\u0000';

/* ---------------------------------------------------------------- escaping */

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

/**
 * Only schemes that cannot execute. Anything else is dropped and the link is
 * rendered as its own text, so a bad href degrades to plain prose rather than
 * to a silently broken or dangerous anchor.
 */
function safeHref(raw) {
  const href = raw.trim();
  if (/^https?:\/\//i.test(href)) return href;
  if (/^mailto:\S+$/i.test(href)) return href;
  if (/^[/#]/.test(href)) return href;
  return null;
}

/* ------------------------------------------------------------------ inline */

/**
 * Code spans and links are lifted out before emphasis runs, so an underscore in
 * a URL or an asterisk inside `code` cannot turn into an <em>.
 */
function inline(source) {
  const held = [];
  const hold = (html) => {
    held.push(html);
    return `${NUL}${held.length - 1}${NUL}`;
  };

  let out = source.replace(/`([^`]+)`/g, (_m, code) => hold(`<code>${escapeHtml(code)}</code>`));

  out = out.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (match, text, rawHref) => {
    const href = safeHref(rawHref);
    // A rejected scheme leaves the source text exactly as written, escaped.
    // Silently swapping in just the label would hide the broken link from the
    // person who wrote it.
    if (!href) return hold(escapeHtml(match));
    const label = emphasis(escapeHtml(text));
    const external = /^https?:\/\//i.test(href);
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return hold(`<a href="${escapeHtml(href)}"${attrs}>${label}</a>`);
  });

  out = emphasis(escapeHtml(out));

  // A held fragment can contain further placeholders (inline code inside a link
  // label), so keep restoring until none are left.
  const placeholder = new RegExp(`${NUL}(\\d+)${NUL}`, 'g');
  for (let pass = 0; pass < 8 && out.includes(NUL); pass++) {
    out = out.replace(placeholder, (_m, i) => held[Number(i)] ?? '');
  }
  return out;
}

function emphasis(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '<em>$1</em>');
}

/* ------------------------------------------------------------------ blocks */

const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBER = /^\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?/;
const FENCE = /^```\s*([A-Za-z0-9_+-]*)\s*$/;

function startsBlock(line) {
  return (
    HEADING.test(line) ||
    BULLET.test(line) ||
    NUMBER.test(line) ||
    QUOTE.test(line) ||
    FENCE.test(line)
  );
}

function renderBlocks(lines, file) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    if (line.trim() === '') {
      i++;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? '')) {
        body.push(lines[i] ?? '');
        i++;
      }
      i++; // the closing fence, or the end of the input
      const lang = fence[1] ? ` class="language-${escapeHtml(fence[1])}"` : '';
      out.push(`<pre><code${lang}>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (level === 1) {
        throw new Error(
          `${file}: level-1 heading ("${line.trim()}"). The post title is the page's only <h1> — start body sections at "##".`,
        );
      }
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const body = [];
      while (i < lines.length && QUOTE.test(lines[i] ?? '')) {
        body.push((lines[i] ?? '').replace(QUOTE, ''));
        i++;
      }
      out.push(`<blockquote>${renderBlocks(body, file)}</blockquote>`);
      continue;
    }

    const ordered = NUMBER.test(line) && !BULLET.test(line);
    if (ordered || BULLET.test(line)) {
      const marker = ordered ? NUMBER : BULLET;
      const items = [];
      while (i < lines.length) {
        const current = lines[i] ?? '';
        const item = marker.exec(current);
        if (item) {
          items.push(item[1]);
          i++;
          continue;
        }
        // An indented line continues the item above it.
        if (items.length > 0 && /^\s+\S/.test(current)) {
          items[items.length - 1] += ` ${current.trim()}`;
          i++;
          continue;
        }
        break;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const paragraph = [];
    while (i < lines.length) {
      const current = lines[i] ?? '';
      if (current.trim() === '' || startsBlock(current)) break;
      paragraph.push(current.trim());
      i++;
    }
    out.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }

  return out.join('');
}

function renderMarkdown(markdown, file) {
  return renderBlocks(markdown.replace(/\r\n?/g, '\n').split('\n'), file);
}

/* ------------------------------------------------------------ front matter */

function parseFrontMatter(raw, file) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  if (!match) throw new Error(`${file}: no front matter block at the top of the file.`);

  const fields = {};
  for (const line of match[1].split('\n')) {
    if (line.trim() === '') continue;
    const at = line.indexOf(':');
    if (at === -1) throw new Error(`${file}: front matter line without a key: "${line}"`);
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if (/^".*"$/s.test(value) || /^'.*'$/s.test(value)) value = value.slice(1, -1);
    fields[key] = value;
  }
  return { fields, body: raw.slice(match[0].length) };
}

/** Splits a body on the `--- es ---` / `--- en ---` fence markers. */
function splitLanguages(body, file) {
  const parts = {};
  let current = null;
  const buffer = [];

  const flush = () => {
    if (current) parts[current] = buffer.join('\n').trim();
    buffer.length = 0;
  };

  for (const line of body.split('\n')) {
    const fence = /^---\s*(es|en)\s*---$/.exec(line.trim());
    if (fence) {
      flush();
      current = fence[1];
      continue;
    }
    if (current) buffer.push(line);
  }
  flush();

  for (const lang of ['es', 'en']) {
    if (!parts[lang]) throw new Error(`${file}: missing or empty "--- ${lang} ---" body.`);
  }
  return parts;
}

/* ------------------------------------------------------------------ output */

/** Matches Biome's quote choice, so the generated file needs no reformatting. */
function lit(value) {
  const text = String(value);
  const singles = (text.match(/'/g) ?? []).length;
  const doubles = (text.match(/"/g) ?? []).length;
  const quote = singles > doubles ? '"' : "'";
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replaceAll(quote, `\\${quote}`)
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `${quote}${escaped}${quote}`;
}

/**
 * Always broken across lines. Every pair here holds a title, a description or a
 * whole rendered body, so the single-line form is over Biome's 100 columns in
 * practice and the generated file would fail `biome check` on formatting alone.
 */
function pair(field) {
  return `{\n      en: ${lit(field.en)},\n      es: ${lit(field.es)},\n    }`;
}

function main() {
  const files = readdirSync(SOURCE_DIR)
    .filter((name) => name.endsWith('.md'))
    .sort();

  const posts = [];
  const seen = new Set();

  for (const file of files) {
    const raw = readFileSync(join(SOURCE_DIR, file), 'utf8').replaceAll(NUL, '');
    const { fields, body } = parseFrontMatter(raw, file);

    for (const key of REQUIRED) {
      if (!fields[key]) throw new Error(`${file}: front matter is missing "${key}".`);
    }
    if (!TYPES.includes(fields.type)) {
      throw new Error(`${file}: type "${fields.type}" is not one of ${TYPES.join(', ')}.`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date)) {
      throw new Error(`${file}: date "${fields.date}" is not an ISO calendar date.`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fields.slug)) {
      throw new Error(`${file}: slug "${fields.slug}" is not lowercase-hyphenated.`);
    }
    if (seen.has(fields.slug)) throw new Error(`${file}: duplicate slug "${fields.slug}".`);
    seen.add(fields.slug);

    const bodies = splitLanguages(body, file);
    posts.push({
      body: { en: renderMarkdown(bodies.en, file), es: renderMarkdown(bodies.es, file) },
      date: fields.date,
      description: { en: fields.description_en, es: fields.description_es },
      slug: fields.slug,
      tags: (fields.tags ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      title: { en: fields.title_en, es: fields.title_es },
      type: fields.type,
    });
  }

  // Newest first. The slug breaks ties, so the output is stable across machines.
  posts.sort((a, b) =>
    a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date),
  );

  const entries = posts
    .map(
      (post) => `  {
    body: ${pair(post.body)},
    date: ${lit(post.date)},
    description: ${pair(post.description)},
    slug: ${lit(post.slug)},
    tags: [${post.tags.map(lit).join(', ')}],
    title: ${pair(post.title)},
    type: ${lit(post.type)},
  },`,
    )
    .join('\n');

  const output = `/**
 * Generated by scripts/build-blog.mjs from content/blog/*.md. Do not edit.
 * Run \`pnpm blog\` after changing a post. \`pnpm build\` runs it first.
 */

import type { Post } from '@/lib/blog';

export const GENERATED_POSTS: readonly Post[] = [
${entries}
];
`;

  writeFileSync(OUT_FILE, output, 'utf8');
  process.stdout.write(
    `blog: ${posts.length} post${posts.length === 1 ? '' : 's'} -> src/lib/blog-generated.ts\n`,
  );
}

main();
