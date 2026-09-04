import { type CSSProperties, useEffect, useMemo, useRef } from 'react';
import { Container } from '@/components/primitives';
import { useT } from '@/lib/i18n';

/**
 * One mark becomes a lattice of nodes, on scroll. The home page's chapter V,
 * carried over as a React section so it can sit on a routed page.
 *
 * Geometry is the brand mark's regular one, not the measured glyph in Logo.tsx:
 * the arms end 84.5 units from the hub and the witnesses sit 75 out with a
 * radius of 16, so at a spacing of 178 every arm plugs into a neighbour's
 * witness with a hair of air. The measured dots do not tessellate.
 *
 * The section pins for `SPAN` viewports. Progress through it is written to a
 * custom property that the CSS reads to scale each node in, ring by ring; the
 * three lines light at their own marks; the witnesses turn confirmed at 0.36.
 * Nothing per-frame goes through React state, because re-rendering 37 nodes
 * sixty times a second is the kind of thing the home page was just cured of.
 *
 * SSR renders the finished lattice: every node at full scale, every line lit,
 * the state confirmed. The prerendered HTML has to be a complete page for a
 * reader with JS off, and the same markup on both sides is what keeps hydration
 * quiet. The effect then takes over on the client and drives it from scroll,
 * unless the reader asked for reduced motion, in which case the finished
 * lattice is the page.
 */

const SPAN = 3;
const SPACING = 178;
const RINGS = 3;
const CONFIRM_AT = 0.36;
const C30 = Math.cos(Math.PI / 6);

/** From public/brand/decentralamerica-mark.svg. Six subpaths, nonzero fill. */
const MARK_PATH =
  'M140 65.5L160 65.5A2 2 0 0 1 162 67.5L162 164A2 2 0 0 1 160 166L140 166A2 2 0 0 1 138 164L138 67.5A2 2 0 0 1 140 65.5ZM228.179 183.59L218.179 200.91A2 2 0 0 1 215.447 201.642L131.876 153.392A2 2 0 0 1 131.144 150.66L141.144 133.34A2 2 0 0 1 143.876 132.608L227.447 180.858A2 2 0 0 1 228.179 183.59ZM81.821 200.91L71.821 183.59A2 2 0 0 1 72.553 180.858L156.124 132.608A2 2 0 0 1 158.856 133.34L168.856 150.66A2 2 0 0 1 168.124 153.392L84.553 201.642A2 2 0 0 1 81.821 200.91ZM192.044 119.007A16 16 0 1 1 224.044 119.007A16 16 0 1 1 192.044 119.007ZM134 225A16 16 0 1 1 166 225A16 16 0 1 1 134 225ZM75.956 119.007A16 16 0 1 1 107.956 119.007A16 16 0 1 1 75.956 119.007Z';

const WITNESSES = [
  { cx: 208.044, cy: 119.007 },
  { cx: 150, cy: 225 },
  { cx: 91.956, cy: 119.007 },
] as const;

type Node = { x: number; y: number; ring: number; t0: number };

