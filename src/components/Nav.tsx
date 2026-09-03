import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { LangToggle } from '@/components/LangToggle';
import { Mark } from '@/components/Logo';
import { Container } from '@/components/primitives';
import type { T } from '@/lib/i18n';
import { useT } from '@/lib/i18n';
import { navigate } from '@/lib/router';

const PANEL_ID = 'nav-menu';

/** "Nodo Público" is the programme's name, so it is not translated. */
const LINKS = [
  { href: '#registro', label: { en: 'The record', es: 'El registro' } },
  { href: '#como-funciona', label: { en: 'How it works', es: 'Cómo funciona' } },
  { href: '#alcance', label: { en: 'Reach', es: 'Alcance' } },
  // A real page now, not an on-page anchor: someone clicking this wants the
  // whole explanation, not the summary the landing section carries.
  { href: '/nodo', label: { en: 'Nodo Público', es: 'Nodo Público' } },
  // Served by the ancla service, proxied at this path. A plain <a> rather than a
  // router link on purpose: it is a different application, and routing into it
  // would leave this app's shell wrapped around something it does not own.
  { href: '/evidencia/versions.html', label: { en: 'Evidence', es: 'Evidencia' } },
  { href: '/publicaciones', label: { en: 'Publications', es: 'Publicaciones' } },
] as const satisfies readonly { href: string; label: T }[];

export function Nav() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Sync once: a deep link or a restored scroll position means the page can
    // start below the fold without ever firing a scroll event.
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      // Focus returns to the trigger only if it was inside the panel. A click
      // elsewhere on the page should leave focus where the reader put it.
      close(panelRef.current?.contains(document.activeElement) ?? false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, close]);

  /**
   * The hash targets are sections of the home page. From any other route the
   * browser would only rewrite the fragment and stay put, so route home first
   * and let the router do the scrolling once the page has committed.
   */
  const onHashClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = e.currentTarget.getAttribute('href');
    if (!href?.startsWith('#')) return;
    if (window.location.pathname === '/') return;
    e.preventDefault();
    navigate(`/${href}`);
  }, []);

  const onMenuLinkClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onHashClick(e);
      setOpen(false);
    },
    [onHashClick],
  );

  // Open over the hero, the bar has to become a surface or the panel floats on
  // nothing — so the menu borrows the scrolled treatment.
  const solid = scrolled || open;

  return (
    /**
     * Fixed, not sticky: a sticky bar occupies a strip of normal flow, which
     * would push a 100svh hero down by its height and put the fold inside the
     * hero. Out of flow, the hero keeps the whole viewport and the bar rides
     * over it.
     */
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        solid
          ? 'bg-ground/75 shadow-[inset_0_-1px_0_var(--color-hairline)] backdrop-blur-xl backdrop-saturate-150'
          : 'bg-transparent'
      }`}
      ref={rootRef}
    >
      <a
        className="absolute top-3 left-4 z-10 -translate-y-[calc(100%+1.5rem)] rounded-lg bg-panel px-4 py-2 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(10,10,11,0.04),0_8px_24px_rgba(10,10,11,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:translate-y-0"
        href="#main"
      >
        {t({ en: 'Skip to content', es: 'Saltar al contenido' })}
      </a>

      <Container>
        <div className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
          <a
            className="flex items-center gap-2.5 text-[1.0625rem] font-medium tracking-[-0.03em] text-ink sm:text-lg"
            href="/"
          >
            {/* Bare rather than on a disc: at this size a knocked-out glyph
                closes up, and the bar already sits on the page's own ground.
                The nudge optically centres the glyph against the wordmark's
                cap-height rather than its line box — flex centring aligns the
                boxes, which leaves the mark sitting a pixel high. In em so it
                holds at the sm: step up. */}
            <Mark className="h-[1.62em] w-[1.62em] shrink-0 translate-y-[0.04em]" />
            DecentralAmerica
          </a>

          <nav aria-label={t({ en: 'Main', es: 'Principal' })} className="hidden md:block">
            <ul className="flex items-center gap-6 lg:gap-8">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    className="text-[0.9375rem] text-muted transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-ink"
                    href={link.href}
                    onClick={onHashClick}
                  >
                    {t(link.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <LangToggle />
            <button
              aria-controls={PANEL_ID}
              aria-expanded={open}
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors duration-300 hover:bg-ink/5 md:hidden"
              onClick={() => setOpen((v) => !v)}
              ref={triggerRef}
              type="button"
            >
              <span className="sr-only">{t({ en: 'Menu', es: 'Menú' })}</span>
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <line
                  className={`transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open ? 'translate-y-[3px] rotate-45' : ''
                  }`}
                  style={{ transformBox: 'view-box', transformOrigin: 'center' }}
                  x1="4"
                  x2="20"
                  y1="9"
                  y2="9"
                />
                <line
                  className={`transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open ? '-translate-y-[3px] -rotate-45' : ''
                  }`}
                  style={{ transformBox: 'view-box', transformOrigin: 'center' }}
                  x1="4"
                  x2="20"
                  y1="15"
                  y2="15"
                />
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {/* Kept in the DOM so `aria-controls` always resolves; `hidden` takes it
          out of the tab order and off the accessibility tree when closed. */}
      <div className="rule md:hidden" hidden={!open} id={PANEL_ID} ref={panelRef}>
        <Container>
          <nav
            aria-label={t({ en: 'Main', es: 'Principal' })}
            className="max-h-[70svh] overflow-y-auto py-2"
            // Reuses the page's entry keyframes, so the panel settles on the
            // same spring as everything else. Reduced motion collapses it.
            style={
              open ? { animation: 'rise 0.42s cubic-bezier(0.16, 1, 0.3, 1) both' } : undefined
            }
          >
            <ul className="flex flex-col">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    className="block py-3 text-[1.0625rem] text-ink"
                    href={link.href}
                    onClick={onMenuLinkClick}
                  >
                    {t(link.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>
    </header>
  );
}
