import { useId } from 'react';
import { COUNTRIES } from '@/lib/content';
import { type T, useT } from '@/lib/i18n';

type CountryCode = (typeof COUNTRIES)[number]['code'];

/**
 * The two status words, in both languages, in one place. The map and the table
 * must never disagree about what a country's status is called, so they read the
 * same constant. Status is always spelled out: colour alone would leave a
 * reader who cannot see the fill with no way to tell a target from a programme.
 */
export const STATUS_TEXT = {
  live: { en: 'live', es: 'activo' },
  planned: { en: 'planned', es: 'planeado' },
} satisfies Record<(typeof COUNTRIES)[number]['status'], T>;

type Geo = {
  /** Hand-authored outline in the map's own 836 × 502 grid. */
  d: string;
  /** Label block. `y` is the country name's baseline; portal +18, status +34. */
  label: { anchor: 'middle' | 'start'; x: number; y: number };
  /** Leader from the outline out to the label block. */
  leader: { x1: number; x2: number; y1: number; y2: number };
  /** Focus ring, drawn round the outline's bounding box. */
  ring: { height: number; width: number; x: number; y: number };
  /** Where the leader meets the country. For Costa Rica this sits inside it. */
  tick: { x: number; y: number };
};

/**
 * A stylised isthmus, not a survey. Coordinates were plotted from real latitude
 * and longitude on a plate carrée grid and then simplified by hand to ten or
 * twenty vertices each, which is enough for the shapes to be recognisable at
 * the size they are actually read. Shared borders use identical vertices so the
 * six outlines tessellate instead of leaving slivers between them.
 */
const GEO: Record<CountryCode, Geo> = {
  CR: {
    d: 'M391 334 L434 337 L499 340 L518 357 L535 381 L542 392 L561 398 L545 420 L540 445 L536 461 L526 434 L513 450 L498 443 L505 429 L491 414 L475 406 L449 398 L440 379 L432 389 L423 400 L400 386 L383 365 L392 354 L381 341 Z',
    label: { anchor: 'middle', x: 477, y: 488 },
    leader: { x1: 477, x2: 477, y1: 411, y2: 466 },
    ring: { height: 144, width: 192, x: 375, y: 328 },
    tick: { x: 477, y: 375 },
  },
  GT: {
    d: 'M39 181 L67 114 L83 62 L106 37 L205 37 L205 121 L218 131 L235 130 L204 162 L194 186 L183 203 L153 217 L105 208 L62 200 Z',
    label: { anchor: 'middle', x: 75, y: 294 },
    leader: { x1: 75, x2: 75, y1: 203, y2: 276 },
    ring: { height: 192, width: 208, x: 33, y: 31 },
    tick: { x: 75, y: 203 },
  },
  HN: {
    d: 'M235 130 L294 123 L375 117 L429 121 L483 126 L529 161 L434 170 L391 209 L337 236 L302 250 L289 233 L282 211 L267 203 L240 196 L215 182 L194 186 L204 162 Z',
    label: { anchor: 'middle', x: 350, y: 52 },
    leader: { x1: 350, x2: 350, y1: 119, y2: 96 },
    ring: { height: 145, width: 347, x: 188, y: 111 },
    tick: { x: 350, y: 119 },
  },
  NI: {
    d: 'M529 161 L515 205 L510 249 L505 284 L498 316 L499 340 L434 337 L391 334 L359 297 L321 271 L286 253 L302 250 L337 236 L391 209 L434 170 Z',
    label: { anchor: 'start', x: 562, y: 212 },
    leader: { x1: 513, x2: 554, y1: 222, y2: 222 },
    ring: { height: 191, width: 255, x: 280, y: 155 },
    tick: { x: 513, y: 222 },
  },
  PA: {
    d: 'M561 398 L591 407 L645 420 L672 398 L699 398 L726 397 L753 398 L780 405 L821 414 L842 439 L850 473 L821 502 L796 491 L780 460 L726 426 L704 473 L699 491 L667 482 L650 460 L618 469 L591 460 L536 461 L540 445 L545 420 Z',
    label: { anchor: 'middle', x: 790, y: 320 },
    leader: { x1: 790, x2: 790, y1: 407, y2: 364 },
    ring: { height: 117, width: 325, x: 531, y: 391 },
    tick: { x: 790, y: 407 },
  },
  SV: {
    d: 'M153 217 L183 203 L194 186 L215 182 L240 196 L267 203 L282 211 L284 242 L240 242 L197 227 Z',
    label: { anchor: 'middle', x: 222, y: 308 },
    leader: { x1: 222, x2: 222, y1: 236, y2: 290 },
    ring: { height: 72, width: 143, x: 147, y: 176 },
    tick: { x: 222, y: 236 },
  },
};

/** North to south, which is also the tab order. */
const ORDER = ['GT', 'SV', 'HN', 'NI', 'CR', 'PA'] as const;

/**
 * The Central American isthmus with one country filled and five outlined.
 *
 * The map is decoration over the table that follows it: everything drawn here
 * is also written there as text, so nothing is lost when the map is hidden on a
 * narrow screen, printed, or read by a screen reader. That is deliberate. A map
 * is the easiest place on a page to imply coverage that does not exist, so the
 * five planned countries carry no fill, no marker and no colour, and every one
 * of them says the word "planned" next to its name.
 */
