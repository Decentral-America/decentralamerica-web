import { useEffect, useState } from 'react';
import { Container } from '@/components/primitives';
import { useLastBlock } from '@/lib/chain';
import { ANCLA } from '@/lib/content';
import { useNum, useT } from '@/lib/i18n';

/**
 * One bar per archived month, not per calendar day. The mirror's unit of
 * preservation is the monthly archive, and `coverage` and `monthlyArchives` are
 * two views of that same fact — the span is what the ribbon draws, and the count
 * is the check on it. Taking the wider of the two means a mirror that gains a
 * month before the count is updated still draws every month it holds, and the
 * ribbon never claims a month that is not there.
 */
function monthSpan(from: string, to: string): number {
  const [fy = 0, fm = 1] = from.split('-').map(Number);
  const [ty = 0, tm = 1] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
}

function monthAfter(from: string, offset: number): string {
  const [y = 0, m = 1] = from.split('-').map(Number);
  const total = y * 12 + (m - 1) + offset;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

const BAR_COUNT = Math.max(
  monthSpan(ANCLA.coverage.from, ANCLA.coverage.to),
  ANCLA.monthlyArchives,
);

/**
 * Deterministic per-index noise. `Math.random()` would give the prerendered SVG
 * different bar heights from the hydrated one and React would throw on the
 * mismatch, so the variance has to be a pure function of the index.
 */
function jitter(i: number): number {
  let h = Math.imul(i + 1, 2654435761);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

const BASELINE = 99;

/**
 * Height is a slow undulation plus fine noise. Pure noise reads as static and a
 * flat top reads as a progress bar; the two together read as a physical record.
 */
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const n = jitter(i);
  const swell = Math.sin(i * 0.113) * 5 + Math.sin(i * 0.031) * 3.5;
  return {
    id: monthAfter(ANCLA.coverage.from, i),
    opacity: 0.27 + (i / (BAR_COUNT - 1)) * 0.11 + n * 0.08,
    x: i + 0.5,
    y: BASELINE - (58 + swell + n * 20),
  };
});

/** The newest month is drawn separately: it is the one that carries live state. */
const PAST = BARS.slice(0, -1);
const LAST_X = BAR_COUNT - 0.5;

/**
 * The draw-on lives here rather than in index.css because it belongs to this one
 * element. Outside the media query nothing animates, so a reader with reduced
 * motion gets the finished ribbon on the first paint instead of a cleared one.
 */
const CSS = `
.anchor-ribbon line { vector-effect: non-scaling-stroke; }
.anchor-ribbon-draw { clip-path: inset(0 0 0 0); }
@media (prefers-reduced-motion: no-preference) {
  @keyframes anchor-draw {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }
  .anchor-ribbon-draw { animation: anchor-draw 1.5s cubic-bezier(0.16, 1, 0.3, 1) 120ms both; }
}
`;

/**
 * The hero's evidence. Every archived month as a hairline, the newest one read
 * live from the public node. When the node cannot be reached the ribbon still
 * draws — the record is not the node — and the line below says so rather than
 * rendering a zero.
 */
export function AnchorRibbon({ className = '' }: { className?: string }) {
  const t = useT();
  const num = useNum();
  const block = useLastBlock();

  // Read after mount only: Date.now() on the server would not survive hydration.
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 20_000);
    return () => clearInterval(id);
  }, []);

  const confirmed = block.status === 'ready';

  let line: string;
  if (block.status === 'ready') {
    const height = num(block.data.height);
    const mins = now === 0 ? null : Math.max(0, Math.floor((now - block.data.timestamp) / 60_000));
    if (mins === null) {
      line = t({ en: `last anchor · height ${height}`, es: `último ancla · altura ${height}` });
    } else if (mins === 0) {
      line = t({
        en: `last anchor · height ${height} · confirmed less than 1 min ago`,
        es: `último ancla · altura ${height} · confirmado hace menos de 1 min`,
      });
    } else {
      line = t({
        en: `last anchor · height ${height} · confirmed ${mins} min ago`,
        es: `último ancla · altura ${height} · confirmado hace ${mins} min`,
      });
    }
  } else if (block.status === 'unavailable') {
    line = t({ en: 'last anchor · node unavailable', es: 'último ancla · nodo no disponible' });
  } else {
    line = t({ en: 'last anchor · reading the node…', es: 'último ancla · leyendo el nodo…' });
  }

  const title = t({
    en: `Anchored record: ${BAR_COUNT} monthly archives, ${ANCLA.coverage.from} to ${ANCLA.coverage.to}. One mark per month, the last one the most recent anchor.`,
    es: `Registro anclado: ${BAR_COUNT} archivos mensuales, de ${ANCLA.coverage.from} a ${ANCLA.coverage.to}. Un trazo por mes; el último es el ancla más reciente.`,
  });

  return (
    <div className={className}>
      <style>{CSS}</style>

      {/*
       * The record runs off the left edge — there is always more past than the
       * mirror holds — and stops short of the right, so the confirmed mark lands
       * on a margin instead of looking clipped by the window.
       */}
      <div className="anchor-ribbon-draw pr-6 sm:pr-10 lg:pr-14 [mask-image:linear-gradient(to_right,transparent,black_3%,black_100%)]">
        <svg
          aria-labelledby="anchor-ribbon-title"
          className="anchor-ribbon block h-[clamp(50px,8vh,108px)] w-full"
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${BAR_COUNT} 100`}
        >
          <title id="anchor-ribbon-title">{title}</title>

          <g stroke="var(--color-ink)" strokeWidth={1}>
            {PAST.map((b) => (
              <line key={b.id} strokeOpacity={b.opacity} x1={b.x} x2={b.x} y1={b.y} y2={BASELINE} />
            ))}
          </g>

          {/* The record sits on a rule, the way a ledger does. */}
          <line
            stroke="var(--color-ink)"
            strokeOpacity={0.12}
            strokeWidth={1}
            x1={0}
            x2={BAR_COUNT}
            y1={BASELINE}
            y2={BASELINE}
          />

          <line
            className={confirmed ? 'confirm-pulse' : undefined}
            stroke={confirmed ? 'var(--color-confirmed)' : 'var(--color-ink)'}
            strokeOpacity={confirmed ? 1 : 0.34}
            strokeWidth={2}
            x1={LAST_X}
            x2={LAST_X}
            y1={BASELINE - 92}
            y2={BASELINE}
          />
        </svg>
      </div>

      <Container className="mt-[clamp(0.75rem,1.6vh,1.25rem)]">
        {/* The dot sits inside the paragraph so it stays on the first line when
            the caption wraps, rather than centring against both. */}
        <p className={`mono-data ${block.status === 'loading' ? 'text-faint' : 'text-muted'}`}>
          {confirmed ? (
            <span
              aria-hidden="true"
              className="mr-2.5 inline-block size-1.5 rounded-full bg-confirmed align-[0.15em]"
            />
          ) : null}
          {line}
        </p>
      </Container>
    </div>
  );
}