/** 37 nodes, three rings, hub first. Deterministic, so server and client agree. */
function buildLattice(): Node[] {
  const list: { q: number; r: number; ring: number }[] = [];
  for (let q = -RINGS; q <= RINGS; q++) {
    for (let r = -RINGS; r <= RINGS; r++) {
      const ring = (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
      if (ring <= RINGS) list.push({ q, r, ring });
    }
  }
  list.sort((a, b) => a.ring - b.ring);
  return list.map((n, i) => ({
    ring: n.ring,
    // Staggered within a ring so the wave reads as growth rather than a flash.
    t0: 0.02 + n.ring * 0.075 + ((i * 7) % 5) * 0.009,
    x: n.q * SPACING * C30,
    y: -n.r * SPACING - n.q * SPACING * 0.5,
  }));
}

const LINES = [
  {
    at: 0.02,
    en: 'Every node keeps the same fingerprint. Changing the past would mean convincing all of them, at the same time.',
    es: 'Cada nodo guarda la misma huella. Para cambiar el pasado habría que convencerlos a todos, al mismo tiempo.',
  },
  {
    at: 0.24,
    en: 'The anchoring contract does not know how to overwrite. A day is added; it is never corrected.',
    es: 'El contrato de anclaje no sabe sobrescribir. Un día se agrega; nunca se corrige.',
  },
  {
    at: 0.4,
    en: 'When the fingerprint matches on every node, the record is confirmed. When it fails to match on any, it is there for all to see.',
    es: 'Cuando la huella coincide en todos, el registro queda confirmado. Cuando no coincide en alguno, queda a la vista.',
  },
] as const;

export function LatticeReveal() {
  const t = useT();
  const nodes = useMemo(buildLattice, []);
  const wrap = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const lat = svg.current;
    const ol = list.current;
    if (!el || !lat || !ol) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Narrowed once, here; the closures below cannot see the guard above.
    const section: HTMLElement = el;
    const lattice: SVGSVGElement = lat;
    const items = Array.from(ol.children) as HTMLElement[];
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    let top = 0;
    let height = 0;
    let vh = window.innerHeight;
    let lastW = window.innerWidth;
    let lastP = -1;
    let state = '';
    let ticking = false;

    function measure() {
      vh = window.innerHeight;
      const r = section.getBoundingClientRect();
      top = r.top + window.scrollY;
      height = r.height;
    }

    function read() {
      ticking = false;
      const travel = Math.max(height - vh, 1);
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / travel));
      if (p === lastP) return;
      lastP = p;
      section.style.setProperty('--p', p.toFixed(4));
      const next = p >= CONFIRM_AT ? 'confirmed' : 'plain';
      if (next !== state) {
        state = next;
        lattice.setAttribute('data-state', next);
      }
      items.forEach((li, i) => {
        const line = LINES[i];
        if (line) li.classList.toggle('lit', p >= line.at);
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(read);
      }
    }

    function onResize() {
      // A phone's URL bar changes only the height. Relaying out on that makes
      // the section jump under the reader's thumb for no reason.
      if (window.innerWidth === lastW && coarse) {
        vh = window.innerHeight;
        return;
      }
      lastW = window.innerWidth;
      measure();
      lastP = -1;
      read();
    }

    measure();
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    // Fonts settle the layout above this section, which moves its top.
    const settle = window.setTimeout(() => {
      measure();
      lastP = -1;
      read();
    }, 900);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(settle);
    };
  }, []);

  return (
    <section
      ref={wrap}
      className="lattice"
      style={{ '--lattice-span': SPAN } as CSSProperties}
      aria-label={t({ en: 'The network of nodes', es: 'La red de nodos' })}
    >
      <div className="lattice__stage">
        <div className="lattice__lean" aria-hidden="true">
          <div className="lattice__plane">
            <svg
              ref={svg}
              className="lattice__svg"
              viewBox="-660 -600 1320 1200"
              data-state="confirmed"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <path id="lattice-mark" d={MARK_PATH} fillRule="nonzero" />
                <g id="lattice-dots">
                  {WITNESSES.map((w) => (
                    <circle key={w.cx} cx={w.cx} cy={w.cy} r="16" />
                  ))}
                </g>
              </defs>
              {nodes.map((n) => (
                <g
                  key={`${n.x},${n.y}`}
                  transform={`translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`}
                >
                  <g
                    className={`lattice__node${n.ring === 0 ? ' lattice__node--hub' : ''}`}
                    style={{ '--ring': n.ring, '--t0': n.t0.toFixed(3) } as CSSProperties}
                  >
                    <use
                      className="lattice__b"
                      href="#lattice-mark"
                      transform="translate(-150 -150)"
                    />
                    <use
                      className="lattice__w"
                      href="#lattice-dots"
                      transform="translate(-150 -150)"
                    />
                  </g>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <Container className="lattice__in">
          <div className="lattice__copy">
            <p className="eyebrow">
              {t({ en: 'DecentralChain · mainnet', es: 'DecentralChain · red principal' })}
            </p>
            <h2 className="display-3 mt-4 max-w-[18ch]">
              {t({
                en: 'A memory is worth exactly what those who hold it are worth.',
                es: 'Una memoria vale lo que valen quienes la sostienen.',
              })}
            </h2>
            <ol ref={list} className="lattice__lit mt-7 max-w-[36rem]">
              {LINES.map((line) => (
                <li key={line.at} className="lit" data-at={line.at}>
                  {t(line)}
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </div>
    </section>
  );
}