export function IsthmusMap({ className = '' }: { className?: string }) {
  const t = useT();
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  const ordered = [...COUNTRIES].sort((a, b) => ORDER.indexOf(a.code) - ORDER.indexOf(b.code));

  return (
    // Below `md` the isthmus is 300px of unreadable hairlines, so the section's
    // table stands in for it rather than a squashed map.
    <figure className={`hidden md:block ${className}`}>
      <svg
        aria-labelledby={`${titleId} ${descId}`}
        className="h-auto w-full"
        role="img"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="22 30 836 502"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id={titleId}>
          {t({
            en: 'The Central American isthmus: Costa Rica live, five countries planned.',
            es: 'El istmo centroamericano: Costa Rica activa, cinco países planeados.',
          })}
        </title>
        <desc id={descId}>
          {t({
            en: 'A stylised outline of Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica and Panama. Costa Rica is drawn filled because the registry runs there. The other five are drawn as empty outlines because nothing runs in them yet. Each country is labelled with its national procurement portal and its status. The same information is in the table below.',
            es: 'Contorno estilizado de Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica y Panamá. Costa Rica está rellena porque el registro corre ahí. Los otros cinco son contornos vacíos porque todavía no corre nada en ellos. Cada país lleva el nombre de su portal nacional de compras públicas y su estado. La misma información está en la tabla siguiente.',
          })}
        </desc>

        {ordered.map((country) => {
          const geo = GEO[country.code];
          const live = country.status === 'live';
          const status = t(STATUS_TEXT[country.status]);

          return (
            /* No explicit role: a <g> carrying an accessible name already maps
               to role="group", and pinning a non-interactive role onto a
               focusable element is worse than leaving it implicit. */
            <g
              aria-label={`${country.name}. ${country.portal}. ${status}.`}
              className="group focus-visible:outline-none"
              key={country.code}
              tabIndex={0}
            >
              {/* Focus ring. The browser's own outline is suppressed above
                  because it wraps the label block too and lands far from the
                  shape the reader is actually on. */}
              <rect
                className="stroke-ink opacity-0 group-focus-visible:opacity-100"
                fill="none"
                height={geo.ring.height}
                rx={16}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                width={geo.ring.width}
                x={geo.ring.x}
                y={geo.ring.y}
              />

              <path
                className={
                  live
                    ? 'fill-ink stroke-ink'
                    : 'stroke-hairline-2 transition-colors duration-300 group-hover:stroke-faint group-focus-visible:stroke-faint'
                }
                d={geo.d}
                /* Transparent rather than none: an unfilled country still has
                   to be hoverable across its whole area, not just its edge. */
                fill={live ? undefined : 'transparent'}
                strokeWidth={live ? 1 : 1.25}
                vectorEffect="non-scaling-stroke"
              />

              <line
                className="stroke-hairline-2"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                x1={geo.leader.x1}
                x2={geo.leader.x2}
                y1={geo.leader.y1}
                y2={geo.leader.y2}
              />

              {live ? (
                <>
                  <circle
                    className="stroke-confirmed"
                    cx={geo.tick.x}
                    cy={geo.tick.y}
                    fill="none"
                    opacity={0.45}
                    r={13}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle className="fill-confirmed" cx={geo.tick.x} cy={geo.tick.y} r={6.5} />
                </>
              ) : (
                <circle
                  className="stroke-hairline-2"
                  cx={geo.tick.x}
                  cy={geo.tick.y}
                  fill="none"
                  r={3.5}
                  strokeWidth={1.25}
                  vectorEffect="non-scaling-stroke"
                />
              )}

              <text
                className={
                  live
                    ? 'fill-ink font-sans'
                    : 'fill-muted font-sans transition-colors duration-300 group-hover:fill-ink group-focus-visible:fill-ink'
                }
                fontSize={17}
                fontWeight={500}
                letterSpacing="-0.02em"
                textAnchor={geo.label.anchor}
                x={geo.label.x}
                y={geo.label.y}
              >
                {country.name}
              </text>
              <text
                className={live ? 'fill-muted font-mono' : 'fill-faint font-mono'}
                fontSize={13}
                letterSpacing="-0.01em"
                textAnchor={geo.label.anchor}
                x={geo.label.x}
                y={geo.label.y + 18}
              >
                {country.portal}
              </text>
              <text
                className={
                  live ? 'fill-confirmed-ink font-mono uppercase' : 'fill-faint font-mono uppercase'
                }
                fontSize={10.5}
                fontWeight={500}
                letterSpacing="0.12em"
                textAnchor={geo.label.anchor}
                x={geo.label.x}
                y={geo.label.y + 34}
              >
                {status}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-2.5 rounded-[3px] bg-ink" />
          <span className="eyebrow">
            {t({ en: 'live · the registry runs here', es: 'activo · el registro corre aquí' })}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-[3px] ring-1 ring-hairline-2 ring-inset"
          />
          <span className="eyebrow">
            {t({ en: 'planned · nothing runs yet', es: 'planeado · todavía no corre nada' })}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
