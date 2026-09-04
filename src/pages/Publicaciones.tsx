import { type MouseEvent, type ReactNode, useCallback, useEffect, useState } from 'react';
import { Container, Eyebrow, Reveal } from '@/components/primitives';
import {
  BLOG_PATH,
  countByType,
  filterHref,
  POST_TYPES,
  type PostType,
  parseTypeParam,
  postPath,
  postsByType,
  TYPE_LABEL,
  TYPE_LABEL_ONE,
  TYPE_NOTE,
} from '@/lib/blog';
import { useT } from '@/lib/i18n';

const CHIP = 'eyebrow rounded-full bg-ground-2 px-2.5 py-1 text-faint';

export default function Publicaciones() {
  const t = useT();
  const [type, setType] = useState<PostType | null>(null);

  /**
   * The filter lives in the query string so a filtered view is a link someone
   * can send. It is read after mount rather than during render: the prerender
   * has no location, so reading one on the first client render would not match
   * the HTML it is hydrating. A deep link resolves one frame later.
   */
  useEffect(() => {
    const sync = () => setType(parseTypeParam(window.location.search));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  /**
   * Real anchors, so the filters can be copied, opened in a new tab and reached
   * by keyboard. The click is handled here instead: the shared router only
   * navigates across pathnames, and these differ only in the query string.
   * replaceState rather than push, because the back button should leave the
   * index, not walk back through every filter that was tried.
   */
  const select = useCallback((event: MouseEvent<HTMLAnchorElement>, next: PostType | null) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    setType(next);
    window.history.replaceState({}, '', filterHref(next));
  }, []);

  const posts = postsByType(type);

  return (
    <div>
      <Container>
        <Reveal as="header" className="pt-28 pb-14 sm:pt-36 sm:pb-16">
          <Eyebrow>DecentralAmerica</Eyebrow>
          <h1 className="display-2 mt-5">{t({ en: 'Publications', es: 'Publicaciones' })}</h1>
          <p className="lede mt-6 max-w-[38rem]">
            {t({
              en: 'Three kinds of thing. The findings the instruments produce, the articles that state a position, and the periodic transparency reports.',
              es: 'Tres cosas distintas. Los hallazgos que producen los instrumentos, los artículos que fijan una posición y los informes periódicos de transparencia.',
            })}
          </p>
        </Reveal>

        <nav aria-label={t({ en: 'Filter by type', es: 'Filtrar por tipo' })}>
          <ul className="flex flex-wrap items-center gap-2">
            <li>
              <FilterLink active={type === null} onSelect={select} value={null}>
                {t({ en: 'All', es: 'Todas' })}
              </FilterLink>
            </li>
            {POST_TYPES.map((value) => (
              <li key={value}>
                <FilterLink active={type === value} onSelect={select} value={value}>
                  {t(TYPE_LABEL[value])}
                  <span className="ml-2 opacity-60">{countByType(value)}</span>
                </FilterLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* The note only appears once a type is chosen, so the taxonomy is
            explained where someone is actually asking about it. */}
        {/* min-h, not h: the line is reserved so choosing a filter does not
            shift the list, but it still has to be allowed to wrap on a phone. */}
        <p aria-live="polite" className="mt-5 min-h-5 text-[0.9375rem] text-muted">
          {type === null ? '' : t(TYPE_NOTE[type])}
        </p>

        <ul className="mt-8 pb-28 sm:pb-36">
          {posts.map((post, index) => (
            <li className="rule" key={post.slug}>
              <Reveal
                as="article"
                className="group grid gap-x-10 gap-y-3 py-8 sm:grid-cols-[8.5rem_1fr] sm:py-10"
                delay={Math.min(index, 4) * 45}
              >
                <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3">
                  <time className="mono-data text-faint" dateTime={post.date}>
                    {post.date}
                  </time>
                  <span className={CHIP}>{t(TYPE_LABEL_ONE[post.type])}</span>
                </div>
                <div>
                  <h2 className="text-[1.375rem] leading-[1.15] font-bold tracking-[-0.024em] sm:text-[1.625rem]">
                    <a
                      className="underline decoration-transparent decoration-2 underline-offset-[6px] transition-[text-decoration-color] duration-300 group-hover:decoration-hairline-2"
                      href={postPath(post.slug)}
                    >
                      {t(post.title)}
                    </a>
                  </h2>
                  <p className="mt-3 max-w-[42rem] text-[0.9375rem] leading-[1.65] text-muted sm:text-base">
                    {t(post.description)}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
          {posts.length === 0 && (
            <li className="rule py-12 text-muted">
              {t({
                en: 'This type has nothing in it yet. Try another.',
                es: 'Este tipo todavía no tiene nada. Probá con otro.',
              })}
            </li>
          )}
        </ul>
      </Container>
    </div>
  );
}

function FilterLink({
  active,
  children,
  onSelect,
  value,
}: {
  active: boolean;
  children: ReactNode;
  onSelect: (event: MouseEvent<HTMLAnchorElement>, value: PostType | null) => void;
  value: PostType | null;
}) {
  return (
    <a
      aria-current={active ? 'true' : undefined}
      className={`eyebrow inline-flex items-center rounded-full px-3.5 py-2 transition-colors duration-300 ${
        active ? 'bg-ink text-ground' : 'bg-ground-2 text-faint hover:bg-hairline hover:text-ink'
      }`}
      href={value === null ? BLOG_PATH : filterHref(value)}
      onClick={(event) => onSelect(event, value)}
    >
      {children}
    </a>
  );
}
