import { useEffect, useState } from 'react';
import { ShareButton } from '@/components/PageExtras';
import { Container, Reveal } from '@/components/primitives';
import {
  BLOG_PATH,
  findPost,
  formatLongDate,
  ONLY_IN,
  slugFromPath,
  TYPE_LABEL_ONE,
  TYPE_NOTE,
  untranslated,
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
 * CMS bodies are written in an editor, not in this repository's markdown, so
 * they carry what the renderer leaves out on purpose: images, tables, embeds
 * and the CMS's own blocks. Styled the same way as PROSE, from the outside,
 * in the site's neutrals; the one colour stays reserved for confirmed state.
 * Warning and important callouts get an ink rule on the left, like the
 * blockquote, because a warning has to read as more than a grey box.
 */
const CMS_PROSE = [
  '[&_[id]]:scroll-mt-24',
  '[&_:is(h5,h6)]:mt-8 [&_:is(h5,h6)]:font-medium',
  '[&_figure]:my-10 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl',
  '[&_figcaption]:mt-3 [&_figcaption]:text-[0.875rem] [&_figcaption]:leading-[1.5] [&_figcaption]:text-faint',
  '[&_table]:mt-8 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-[0.9375rem] [&_table]:leading-[1.5]',
  '[&_th]:eyebrow [&_th]:py-2.5 [&_th]:pr-6 [&_th]:text-left [&_th]:align-bottom',
  '[&_td]:border-t [&_td]:border-hairline [&_td]:py-2.5 [&_td]:pr-6 [&_td]:align-top',
  '[&_.eco-toc]:mb-12 [&_.eco-toc]:rounded-xl [&_.eco-toc]:bg-ground-2 [&_.eco-toc]:px-6 [&_.eco-toc]:py-5 [&_.eco-toc-title]:eyebrow',
  '[&_.eco-toc_ol]:mt-3 [&_.eco-toc_ol]:list-none [&_.eco-toc_ol]:pl-0 [&_.eco-toc_li]:mt-1.5 [&_.eco-toc_li]:pl-0 [&_.eco-toc_.eco-toc-level-3]:pl-4 [&_.eco-toc_.eco-toc-level-4]:pl-8',
  '[&_.eco-callout]:my-10 [&_.eco-callout]:rounded-xl [&_.eco-callout]:bg-ground-2 [&_.eco-callout]:px-6 [&_.eco-callout]:py-5 [&_.eco-callout-title]:eyebrow [&_.eco-callout_p+p]:mt-2',
  '[&_.eco-callout-warning]:shadow-[inset_2px_0_0_var(--color-ink)] [&_.eco-callout-important]:shadow-[inset_2px_0_0_var(--color-ink)]',
  '[&_.eco-cta]:card [&_.eco-cta]:my-10 [&_.eco-cta]:px-6 [&_.eco-cta]:py-5 [&_.eco-cta_a]:font-medium [&_.eco-cta_a]:decoration-ink',
  '[&_.eco-faq]:mt-14 [&_.eco-faq_h3]:mt-8 [&_.eco-faq_h3]:mb-0 [&_.eco-faq_h3+p]:mt-2 [&_.eco-faq_p]:text-muted',
  '[&_.eco-embed]:my-10 [&_.eco-embed]:aspect-video [&_.eco-embed]:overflow-hidden [&_.eco-embed]:rounded-xl [&_.eco-embed]:bg-ground-2 [&_.eco-embed_iframe]:size-full [&_.eco-embed_iframe]:border-0',
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

  // Set when the post exists in one language only and it is not the reader's.
  const shown = untranslated(post, lang) ?? undefined;

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
              {shown && (
                <span className="eyebrow rounded-full bg-ground-2 px-2.5 py-1 text-faint">
                  {t(ONLY_IN[shown])}
                </span>
              )}
              <time dateTime={post.date}>{formatLongDate(post.date, lang)}</time>
            </p>

            <h1 className="display-3 mt-5" lang={shown}>
              {t(post.title)}
            </h1>
            <p className="lede mt-6" lang={shown}>
              {t(post.description)}
            </p>
            <div className="rule mt-12 sm:mt-14" />
          </Reveal>

          {post.cms ? (
            <Reveal as="div" className={`mt-12 sm:mt-14 ${PROSE} ${CMS_PROSE}`} delay={70}>
              {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CMS bodies
                  are sanitized by the CMS before its API serves them, and are
                  fetched at build time by scripts/cms.mjs, never from the reader. */}
              <div dangerouslySetInnerHTML={{ __html: t(post.body) }} lang={shown} />
            </Reveal>
          ) : (
            <Reveal as="div" className={`mt-12 sm:mt-14 ${PROSE}`} delay={70}>
              {/* biome-ignore lint/security/noDangerouslySetInnerHtml: the HTML is
                  produced at build time by scripts/build-blog.mjs from files in
                  this repository, and every text node is escaped there. */}
              <div dangerouslySetInnerHTML={{ __html: t(post.body) }} />
            </Reveal>
          )}

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
            <div className="flex flex-wrap items-center gap-x-8">
              <BackLink label={t({ en: 'All publications', es: 'Todas las publicaciones' })} />
              <ShareButton title={t(post.title)} />
            </div>
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
