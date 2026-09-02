import type { ReactNode } from 'react';
import { Container, Eyebrow, Mono, Reveal, Statement } from '@/components/primitives';
import { NODE_URL } from '@/lib/content';
import { useT } from '@/lib/i18n';

/**
 * Illustrative strings, not published roots. The figures are schematics — each
 * one is labelled as such — and these stand in for a fingerprint's shape and
 * length. They differ in every character on purpose: that is the property the
 * second panel exists to show.
 */
const FINGERPRINT = '4a7f 91c3 08de b562';
const FINGERPRINT_CHANGED = 'e0d3 2b48 f7a1 5c9e';

/** Ragged widths so the rows read as records rather than as a bar chart. */
const RECORD_ROWS = [
  { id: 'r1', w: 138 },
  { id: 'r2', w: 116 },
  { id: 'r3', w: 132 },
  { id: 'r4', w: 104 },
  { id: 'r5', w: 138 },
  { id: 'r6', w: 122 },
  { id: 'r7', w: 110 },
];

/** Leaves, then the pair they join into. Hardcoded so the geometry is readable. */
const LEAVES = [
  { c: 35, id: 'l1', p: 60 },
  { c: 85, id: 'l2', p: 60 },
  { c: 135, id: 'l3', p: 160 },
  { c: 185, id: 'l4', p: 160 },
  { c: 235, id: 'l5', p: 260 },
  { c: 285, id: 'l6', p: 260 },
  { c: 335, id: 'l7', p: 360 },
  { c: 385, id: 'l8', p: 360 },
];
const MIDS = [
  { c: 60, id: 'n1', p: 110 },
  { c: 160, id: 'n2', p: 110 },
  { c: 260, id: 'n3', p: 310 },
  { c: 360, id: 'n4', p: 310 },
];
const PAIRS = [
  { c: 110, id: 'm1' },
  { c: 310, id: 'm2' },
];

/** Sealed entries above and below the anchored one, with their filler widths. */
const SEALED = [
  { id: 's1', w: 118, y: 40 },
  { id: 's3', w: 96, y: 96 },
  { id: 's4', w: 134, y: 124 },
  { id: 's5', w: 108, y: 152 },
  { id: 's6', w: 126, y: 180 },
  { id: 's7', w: 88, y: 208 },
];

const PLATE_LABEL = 'font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em]';

function MirrorFigure() {
  const t = useT();
  return (
    <svg
      className="h-auto w-full"
      role="img"
      viewBox="0 0 420 244"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>
        {t({
          en: 'Diagram: the published record on the left, its daily copy on the right, row for row.',
          es: 'Diagrama: el registro publicado a la izquierda y su copia diaria a la derecha, fila por fila.',
        })}
      </title>

      <text
        fill="var(--color-faint)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1.3"
        x="6"
        y="12"
      >
        {t({ en: 'PUBLISHED', es: 'PUBLICADO' })}
      </text>
      <text
        fill="var(--color-faint)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1.3"
        textAnchor="end"
        x="416"
        y="12"
      >
        {t({ en: 'DAILY COPY', es: 'COPIA DIARIA' })}
      </text>

      {/* The two sheets behind the front one: the copy is taken again each day. */}
      <rect
        fill="none"
        height="200"
        rx="10"
        stroke="var(--color-hairline)"
        width="166"
        x="250"
        y="20"
      />
      <rect
        fill="var(--color-panel)"
        height="200"
        rx="10"
        stroke="var(--color-hairline)"
        width="166"
        x="244"
        y="27"
      />

      <rect
        fill="var(--color-panel)"
        height="200"
        rx="10"
        stroke="var(--color-hairline-2)"
        width="170"
        x="6"
        y="34"
      />
      <rect
        fill="var(--color-panel)"
        height="200"
        rx="10"
        stroke="var(--color-hairline-2)"
        width="166"
        x="238"
        y="34"
      />

      {RECORD_ROWS.map((row, i) => (
        <g key={row.id}>
          <rect
            fill="var(--color-hairline-2)"
            height="8"
            rx="3"
            width={row.w}
            x="22"
            y={54 + i * 24}
          />
          <line
            stroke="var(--color-hairline-2)"
            x1="184"
            x2="230"
            y1={58 + i * 24}
            y2={58 + i * 24}
          />
          {/* Identical fill and width on both sides: the copy is not tidied, not
              reordered and not shortened on the way over. */}
          <rect
            fill="var(--color-hairline-2)"
            height="8"
            rx="3"
            width={row.w}
            x="254"
            y={54 + i * 24}
          />
        </g>
      ))}
      <path d="M 226 126 L 231 130 L 226 134" fill="none" stroke="var(--color-hairline-2)" />
    </svg>
  );
}

