import { startTransition, useEffect, useState } from 'react';

const NAV_EVENT = 'dc:navigate';

/**
 * Waits for the anchor to exist, then scrolls to it.
 *
 * The old budget was 40 frames, roughly 660ms, and it lost a race about one load
 * in three. Deep-linking to an anchor on a lazy route goes: the prerendered HTML
 * arrives at full height and the browser scrolls natively, then hydration swaps
 * in the Suspense fallback while the route's chunk loads, the document collapses
 * to the fallback's height, and the browser clamps scroll back to zero. If the
 * chunk had not arrived before the retries ran out, the reader was left at the
 * top of a page they had deep-linked into the middle of.
 *
 * Three seconds covers a cold chunk on a slow connection. The loop also gives up
 * the moment the reader scrolls for themselves — an automatic jump seconds after
 * someone has started reading is worse than not scrolling at all.
 */
const SCROLL_RETRY_FRAMES = 180;

function scrollToHash(hash: string, tries = 0, abort?: { cancelled: boolean }) {
  const signal = abort ?? { cancelled: false };

  if (tries === 0) {
    const cancel = () => {
      signal.cancelled = true;
    };
    // `once` so these unbind themselves; passive because none of them preventDefault.
    for (const ev of ['wheel', 'touchstart', 'keydown'] as const) {
      window.addEventListener(ev, cancel, { once: true, passive: true });
    }
  }

  if (signal.cancelled) return;

  const el = document.getElementById(hash.slice(1));
  if (!el) {
    if (tries < SCROLL_RETRY_FRAMES) {
      // A timer rather than requestAnimationFrame: rAF does not fire in a
      // background tab, so a deep link opened in one was never scrolled at all
      // until the reader switched to it, by which point the retries had expired.
      setTimeout(() => scrollToHash(hash, tries + 1, signal), 16);
    }
    return;
  }

  el.scrollIntoView();

  /**
   * Scrolling once is not enough. The document can still be settling — the
   * chunk's own images and webfonts land after it mounts, and any of them can
   * move the target or collapse the height and take the scroll with it. So the
   * position is checked over the following second and reapplied if it drifted,
   * which is what turned a one-in-three failure into a stable landing.
   */
  let checks = 0;
  const hold = () => {
    if (signal.cancelled || checks++ > 60) return;
    const top = el.getBoundingClientRect().top;
    if (Math.abs(top) > 4) el.scrollIntoView();
    setTimeout(hold, 16);
  };
  setTimeout(hold, 16);
}

/**
 * What to do with the scroll position once the next page has actually rendered.
 * Acting at navigate() time moved the page that is still on screen, because the
 * new one has not committed yet.
 */
let pending: 'top' | string | null = null;

export function navigate(to: string) {
  const url = new URL(to, window.location.origin);
  if (url.pathname === window.location.pathname && !url.hash) return;

  window.history.pushState({}, '', to);
  // Only on a push. Back and forward keep the browser's own restoration.
  pending = url.hash ? url.hash : 'top';
  window.dispatchEvent(new Event(NAV_EVENT));
}

/**
 * Path state plus a single delegated click handler, so every plain internal <a>
 * on the page navigates without a reload. No router dependency, and nothing for
 * link components to opt into.
 */
export function useRoute(initial?: string) {
  // `initial` is what the prerender is rendering. On the client it is undefined
  // and the real location wins, so the first hydrated render matches the HTML.
  const [path, setPath] = useState(
    () => initial ?? (typeof window === 'undefined' ? '/' : window.location.pathname),
  );

  /**
   * Apply the scroll only once the new page is on screen. Under a transition the
   * previous page stays rendered while the next one loads, so scrolling any
   * earlier moves the wrong document.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: the scroll is owed to this path change, not to `pending`
  useEffect(() => {
    if (pending === null) return;
    const what = pending;
    pending = null;
    if (what === 'top') window.scrollTo(0, 0);
    else scrollToHash(what);
  }, [path]);

  // A hash in the initial URL: the browser gave up before the chunk arrived.
  useEffect(() => {
    if (window.location.hash) scrollToHash(window.location.hash);
  }, []);

  useEffect(() => {
    /**
     * A transition, so React keeps the current page on screen while the next
     * one's chunk loads rather than swapping in the Suspense fallback. Without it
     * a jump from a long page collapsed the document to the fallback's height and
     * back — measured at 86,900px down to 1,206px — which threw away the scroll
     * position and read as a glitch.
     */
    const sync = () => startTransition(() => setPath(window.location.pathname));
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      if (!href.startsWith('/') || href.startsWith('//')) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;

      const url = new URL(href, window.location.origin);
      // An anchor on the page we are already on: the browser does this better.
      if (url.hash && url.pathname === window.location.pathname) return;

      e.preventDefault();
      navigate(href);
    };

    window.addEventListener('popstate', sync);
    window.addEventListener(NAV_EVENT, sync);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(NAV_EVENT, sync);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return path;
}
