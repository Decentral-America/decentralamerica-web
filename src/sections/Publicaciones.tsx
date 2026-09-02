import { Container, Eyebrow, Reveal } from '@/components/primitives';
import { BLOG_PATH, postPath, recentPosts, TYPE_LABEL_ONE } from '@/lib/blog';
import { useT } from '@/lib/i18n';

/**
 * Three lines near the bottom of a long page. Anything more here competes with
 * the sections above it, and the index is one click away.
 */
export function PublicacionesTeaser() {
  const t = useT();
  const posts = recentPosts(3);
  if (posts.length === 0) return null;

  return (
    <section className="py-24 sm:py-32" id="publicaciones">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <Eyebrow>{t({ en: 'Publications', es: 'Publicaciones' })}</Eyebrow>
            <a
              className="eyebrow text-faint transition-colors duration-300 hover:text-ink"
              href={BLOG_PATH}
            >
              {t({ en: 'All publications →', es: 'Todas las publicaciones →' })}
            </a>
          </div>

          <ul className="mt-8">
            {posts.map((post) => (
              <li className="rule" key={post.slug}>
                <a
                  className="group grid gap-x-6 gap-y-1.5 py-5 sm:grid-cols-[6.5rem_7rem_1fr] sm:items-baseline sm:py-6"
                  href={postPath(post.slug)}
                >
                  <time className="mono-data text-faint" dateTime={post.date}>
                    {post.date}
                  </time>
                  <span className="eyebrow">{t(TYPE_LABEL_ONE[post.type])}</span>
                  <span className="text-[1.0625rem] leading-snug tracking-[-0.014em] underline decoration-transparent underline-offset-[5px] transition-[text-decoration-color] duration-300 group-hover:decoration-hairline-2 sm:text-[1.125rem]">
                    {t(post.title)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
