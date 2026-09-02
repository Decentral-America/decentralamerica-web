import { useEffect, useState } from 'react';
import { Container, Reveal } from '@/components/primitives';
import {
  BLOG_PATH,
  findPost,
  formatLongDate,
  slugFromPath,
  TYPE_LABEL_ONE,
  TYPE_NOTE,
} from '@/lib/blog';
import { useLang, useT } from '@/lib/i18n';

/**
 * Scoped prose. A typography plugin brings a whole opinion about type with it,
 * and the whole point of this site is that the type is the identity. These are
 * descendant variants on the article, so the rendered HTML is styled without a
 * single class reaching it and without touching the global stylesheet.
 */
const PROSE = [
  'text-[1.0625rem] leading-[1.75]',
  '[&_p]:mt-6 [&_p:first-child]:mt-0',
  '[&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:text-[1.375rem] [&_h2]:leading-[1.2] [&_h2]:font-bold [&_h2]:tracking-[-0.022em] [&_h2:first-child]:mt-0',
  '[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-[1.125rem] [&_h3]:font-medium [&_h3]:tracking-[-0.014em]',
  '[&_h4]:mt-8 [&_h4]:mb-2 [&_h4]:font-medium',
  '[&_ul]:mt-6 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mt-6 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:mt-2.5 [&_li]:pl-1.5 [&_li::marker]:text-faint',
  '[&_blockquote]:my-10 [&_blockquote]:border-l [&_blockquote]:border-ink [&_blockquote]:py-1 [&_blockquote]:pl-6 [&_blockquote]:text-[1.1875rem] [&_blockquote]:leading-[1.5] [&_blockquote]:tracking-[-0.012em] [&_blockquote]:text-muted',
  '[&_a]:underline [&_a]:decoration-hairline-2 [&_a]:underline-offset-[3px] [&_a]:transition-[text-decoration-color] [&_a]:duration-300 [&_a:hover]:decoration-ink',
  '[&_strong]:font-medium',
  '[&_code]:rounded-[4px] [&_code]:bg-ground-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]',
  '[&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-ground-2 [&_pre]:p-5 [&_pre]:text-[0.8125rem] [&_pre]:leading-[1.6]',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[1em]',
].join(' ');

/**
 * `slug` is the contract: the router knows the path, and passing it keeps the
 * first render correct on the server. Without it the slug is read from the
 * location after mount, which works in the browser but prerenders empty.
 */
export default function Post({ slug }: { slug?: string }) {
  const t = useT();
  const { lang } = useLang();
  const [fromPath, setFromPath] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (slug !== undefined) return;
    setFromPath(slugFromPath(window.location.pathname));
  }, [slug]);

  const active = slug ?? fromPath;
  const post = active === undefined || active === null ? undefined : findPost(active);

  // The slug has not been resolved yet. Reserve the height rather than flashing
  // a "not found" that is about to be replaced.
  if (active === undefined) return <div aria-busy="true" className="min-h-[60svh]" />;

  if (!post) {
    return (
      <div>
        <Container>
          <div className="mx-auto max-w-[35rem] pt-28 pb-28 sm:pt-36 sm:pb-36">
            <h1 className="display-3">
              {t({ en: 'This publication does not exist', es: 'Esta publicación no existe' })}
            </h1>
            <p className="lede mt-5">
              {t({
                en: 'The address may have changed. The full index lists everything published.',
                es: 'La dirección pudo haber cambiado. El índice completo lista todo lo publicado.',
              })}
            </p>
            <BackLink label={t({ en: 'All publications', es: 'Todas las publicaciones' })} />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div>
      <Container>
        <article className="mx-auto max-w-[35rem] pt-28 pb-28 sm:pt-36 sm:pb-36">
          <Reveal as="header">
            <a
              className="eyebrow inline-flex items-center gap-2 text-faint transition-colors duration-300 hover:text-ink"
              href={BLOG_PATH}
            >
              <span aria-hidden="true">←</span>
              {t({ en: 'Publications', es: 'Publicaciones' })}
            </a>

            <p className="mono-data mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-faint sm:mt-14">
              <span className="eyebrow rounded-full bg-ground-2 px-2.5 py-1 text-faint">
                {t(TYPE_LABEL_ONE[post.type])}
              </span>
              <time dateTime={post.date}>{formatLongDate(post.date, lang)}</time>
            </p>

            <h1 className="display-3 mt-5">{t(post.title)}</h1>
            <p className="lede mt-6">{t(post.description)}</p>
            <div className="rule mt-12 sm:mt-14" />
          </Reveal>

          <Reveal as="div" className={`mt-12 sm:mt-14 ${PROSE}`} delay={70}>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: the HTML is
                produced at build time by scripts/build-blog.mjs from files in
                this repository, and every text node is escaped there. */}
            <div dangerouslySetInnerHTML={{ __html: t(post.body) }} />
          </Reveal>

          <footer className="rule mt-16 pt-8">
            <p className="text-[0.9375rem] text-muted">{t(TYPE_NOTE[post.type])}</p>
            {post.tags.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li className="eyebrow rounded-full bg-ground-2 px-2.5 py-1 text-faint" key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            <BackLink label={t({ en: 'All publications', es: 'Todas las publicaciones' })} />
          </footer>
        </article>
      </Container>
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <a
      className="eyebrow mt-8 inline-flex items-center gap-2 text-faint transition-colors duration-300 hover:text-ink"
      href={BLOG_PATH}
    >
      <span aria-hidden="true">←</span>
      {label}
    </a>
  );
}
