import { type ElementType, type ReactNode, useEffect, useRef, useState } from 'react';

/**
 * Entry animation. Rises 24px on first intersection and then stops observing —
 * sections do not re-animate on scroll-back, which reads as noise.
 *
 * SSR-safe: renders visible. The prerendered HTML must be the finished page, so
 * the hidden state is applied by the effect on the client only. A reader with
 * JS off, or with reduced motion, sees a complete page either way.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  id,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Already past it on load (deep link, restored scroll): leave it visible.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setShown(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`${shown ? 'rise-in' : 'opacity-0'} ${className}`}
      style={shown && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/** Page gutter. Every section uses this so the left edge never drifts. */
export function Container({
  children,
  className = '',
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-6 sm:px-8 lg:px-12 ${wide ? 'max-w-[1600px]' : 'max-w-[1180px]'} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * A statement screen. The page's rhythm is big/tight/big/tight, and this is the
 * "big" half — full viewport height, one idea, nothing else in frame.
 */
export function Statement({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`flex min-h-[86svh] flex-col justify-center py-24 sm:py-32 ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

/** Monospace evidence: heights, hashes, record ids, counts. */
export function Mono({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`mono-data ${className}`}>{children}</span>;
}
