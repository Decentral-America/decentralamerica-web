/**
 * Tests for scripts/cms.mjs. Node's own runner, no dependencies: `pnpm test`.
 */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { cmsConfig, fetchCmsPosts, toSitePosts } from './cms.mjs';

const KEY = 'eco_pk_test_local';

function post(fields) {
  return {
    authorName: null,
    bodyHtml: '<p>Body.</p>',
    canonicalUrl: null,
    excerpt: 'Excerpt.',
    id: fields.slug,
    modifiedAt: null,
    ogImageUrl: null,
    publishedAt: '2026-10-20T14:00:00.000Z',
    seoDescription: null,
    seoTitle: null,
    tagSlugs: [],
    title: `Title ${fields.slug}`,
    translationGroupId: null,
    ...fields,
  };
}

test('not configured unless both variables are set', () => {
  assert.equal(cmsConfig({}), null);
  assert.equal(cmsConfig({ ECO_CMS_URL: 'https://cms.example' }), null);
  assert.equal(cmsConfig({ ECO_CMS_KEY: KEY, ECO_CMS_URL: ' ' }), null);
  assert.deepEqual(cmsConfig({ ECO_CMS_KEY: KEY, ECO_CMS_URL: 'https://cms.example/' }), {
    key: KEY,
    url: 'https://cms.example',
  });
});

test('pairs translations with Spanish as the primary', () => {
  const group = 'g1';
  const { posts, warnings } = toSitePosts([
    post({ locale: 'en', modifiedAt: '2026-10-23T09:00:00.000Z', slug: 'en-slug', translationGroupId: group }),
    post({ locale: 'es', publishedAt: '2026-10-21T14:00:00.000Z', slug: 'es-slug', translationGroupId: group }),
  ]);
  assert.deepEqual(warnings, []);
  assert.equal(posts.length, 1);
  const [only] = posts;
  assert.equal(only.slug, 'es-slug');
  assert.equal(only.type, 'articulo');
  assert.deepEqual(only.title, { en: 'Title en-slug', es: 'Title es-slug' });
  assert.equal(only.cms.only, null);
  assert.equal(only.cms.seoTitle, 'Title es-slug');
  // An edit to the English version is a change to the page, which carries both.
  assert.equal(only.cms.modifiedAt, '2026-10-23T09:00:00.000Z');
});

test('a post in one language fills both views and says which', () => {
  const { posts } = toSitePosts([post({ locale: 'en', slug: 'english-only' })]);
  assert.equal(posts[0].cms.only, 'en');
  assert.equal(posts[0].title.es, posts[0].title.en);
  assert.equal(posts[0].body.es, posts[0].body.en);
});

test('skips collisions and bad posts, never overwrites', () => {
  const { posts, warnings } = toSitePosts(
    [
      post({ locale: 'es', slug: 'taken' }),
      post({ locale: 'pt', slug: 'portugues' }),
      post({ locale: 'es', slug: '../escape' }),
      post({ id: 'newer', locale: 'en', publishedAt: '2026-10-25T00:00:00.000Z', slug: 'twice' }),
      post({ id: 'older', locale: 'es', publishedAt: '2026-10-01T00:00:00.000Z', slug: 'twice' }),
    ],
    ['taken'],
  );
  assert.deepEqual(
    posts.map((p) => [p.slug, p.cms.publishedAt]),
    [['twice', '2026-10-01T00:00:00.000Z']],
  );
  assert.equal(warnings.length, 4);
});

test('newest first, Costa Rica calendar date, no h1 in a body', () => {
  const { posts } = toSitePosts([
    post({ bodyHtml: '<h1 id="x">Stray</h1><p>Body.</p>', locale: 'es', slug: 'a' }),
    post({ locale: 'es', publishedAt: '2026-10-22T03:00:00.000Z', slug: 'b' }),
  ]);
  assert.deepEqual(
    posts.map((p) => p.slug),
    ['b', 'a'],
  );
  // 03:00 UTC is still the evening before in Costa Rica.
  assert.equal(posts[0].date, '2026-10-21');
  assert.equal(posts[1].body.es, '<h2 id="x">Stray</h2><p>Body.</p>');
});

async function serve(handler) {
  const server = createServer(handler);
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  return { close: () => server.close(), url: `http://127.0.0.1:${server.address().port}` };
}

test('pages through the list, retries a 5xx, fetches each body by locale', async () => {
  const all = [post({ locale: 'es', slug: 'uno' }), post({ locale: 'en', slug: 'two' })];
  let failedOnce = false;
  const seen = [];
  const { close, url } = await serve((req, res) => {
    assert.equal(req.headers.authorization, `Bearer ${KEY}`);
    const at = new URL(req.url, 'http://x');
    seen.push(`${at.pathname}${at.search}`);
    if (!failedOnce) {
      failedOnce = true;
      res.writeHead(503).end();
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    if (at.pathname === '/v1/posts') {
      const page = Number(at.searchParams.get('page'));
      res.end(JSON.stringify({ data: [all[page - 1]], limit: 1, page, total: all.length }));
      return;
    }
    res.end(JSON.stringify(all.find((p) => at.pathname.endsWith(p.slug))));
  });
  try {
    const details = await fetchCmsPosts({ key: KEY, url });
    assert.deepEqual(
      details.map((p) => p.slug),
      ['uno', 'two'],
    );
    assert.ok(seen.includes('/v1/posts?page=2&limit=50'));
    assert.ok(seen.includes('/v1/posts/two?locale=en'));
  } finally {
    close();
  }
});

test('fails at once on a 401, without printing the key', async () => {
  const { close, url } = await serve((_req, res) => res.writeHead(401).end());
  try {
    await assert.rejects(fetchCmsPosts({ key: KEY, url }), (error) => {
      assert.match(error.message, /answered 401/);
      assert.ok(!error.message.includes(KEY));
      return true;
    });
  } finally {
    close();
  }
});
