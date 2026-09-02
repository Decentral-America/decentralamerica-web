import { GENERATED_POSTS } from '@/lib/blog-generated';
import type { Lang, T } from '@/lib/i18n';

/**
 * The publications engine. `blog-generated.ts` is written by
 * scripts/build-blog.mjs from content/blog/*.md; everything here is the shape
 * that file must satisfy plus the helpers the three views share.
 *
 * The type split is the point of the section. A hallazgo is not an essay with a
 * different tag on it: it is a specific thing an instrument detected, produced
 * by the registry rather than written from scratch. Keeping the three apart is
 * what stops the section reading as a company blog.
 */

export type PostType = 'hallazgo' | 'articulo' | 'informe';

export type Post = {
  /** Rendered HTML, one body per language. Escaped at build time. */
  body: T;
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  description: T;
  slug: string;
  tags: readonly string[];
  title: T;
  type: PostType;
};

/**
 * Filter order, and the order the types are explained in. Hallazgos come first
 * because they are the ones the instruments generate continuously.
 */
export const POST_TYPES: readonly PostType[] = ['hallazgo', 'articulo', 'informe'];

/** Plural, for the filter controls. */
export const TYPE_LABEL: Record<PostType, T> = {
  articulo: { en: 'Articles', es: 'Artículos' },
  hallazgo: { en: 'Findings', es: 'Hallazgos' },
  informe: { en: 'Reports', es: 'Informes' },
};

/** Singular, for the chip on one entry. */
export const TYPE_LABEL_ONE: Record<PostType, T> = {
  articulo: { en: 'Article', es: 'Artículo' },
  hallazgo: { en: 'Finding', es: 'Hallazgo' },
  informe: { en: 'Report', es: 'Informe' },
};

/** One line each, for the index header. */
export const TYPE_NOTE: Record<PostType, T> = {
  articulo: { en: 'A position, argued.', es: 'Una posición, argumentada.' },
  hallazgo: {
    en: 'Something an instrument detected, dated.',
    es: 'Algo que un instrumento detectó, con fecha.',
  },
  informe: { en: 'Periodic, on a fixed format.', es: 'Periódico, en formato fijo.' },
};

export const BLOG_PATH = '/publicaciones';
export const TYPE_QUERY_KEY = 'tipo';

/** Sorted newest first by the build script. */
export const POSTS: readonly Post[] = GENERATED_POSTS;

/** Every post URL, for whatever enumerates routes to prerender. */
export const POST_PATHS: readonly string[] = POSTS.map((post) => `${BLOG_PATH}/${post.slug}`);

export function postPath(slug: string): string {
  return `${BLOG_PATH}/${slug}`;
}

export function isPostType(value: unknown): value is PostType {
  return typeof value === 'string' && (POST_TYPES as readonly string[]).includes(value);
}

export function findPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}

/** `null` means every type. */
export function postsByType(type: PostType | null): readonly Post[] {
  return type === null ? POSTS : POSTS.filter((post) => post.type === type);
}

export function countByType(type: PostType): number {
  return POSTS.reduce((total, post) => (post.type === type ? total + 1 : total), 0);
}

export function recentPosts(count: number): readonly Post[] {
  return POSTS.slice(0, count);
}

/** `/publicaciones/algo` -> `algo`. Anything else is not a post URL. */
export function slugFromPath(path: string): string | null {
  const prefix = `${BLOG_PATH}/`;
  if (!path.startsWith(prefix)) return null;
  const slug = path.slice(prefix.length).replace(/\/+$/, '');
  return slug.length > 0 ? slug : null;
}

/** Reads the filter out of a `location.search` string. */
export function parseTypeParam(search: string): PostType | null {
  const value = new URLSearchParams(search).get(TYPE_QUERY_KEY);
  return isPostType(value) ? value : null;
}

/** The linkable URL for a filtered view. `null` is the unfiltered index. */
export function filterHref(type: PostType | null): string {
  return type === null ? BLOG_PATH : `${BLOG_PATH}?${TYPE_QUERY_KEY}=${type}`;
}

const MONTHS: Record<Lang, readonly string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
};

/**
 * Written out by hand rather than through Intl. The page is prerendered in Node
 * and hydrated in a browser, and the two do not always ship the same ICU data —
 * a date that formats differently on each side is a hydration mismatch.
 */
export function formatLongDate(iso: string, lang: Lang): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  const name = MONTHS[lang][Number(month) - 1];
  if (!name) return iso;
  const dayNumber = Number(day);
  return lang === 'es' ? `${dayNumber} de ${name} de ${year}` : `${dayNumber} ${name} ${year}`;
}