function ReduceFigure() {
  const t = useT();
  return (
    <svg
      className="h-auto w-full"
      role="img"
      viewBox="0 0 420 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>
        {t({
          en: "Diagram: the day's records join in pairs, level by level, until one fingerprint is left.",
          es: 'Diagrama: los registros del día se combinan por pares, nivel a nivel, hasta quedar en una sola huella.',
        })}
      </title>

      <text
        fill="var(--color-faint)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1.3"
        x="12"
        y="10"
      >
        {t({ en: "THE DAY'S RECORDS", es: 'REGISTROS DEL DÍA' })}
      </text>

      {LEAVES.map((leaf) => (
        <g key={leaf.id}>
          <rect
            fill="var(--color-hairline-2)"
            height="10"
            rx="3"
            width="46"
            x={leaf.c - 23}
            y="18"
          />
          <path
            d={`M ${leaf.c} 28 V 46 H ${leaf.p} V 58`}
            fill="none"
            stroke="var(--color-hairline-2)"
          />
        </g>
      ))}

      {MIDS.map((mid) => (
        <g key={mid.id}>
          <rect fill="var(--color-faint)" height="9" rx="3" width="30" x={mid.c - 15} y="58" />
          <path
            d={`M ${mid.c} 67 V 84 H ${mid.p} V 96`}
            fill="none"
            stroke="var(--color-hairline-2)"
          />
        </g>
      ))}

      {PAIRS.map((pair) => (
        <g key={pair.id}>
          <rect fill="var(--color-muted)" height="9" rx="3" width="24" x={pair.c - 12} y="96" />
          <path
            d={`M ${pair.c} 105 V 122 H 210 V 134`}
            fill="none"
            stroke="var(--color-hairline-2)"
          />
        </g>
      ))}

      <rect fill="var(--color-ink)" height="9" rx="3" width="24" x="198" y="134" />
      <path d="M 210 143 V 160" fill="none" stroke="var(--color-hairline-2)" />

      <rect
        fill="var(--color-panel)"
        height="32"
        rx="8"
        stroke="var(--color-hairline-2)"
        width="230"
        x="95"
        y="160"
      />
      <text
        fill="var(--color-ink)"
        fontFamily="var(--font-mono)"
        fontSize="15"
        letterSpacing="0.6"
        textAnchor="middle"
        x="210"
        y="181"
      >
        {FINGERPRINT}
      </text>
      <text
        fill="var(--color-faint)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1.3"
        textAnchor="middle"
        x="210"
        y="210"
      >
        {t({ en: 'ONE FINGERPRINT FOR THE WHOLE DAY', es: 'UNA HUELLA PARA TODO EL DÍA' })}
      </text>
    </svg>
  );
}

