/**
 * cms.mjs — posts published in the Eco CMS, fetched at build time.
 *
 * Imported by build-blog.mjs. Optional: with ECO_CMS_URL or ECO_CMS_KEY unset
 * the site builds from content/blog alone, exactly as before. With both set,
 * any API failure fails the build. Railway then keeps the previous deployment
 * live, which is better than publishing the index with posts missing from it.
 *
 * The key is never printed. Errors name the request path and the status only.
 *
 * ---------------------------------------------------------------------------
 * MAPPING
 * ---------------------------------------------------------------------------
 * The CMS stores one post per language; this site stores one post holding
 * both. Posts are paired by `translationGroupId`, or by `id` when there is
 * none. Spanish is the authored language here, so the `es` post is the
 * primary: its slug is the URL and its fields fill the head. An `en` post in
 * the same group becomes the English version.
 *
 * A group in one language only is shown in that language in both views, and
 * `only` records which, so the page can say so rather than pass it off as a
 * translation. Every CMS post is an artículo.
 *
 * Bodies arrive as HTML the CMS has already sanitized. They are not run
 * through the markdown renderer, which would escape them.
 */

const TIMEOUT_MS = 20_000;
const RETRIES = 2;
const PARALLEL = 4;
const PAGE_SIZE = 50;

const LOCALES = ['es', 'en'];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** `null` means not configured: build without the CMS. */
export function cmsConfig(env = process.env) {
  const url = (env.ECO_CMS_URL ?? '').trim().replace(/\/+$/, '');
  const key = (env.ECO_CMS_KEY ?? '').trim();
  return url && key ? { key, url } : null;
}

/* ----------------------------------------------------------------- fetching */

class CmsError extends Error {}

/** Retries 429, 5xx and network errors; any other answer fails at once. */
async function getJson({ key, url }, path) {
  const fail = (what) =>
    new CmsError(
      `CMS: GET ${url}${path} ${what}. ECO_CMS_URL and ECO_CMS_KEY are set, so the build stops rather than publish without the CMS posts.`,
    );
  for (let attempt = 0; ; attempt++) {
    let reason;
    try {
      const res = await fetch(`${url}${path}`, {
        headers: { accept: 'application/json', authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.ok) {
        return await res.json().catch(() => {
          throw fail('did not answer JSON');
        });
      }
      reason = `answered ${res.status}`;
      if (res.status !== 429 && res.status < 500) throw fail(reason);
    } catch (error) {
      if (error instanceof CmsError) throw error;
      reason = error.name === 'TimeoutError' ? 'timed out' : (error.cause?.code ?? error.message);
    }
    if (attempt === RETRIES) throw fail(`failed after ${RETRIES + 1} attempts (${reason})`);
    await new Promise((done) => setTimeout(done, 500 * (attempt + 1)));
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** Every published post, in every language, with its body. Newest first. */
export async function fetchCmsPosts(config) {
  const summaries = [];
  for (let page = 1; ; page++) {
    const path = `/v1/posts?page=${page}&limit=${PAGE_SIZE}`;
    const body = await getJson(config, path);
    if (!Array.isArray(body?.data) || typeof body.total !== 'number') {
      throw new CmsError(`CMS: GET ${path} answered an unexpected shape.`);
    }
    summaries.push(...body.data);
    if (body.data.length === 0 || page * (body.limit || PAGE_SIZE) >= body.total) break;
  }
  return mapLimit(summaries, PARALLEL, (post) =>
    getJson(
      config,
      `/v1/posts/${encodeURIComponent(post.slug)}?locale=${encodeURIComponent(post.locale)}`,
    ),
  );
}

/* ------------------------------------------------------------------ mapping */

function invalid(post) {
  if (!LOCALES.includes(post?.locale)) return `locale "${post?.locale}" is not es or en`;
  if (!SLUG.test(post.slug ?? '')) return 'slug is not lowercase-hyphenated';
  if (!post.title || typeof post.bodyHtml !== 'string') return 'no title or no body';
  if (!Number.isFinite(Date.parse(post.publishedAt))) return 'no valid publishedAt';
  return null;
}

const absolute = (value) => (typeof value === 'string' && /^https?:\/\//i.test(value) ? value : null);
const iso = (value) => new Date(Date.parse(value)).toISOString();

/**
 * The calendar date in Costa Rica (UTC-6 all year, no daylight saving). The
 * markdown posts carry the date their authors there wrote down, and a post
 * published at eight in the evening should not show tomorrow's.
 */
function calendarDate(value) {
  return new Date(Date.parse(value) - 6 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * The contract says bodies carry no <h1>, and the page's only one is the
 * title. Demoting a stray one keeps a single heading from stopping a deploy.
 */
const demote = (html) => html.replace(/<(\/?)h1(?=[\s>])/gi, '<$1h2');

function sitePost(es, en) {
  const primary = es ?? en;
  const other = primary === es ? en : es;
  const both = (pick) => ({ en: pick(en ?? es), es: pick(es ?? en) });
  // Either language changing changes the page, which carries both.
  const modified = Math.max(
    ...[es, en].filter(Boolean).map((post) => Date.parse(post.modifiedAt ?? post.publishedAt)),
    Date.parse(primary.publishedAt),
  );

  return {
    body: both((post) => demote(post.bodyHtml)),
    cms: {
      author: primary.authorName || other?.authorName || null,
      canonicalUrl: absolute(primary.canonicalUrl),
      // The same article in the other language: its image is still the right one.
      image: absolute(primary.ogImageUrl) ?? absolute(other?.ogImageUrl),
      modifiedAt: new Date(modified).toISOString(),
      only: es && en ? null : primary.locale,
      publishedAt: iso(primary.publishedAt),
      seoDescription: primary.seoDescription || primary.excerpt || '',
      seoTitle: primary.seoTitle || primary.title,
    },
    date: calendarDate(primary.publishedAt),
    description: both((post) => post.excerpt || post.seoDescription || ''),
    slug: primary.slug,
    tags: Array.isArray(primary.tagSlugs) ? primary.tagSlugs : [],
    title: both((post) => post.title),
    type: 'articulo',
  };
}

/**
 * CMS detail posts -> the site's Post shape, newest first. `taken` holds the
 * slugs already published under /publicaciones/; a CMS post that would land on
 * one is skipped with a warning, never written over it. Between two CMS posts
 * the older keeps the URL, since it is the one already live.
 */
export function toSitePosts(details, taken = []) {
  const warnings = [];
  const groups = new Map();

  for (const post of details) {
    const problem = invalid(post);
    if (problem) {
      warnings.push(`skipped "${post?.slug}": ${problem}.`);
      continue;
    }
    const id = post.translationGroupId || post.id;
    const group = groups.get(id) ?? {};
    if (group[post.locale]) {
      warnings.push(`skipped "${post.slug}": a second ${post.locale} post in its translation group.`);
      continue;
    }
    group[post.locale] = post;
    groups.set(id, group);
  }

  const used = new Set(taken);
  const posts = [];
  const oldestFirst = [...groups.values()].sort(
    (a, b) => Date.parse((a.es ?? a.en).publishedAt) - Date.parse((b.es ?? b.en).publishedAt),
  );
  for (const { es, en } of oldestFirst) {
    const slug = (es ?? en).slug;
    if (used.has(slug)) {
      warnings.push(`skipped "${slug}": /publicaciones/${slug} is already taken.`);
      continue;
    }
    used.add(slug);
    posts.push(sitePost(es, en));
  }

  return { posts: posts.reverse(), warnings };
}
