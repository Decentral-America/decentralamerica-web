import { useState } from 'react';
import { Container, Eyebrow, Reveal } from '@/components/primitives';
import { PAGE_BRIEFS } from '@/lib/faq';
import { useT } from '@/lib/i18n';

const P = 'text-[1.0625rem] leading-relaxed text-muted sm:text-lg';

/**
 * The three sentences a reader would keep if they read nothing else, placed
 * before the argument rather than after it.
 *
 * It sits above the body deliberately. A reader who arrives from a search result
 * has one question, and making them read four sections to find out whether this
 * page answers it is how a page gets closed.
 */
export function Takeaways({
  cta,
  path,
}: {
  cta?: { href: string; label: { en: string; es: string } };
  path: string;
}) {
  const t = useT();
  const brief = PAGE_BRIEFS[path];
  if (!brief) return null;

  return (
    <Reveal className="mt-12 sm:mt-16">
      <div className="card p-7 sm:p-9">
        <Eyebrow>{t({ en: 'In short', es: 'En resumen' })}</Eyebrow>
        <ul className="mt-5 grid gap-3">
          {brief.takeaways.map((line) => (
            <li className="flex gap-3.5 text-[1.0625rem] leading-relaxed text-ink" key={line.es}>
              {/* A rule, not a bullet glyph: the page has no decoration anywhere
                  else and a disc would be the only one. */}
              <span aria-hidden="true" className="mt-[0.72em] h-px w-4 shrink-0 bg-hairline-2" />
              <span>{t(line)}</span>
            </li>
          ))}
        </ul>
        {cta && (
          <a
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.9375rem] font-medium text-ground transition-[transform,translate] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px]"
            href={cta.href}
          >
            {t(cta.label)}
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </Reveal>
  );
}

/**
 * The questions a reader arrives with, answered in plain sentences.
 *
 * Every question is an h3 under one h2, which is the shape the structured data
 * in prerender.mjs describes. Answers are visible text rather than a <details>,
 * so what a rich result quotes is exactly what a reader sees.
 */
export function FaqSection({ path }: { path: string }) {
  const t = useT();
  const brief = PAGE_BRIEFS[path];
  if (!brief) return null;

  return (
    <Reveal as="section" className="rule mt-20 scroll-mt-24 pt-10 sm:mt-28 sm:pt-12" id="preguntas">
      <Eyebrow>{t({ en: 'Questions', es: 'Preguntas' })}</Eyebrow>
      <h2 className="display-3 mt-4 max-w-[24ch]">
        {t({ en: 'Frequently asked questions', es: 'Preguntas frecuentes' })}
      </h2>
      <dl className="mt-10 grid max-w-[46rem] gap-px overflow-hidden rounded-2xl bg-hairline">
        {brief.faqs.map((f) => (
          <div className="bg-ground p-6 sm:p-8" key={f.q.es}>
            <dt>
              <h3 className="text-lg font-medium tracking-[-0.02em] text-ink sm:text-xl">
                {t(f.q)}
              </h3>
            </dt>
            <dd className={`${P} mt-3`}>{t(f.a)}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}

/** The other three programmes, so no page is a dead end. */
const CLUSTER: { href: string; label: { en: string; es: string } }[] = [
  { href: '/verificar', label: { en: 'Verify a record', es: 'Verificar un registro' } },
  { href: '/nodo', label: { en: 'Nodo Público', es: 'Nodo Público' } },
  {
    href: '/organizaciones',
    label: { en: 'Organization registry', es: 'Registro de Organizaciones' },
  },
  { href: '/financiar', label: { en: 'Fund a country', es: 'Financiar un país' } },
  { href: '/publicaciones', label: { en: 'Publications', es: 'Publicaciones' } },
];

/**
 * Interlinking, as a visible block rather than a footer nobody reads.
 *
 * The current page is filtered out, so this is the one component that needs to
 * know where it is standing.
 */
export function RelatedPages({ path }: { path: string }) {
  const t = useT();
  const others = CLUSTER.filter((c) => c.href !== path);

  return (
    <Reveal as="nav" aria-label={t({ en: 'More', es: 'Seguir leyendo' })} className="rule mt-20 pt-10 sm:mt-28 sm:pt-12">
      <Eyebrow>{t({ en: 'Keep reading', es: 'Seguir leyendo' })}</Eyebrow>
      <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-hairline sm:grid-cols-2">
        {others.map((c) => (
          <li key={c.href}>
            <a
              className="flex items-center justify-between gap-4 bg-ground px-6 py-5 text-[1.0625rem] font-medium text-ink transition-colors hover:bg-[color-mix(in_oklab,var(--color-ink)_4%,var(--color-ground))]"
              href={c.href}
            >
              {t(c.label)}
              <span aria-hidden="true" className="text-faint">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/**
 * The page's one action, pinned to the bottom on a phone.
 *
 * Hidden from large screens, where the same action is already in the body and a
 * floating bar would be noise. The spacer is part of the component so no page
 * has to remember to pad itself.
 */
export function StickyCta({ href, label }: { href: string; label: { en: string; es: string } }) {
  const t = useT();
  return (
    <>
      <div aria-hidden="true" className="h-[4.75rem] lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-ground/92 px-4 py-3 backdrop-blur-md lg:hidden">
        <Container className="!px-0">
          <a
            className="flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-[0.9375rem] font-medium text-ground"
            href={href}
          >
            {t(label)}
          </a>
        </Container>
      </div>
    </>
  );
}

/**
 * Share a post.
 *
 * The native sheet where the browser has one, which on a phone is every browser
 * that matters; a clipboard copy everywhere else. No third-party button, because
 * a share widget that phones a network on page load would be the only tracker on
 * the site and it would be here to serve someone else.
 */
export function ShareButton({ title }: { title: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      // A cancelled sheet rejects. That is not a failure worth falling back from.
      try {
        await navigator.share({ title, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* no clipboard permission; nothing useful to say */
    }
  };

  return (
    <button
      className="eyebrow mt-8 inline-flex items-center gap-2 text-faint transition-colors duration-300 hover:text-ink"
      onClick={share}
      type="button"
    >
      <span aria-hidden="true">↗</span>
      {copied
        ? t({ en: 'Link copied', es: 'Enlace copiado' })
        : t({ en: 'Share', es: 'Compartir' })}
    </button>
  );
}
