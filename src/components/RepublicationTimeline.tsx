import { useEffect, useRef, useState } from 'react';
import { Eyebrow } from '@/components/primitives';
import { ANCLA, REPUBLICATIONS } from '@/lib/content';
import { useT } from '@/lib/i18n';

/* ---- Geometry ---------------------------------------------------------------
   Everything below is derived once at module load from the coverage window, so
   the prerendered HTML and the first client render are identical. Nothing here
   reads the clock or the DOM. */

const MONTH_W = 4;
const PAD = 12;
const BAND_H = 26;
const ROWS_Y = 44;
const ROW_H = 24;
const DAY_MS = 86_400_000;

/** `YYYY-MM` or `YYYY-MM-DD` → [year, month]. Slicing, not splitting, so the
    result is always two numbers under noUncheckedIndexedAccess. */
function parseYm(v: string): [number, number] {
  return [Number(v.slice(0, 4)), Number(v.slice(5, 7))];
}

/** Whole months between the first archive in the mirror and `ym`. */
function monthOffset(ym: string): number {
  const [by, bm] = parseYm(ANCLA.coverage.from);
  const [y, m] = parseYm(ym);
  return (y - by) * 12 + (m - bm);
}

const COUNT = monthOffset(ANCLA.coverage.to) + 1;
const VB_W = PAD * 2 + COUNT * MONTH_W;
const VB_H = ROWS_Y + REPUBLICATIONS.length * ROW_H;

/** One key per archive in the band. Keyed by month so no tick is keyed by index. */
const MONTH_KEYS = Array.from({ length: COUNT }, (_, i) => {
  const [by, bm] = parseYm(ANCLA.coverage.from);
  const n = bm - 1 + i;
  return `${by + Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, '0')}`;
});

const xOf = (ym: string) => PAD + monthOffset(ym) * MONTH_W;
const pctOf = (x: number) => (x / VB_W) * 100;
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

type Mark = {
  date: string;
  months: number;
  range: string;
  sizeMb: number;
  /** Left and right edge of the republished range, in viewBox units. */
  x1: number;
  x2: number;
  /** Where the republication itself landed, to the day. */
  xLand: number;
  /** Days between the close of the range's last month and the republication. */
  daysAfter: number;
};

function buildMarks(): Mark[] {
  return REPUBLICATIONS.map((r) => {
    const parts = r.range.split('…');
    const from = (parts[0] ?? r.range).trim();
    const to = (parts[1] ?? from).trim();
    const [ly, lm] = parseYm(r.date);
    const day = Number(r.date.slice(8, 10));
    const [ey, em] = parseYm(to);
    // Day 0 of the following month is the last day of this one: the date the
    // archive was supposed to stop changing.
    const closed = Date.UTC(ey, em, 0);
    return {
      date: r.date,
      daysAfter: Math.round((Date.UTC(ly, lm - 1, day) - closed) / DAY_MS),
      months: r.months,
      range: r.range,
      sizeMb: r.sizeMb,
      x1: xOf(from),
      x2: xOf(to) + MONTH_W,
      xLand: PAD + (monthOffset(r.date.slice(0, 7)) + (day - 1) / daysInMonth(ly, lm)) * MONTH_W,
    };
  });
}

const MARKS = buildMarks();

/** A year label every three years. Enough to read the scale, few enough to stay quiet. */
function buildYears(): { label: string; x: number }[] {
  const [fy] = parseYm(ANCLA.coverage.from);
  const [ty] = parseYm(ANCLA.coverage.to);
  const out: { label: string; x: number }[] = [];
  for (let y = fy + 1; y <= ty; y += 3) out.push({ label: String(y), x: xOf(`${y}-01`) });
  return out;
}

const YEARS = buildYears();

/**
 * The evidence exhibit. The band is the archive: one tick per monthly file,
 * 2010-12 to 2026-08. Under it, one row per republication, on the same scale —
 * the range it rewrote, and the day it landed. Every event stays legible with no
 * JavaScript, no hover and no motion; interaction only brings one forward.
 */