function AnchorFigure() {
  const t = useT();
  return (
    <svg
      className="h-auto w-full"
      role="img"
      viewBox="0 0 420 256"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>
        {t({
          en: 'Diagram: the fingerprint sits inside a public sequence, with further entries sealed underneath it.',
          es: 'Diagrama: la huella queda dentro de una secuencia pública, con más entradas selladas debajo de ella.',
        })}
      </title>

      <text
        fill="var(--color-faint)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1.3"
        x="16"
        y="14"
      >
        {t({ en: 'PUBLIC SEQUENCE', es: 'SECUENCIA PÚBLICA' })}
      </text>

      {/* The sequence runs on past both edges of the frame. */}
      <path
        d="M 141 22 V 34"
        stroke="var(--color-hairline-2)"
        strokeDasharray="2 4"
        strokeLinecap="round"
      />
      <path
        d="M 141 234 V 252"
        stroke="var(--color-hairline-2)"
        strokeDasharray="2 4"
        strokeLinecap="round"
      />

      {SEALED.map((entry) => (
        <g key={entry.id}>
          <rect fill="var(--color-hairline)" height="20" rx="4" width="250" x="16" y={entry.y} />
          <rect
            fill="var(--color-hairline-2)"
            height="6"
            rx="2"
            width={entry.w}
            x="30"
            y={entry.y + 7}
          />
        </g>
      ))}

      <rect
        fill="var(--color-panel)"
        height="20"
        rx="4"
        stroke="var(--color-hairline-2)"
        width="250"
        x="16"
        y="68"
      />
      <rect fill="var(--color-confirmed)" height="20" rx="1.5" width="3" x="16" y="68" />
      <text fill="var(--color-ink)" fontFamily="var(--font-mono)" fontSize="11" x="30" y="82">
        {FINGERPRINT}
      </text>
      <text
        fill="var(--color-confirmed-ink)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="1.3"
        x="278"
        y="82"
      >
        {t({ en: 'ANCHORED', es: 'ANCLADO' })}
      </text>

      <path d="M 278 96 H 286 V 228 H 278" fill="none" stroke="var(--color-hairline-2)" />
      <text fill="var(--color-faint)" fontFamily="var(--font-mono)" fontSize="9" x="294" y="158">
        {t({ en: 'SEALED', es: 'SELLADO' })}
      </text>
      <text fill="var(--color-faint)" fontFamily="var(--font-mono)" fontSize="9" x="294" y="170">
        {t({ en: 'AFTER', es: 'DESPUÉS' })}
      </text>
    </svg>
  );
}

function Panel({
  body,
  caption,
  children,
  index,
  plate,
  verb,
}: {
  body: string;
  caption: string;
  children: ReactNode;
  index: string;
  plate: string;
  verb: string;
}) {
  const t = useT();
  return (
    <Statement>
      <Container>
        <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow className="mb-5">{index}</Eyebrow>
            <h2 className="display-2">{verb}</h2>
            <p className="lede mt-7 max-w-[42ch]">{body}</p>
          </div>

          <figure className="w-full max-w-[540px] lg:justify-self-end">
            <div className="rule mb-6 flex items-baseline justify-between gap-4 pt-3">
              <span className={`${PLATE_LABEL} text-muted`}>{plate}</span>
              <span className={`${PLATE_LABEL} text-faint`}>
                {t({ en: 'Schematic', es: 'Esquema' })}
              </span>
            </div>
            {children}
            <figcaption className="mt-6 max-w-[46ch] text-[0.9375rem] leading-relaxed text-muted">
              {caption}
            </figcaption>
          </figure>
        </Reveal>
      </Container>
    </Statement>
  );
}