export function RepublicationTimeline() {
  const t = useT();
  const [active, setActive] = useState<number | null>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  // Every event sits in the last two years of a fifteen-year band, so a narrow
  // screen would open on thirteen years of nothing. Start at the recent end and
  // let the reader scroll back. Effect-only: the prerendered HTML is unchanged.
  useEffect(() => {
    const el = bandRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const mb = (n: number) =>
    t({ en: `${n.toFixed(1)} MB`, es: `${n.toFixed(1).replace('.', ',')} MB` });
  const monthsLabel = (n: number) =>
    t({ en: n === 1 ? '1 month' : `${n} months`, es: n === 1 ? '1 mes' : `${n} meses` });
  const daysLabel = (n: number) =>
    t({ en: n === 1 ? '+1 day' : `+${n} days`, es: n === 1 ? '+1 día' : `+${n} días` });

  const current = active === null ? null : MARKS[active];
  const readout = current
    ? `${current.date} · ${monthsLabel(current.months)} · ${current.range} · ${mb(current.sizeMb)} · ${daysLabel(current.daysAfter)}`
    : t({
        en: `${ANCLA.monthlyArchives} monthly archives · ${ANCLA.coverage.from} → ${ANCLA.coverage.to} · ${ANCLA.silentlyRevisedMonths} closed months rewritten`,
        es: `${ANCLA.monthlyArchives} archivos mensuales · ${ANCLA.coverage.from} → ${ANCLA.coverage.to} · ${ANCLA.silentlyRevisedMonths} meses cerrados reescritos`,
      });

  const columns = [
    { key: 'date', label: t({ en: 'Republished', es: 'Republicado' }) },
    { key: 'months', label: t({ en: 'Closed months', es: 'Meses cerrados' }) },
    { key: 'range', label: t({ en: 'Range', es: 'Rango' }) },
    { key: 'size', label: t({ en: 'Size', es: 'Tamaño' }) },
    { key: 'after', label: t({ en: 'After month end', es: 'Tras el cierre' }) },
  ] as const;

  return (
    <figure className="m-0">
      <figcaption>
        <Eyebrow>{t({ en: 'Evidence', es: 'Evidencia' })}</Eyebrow>
        <h3 className="display-3 mt-4 max-w-[18ch]">
          {t({ en: 'What was republished', es: 'Lo que se republicó' })}
        </h3>
        <p className="lede mt-5 max-w-[58ch]">
          {t({
            en: 'Each monthly archive freezes on the last day of its month. After that date it should not change. The ones below changed, and none left a record of what was modified.',
            es: 'Cada archivo mensual se congela el último día de su mes. Después de esa fecha no debería cambiar. Los que aparecen abajo cambiaron, y ninguno dejó constancia de qué se modificó.',
          })}
        </p>
      </figcaption>

      {/* Immediate feedback at the point of interaction. The same facts are in the
          list further down, so this is decoration for the pointer, not content. */}
      <p
        aria-hidden="true"
        className={`mono-data mt-10 min-h-6 ${current ? 'text-altered' : 'text-faint'}`}
      >
        {readout}
      </p>

      <div className="mt-3 overflow-x-auto pb-1" ref={bandRef}>
        <div className="relative" style={{ minWidth: `${VB_W}px` }}>
          <svg
            className="block h-auto w-full"
            height={VB_H}
            role="img"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            width={VB_W}
          >
            <title>
              {t({
                en: `A band of ${ANCLA.monthlyArchives} monthly archives, ${ANCLA.coverage.from} to ${ANCLA.coverage.to}, with the ${REPUBLICATIONS.length} republications marked below it on the same time scale.`,
                es: `Franja de ${ANCLA.monthlyArchives} archivos mensuales, de ${ANCLA.coverage.from} a ${ANCLA.coverage.to}, con las ${REPUBLICATIONS.length} republicaciones marcadas debajo, cada una sobre la misma escala de tiempo.`,
              })}
            </title>

            {/* The archive: one tick per monthly file. */}
            {MONTH_KEYS.map((key, i) => (
              <rect
                fill="var(--color-hairline-2)"
                height={BAND_H}
                key={key}
                width={MONTH_W - 1.6}
                x={PAD + i * MONTH_W + 0.8}
                y={0}
              />
            ))}

            {/* Year gridlines, so a row can be read against the scale. */}
            {YEARS.map((y) => (
              <line
                key={y.label}
                stroke="var(--color-hairline)"
                strokeWidth={1}
                x1={y.x}
                x2={y.x}
                y1={0}
                y2={VB_H}
              />
            ))}

            {/* The stretches of the band that were republished. */}
            {MARKS.map((m, i) => (
              <rect
                fill="var(--color-altered)"
                fillOpacity={active === i ? 0.34 : 0.12}
                height={BAND_H}
                key={m.date}
                style={{ transition: 'fill-opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                width={Math.max(m.x2 - m.x1, 2.4)}
                x={m.x1}
                y={0}
              />
            ))}

            {MARKS.map((m, i) => {
              const on = active === i;
              const top = ROWS_Y + i * ROW_H;
              const cy = top + ROW_H / 2;
              return (
                <g key={m.date}>
                  <rect
                    fill="var(--color-altered)"
                    fillOpacity={on ? 0.08 : 0}
                    height={ROW_H}
                    style={{ transition: 'fill-opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    width={VB_W}
                    x={0}
                    y={top}
                  />
                  <line
                    stroke="var(--color-hairline)"
                    strokeWidth={1}
                    x1={PAD}
                    x2={VB_W - PAD}
                    y1={cy}
                    y2={cy}
                  />
                  {/* Drawn only when the gap is wide enough to mean anything at
                      this scale; most of these landed within days. */}
                  {m.xLand - m.x2 > 0.75 && (
                    <line
                      stroke="var(--color-altered)"
                      strokeWidth={1.2}
                      x1={m.x2}
                      x2={m.xLand}
                      y1={cy}
                      y2={cy}
                    />
                  )}
                  <rect
                    fill="var(--color-altered)"
                    height={10}
                    rx={2}
                    width={Math.max(m.x2 - m.x1, 3)}
                    x={m.x1}
                    y={cy - 5}
                  />
                  <circle
                    cx={m.xLand}
                    cy={cy}
                    fill="var(--color-altered)"
                    fillOpacity={on ? 0.18 : 0}
                    r={9}
                    style={{ transition: 'fill-opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                  <circle cx={m.xLand} cy={cy} fill="var(--color-altered)" r={on ? 4.4 : 3.2} />
                </g>
              );
            })}

            {/* Ties the active row back to the band it came out of. */}
            {current && (
              <line
                stroke="var(--color-altered)"
                strokeOpacity={0.5}
                strokeWidth={1}
                x1={current.xLand}
                x2={current.xLand}
                y1={0}
                y2={VB_H}
              />
            )}
          </svg>

          {/* Real buttons, one per event, sitting over its own row. Rows never
              overlap vertically, so two events a day apart still get separate
              targets. */}
          {MARKS.map((m, i) => (
            <button
              aria-label={t({
                en: `Republication of ${m.date}. Closed months rewritten: ${m.months}. Range: ${m.range}. Size: ${mb(m.sizeMb)}. Days after the month closed: ${m.daysAfter}.`,
                es: `Republicación del ${m.date}. Meses cerrados reescritos: ${m.months}. Rango: ${m.range}. Tamaño: ${mb(m.sizeMb)}. Días después del cierre del mes: ${m.daysAfter}.`,
              })}
              className="absolute cursor-pointer rounded-md"
              key={m.date}
              onBlur={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
              onFocus={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              style={{
                height: `${(ROW_H / VB_H) * 100}%`,
                left: `min(${pctOf(Math.min(m.x1, m.xLand) - 6)}%, calc(100% - 44px))`,
                top: `${((ROWS_Y + i * ROW_H) / VB_H) * 100}%`,
                width: `max(${pctOf(Math.max(m.x2, m.xLand) - Math.min(m.x1, m.xLand) + 12)}%, 44px)`,
              }}
              type="button"
            />
          ))}
        </div>

        <div className="relative mt-2 h-4" style={{ minWidth: `${VB_W}px` }}>
          {YEARS.map((y) => (
            <span
              className="absolute top-0 -translate-x-1/2 font-mono text-[11px] text-faint tabular-nums"
              key={y.label}
              style={{ left: `${pctOf(y.x)}%` }}
            >
              {y.label}
            </span>
          ))}
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
        <li className="flex items-center gap-2.5">
          <span aria-hidden="true" className="inline-block h-3.5 w-[3px] bg-hairline-2" />
          <span className="mono-data text-muted">
            {t({ en: 'monthly archive', es: 'archivo mensual' })}
          </span>
        </li>
        <li className="flex items-center gap-2.5">
          <span aria-hidden="true" className="inline-block h-2.5 w-6 rounded-sm bg-altered" />
          <span className="mono-data text-muted">
            {t({ en: 'republished range', es: 'rango republicado' })}
          </span>
        </li>
        <li className="flex items-center gap-2.5">
          <span aria-hidden="true" className="inline-block size-2.5 rounded-full bg-altered" />
          <span className="mono-data text-muted">
            {t({ en: 'day it was republished', es: 'día en que se republicó' })}
          </span>
        </li>
      </ul>

      {/* The full evidence, always rendered. Interaction brings one row forward;
          it never reveals anything that was hidden. */}
      <ol className="mt-8 space-y-1">
        {MARKS.map((m, i) => {
          const on = active === i;
          const values = [
            m.date,
            monthsLabel(m.months),
            m.range,
            mb(m.sizeMb),
            daysLabel(m.daysAfter),
          ];
          return (
            <li
              className={`grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl px-3 py-4 transition-[background-color,opacity] duration-300 sm:grid-cols-5 sm:gap-x-4 ${on ? 'bg-altered-wash' : ''} ${active !== null && !on ? 'opacity-45' : ''}`}
              key={m.date}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              style={on ? { boxShadow: 'inset 2px 0 0 0 var(--color-altered)' } : undefined}
            >
              {columns.map((col, ci) => (
                <div key={col.key}>
                  <Eyebrow>{col.label}</Eyebrow>
                  <p className={`mono-data mt-1.5 ${on && ci === 0 ? 'text-altered' : 'text-ink'}`}>
                    {values[ci]}
                  </p>
                </div>
              ))}
            </li>
          );
        })}
      </ol>

      <p className="mt-7 max-w-[62ch] px-3 text-xs text-faint leading-relaxed">
        {t({
          en: 'The events come from a survey of the archive itself, which was first loaded in 2022. That initial load is deliberately excluded: there the archive was being built, not revised. Before 2022 there is no republication history to look at, so the quiet stretch on the left of the band is not evidence that nothing changed.',
          es: 'Los eventos salen de un sondeo del propio archivo, que se cargó por primera vez en 2022. Esa carga inicial queda excluida a propósito: ahí el archivo se estaba construyendo, no revisando. Antes de 2022 no hay historial de republicación que mirar, así que el tramo quieto a la izquierda de la franja no prueba que nada haya cambiado.',
        })}
      </p>
    </figure>
  );
}