export function HowItWorks() {
  const t = useT();
  return (
    <section aria-label={t({ en: 'How it works', es: 'Cómo funciona' })} id="como-funciona">
      {/*
       * The three panels below describe the published-record path, which is the
       * one running today. Leading straight into them read as though the whole
       * memory were procurement, so this header names the other way in and is
       * explicit about which of the two is live.
       */}
      <Container>
        <Reveal as="header" className="max-w-[54rem] pt-24 sm:pt-32">
          <Eyebrow>{t({ en: 'How it enters', es: 'Cómo entra' })}</Eyebrow>
          <h2 className="display-2 mt-4">
            {t({ en: 'Two paths into the memory.', es: 'Dos caminos hacia la memoria.' })}
          </h2>
          <p className="lede mt-6 max-w-[46rem]">
            {t({
              en: 'Part of the memory is already published: what institutions release every day. The rest is gathered in the field, where an accredited verifier attests that something happened. Both paths end in the same seal. Below is the first one, the one already running.',
              es: 'Una parte de la memoria ya está publicada: lo que las instituciones difunden cada día. La otra se levanta en campo, donde alguien acreditado da fe de que algo ocurrió. Los dos caminos terminan en el mismo sello. Abajo está el primero, que es el que ya corre.',
            })}
          </p>
        </Reveal>
      </Container>

      <Panel
        body={t({
          en: 'Every day we take the published record and copy it whole, exactly as it stands. Nothing is corrected: a published error is stored as an error.',
          es: 'Cada día tomamos el registro publicado y lo copiamos entero, tal como está. No corregimos nada: un error publicado se guarda como error.',
        })}
        caption={t({
          en: 'The copy repeats the record as it was published, on the day it was published.',
          es: 'La copia repite el registro tal como se publicó, el día en que se publicó.',
        })}
        index="01"
        plate={t({ en: 'Mirror', es: 'Espejo' })}
        verb={t({ en: 'We copy', es: 'Copiamos' })}
      >
        <MirrorFigure />
      </Panel>

      <Panel
        body={t({
          en: "The whole day's record is reduced to one fingerprint, a short string of characters. Change a single character in a single record and the fingerprint comes out completely different.",
          es: 'El registro completo del día se reduce a una sola huella, una cadena corta de caracteres. Si cambia un solo carácter de un solo registro, la huella sale completamente distinta.',
        })}
        caption={t({
          en: 'The fingerprint says nothing about what the record contains. It only lets anyone check that the record has not moved.',
          es: 'La huella no dice nada sobre lo que contiene el registro. Solo permite comprobar que el registro no se movió.',
        })}
        index="02"
        plate={t({ en: 'Reduction', es: 'Reducción' })}
        verb={t({ en: 'We reduce', es: 'Reducimos' })}
      >
        <ReduceFigure />
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-altered border-l-2 pl-4">
          <span className={`${PLATE_LABEL} text-altered`}>
            {t({ en: 'One character changed', es: 'Un carácter distinto' })}
          </span>
          <span aria-hidden="true" className="text-faint">
            →
          </span>
          <Mono>{FINGERPRINT_CHANGED}</Mono>
        </div>
      </Panel>

      <Panel
        body={t({
          en: 'The fingerprint is written into a public sequence where no one can edit it or take it back. Not us either.',
          es: 'La huella queda escrita en una secuencia pública donde nadie puede editarla ni retirarla. Nosotros tampoco.',
        })}
        caption={t({
          en: 'Taking it back would mean taking back everything sealed after it, and everything after that.',
          es: 'Retirarla exigiría retirar todo lo que se selló después, y todo lo que vino detrás.',
        })}
        index="03"
        plate={t({ en: 'Anchor', es: 'Anclaje' })}
        verb={t({ en: 'We anchor', es: 'Anclamos' })}
      >
        <AnchorFigure />
      </Panel>

      <Container className="pb-24 sm:pb-32">
        <details className="group rule max-w-[66ch] pt-10">
          <summary className="flex cursor-pointer list-none items-center gap-3 font-medium text-[0.9375rem] [&::-webkit-details-marker]:hidden">
            <svg
              aria-hidden="true"
              className="shrink-0 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-open:rotate-45"
              height="12"
              viewBox="0 0 12 12"
              width="12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 0 V12 M0 6 H12"
                stroke="var(--color-faint)"
                strokeLinecap="round"
                strokeWidth="1.25"
              />
            </svg>
            {t({
              en: 'For those who want the technical detail',
              es: 'Para quien quiera el detalle técnico',
            })}
          </summary>

          <div className="mt-5 pl-6">
            <p className="text-[0.9375rem] text-muted leading-relaxed">
              {t({
                en: "The day's records are canonicalized and a Merkle root is computed over them. That root is written as a data transaction on DecentralChain, dated and signed. Anyone can recompute it from the published archive and check it against the public node, without asking us and without taking our word for anything. Keeping it running costs under a dollar a year.",
                es: 'Los registros del día se canonicalizan y se calcula una raíz de Merkle sobre ellos. Esa raíz se escribe como transacción de datos en DecentralChain, con fecha y firma. Cualquiera puede recalcularla desde el archivo publicado y compararla contra el nodo público, sin pedirnos permiso y sin creernos nada. Mantenerlo funcionando cuesta menos de un dólar al año.',
              })}
            </p>
            <p className="mt-4">
              <span className="eyebrow mr-3">{t({ en: 'Public node', es: 'Nodo público' })}</span>
              <a
                className="mono-data underline decoration-hairline-2 underline-offset-4 transition-colors hover:decoration-current"
                href={NODE_URL}
                rel="noreferrer"
                target="_blank"
              >
                {NODE_URL.replace('https://', '')}
              </a>
            </p>
          </div>
        </details>
      </Container>
    </section>
  );
}
