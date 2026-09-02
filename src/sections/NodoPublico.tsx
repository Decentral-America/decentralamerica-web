import { Mark } from '@/components/Logo';
import { Container, Eyebrow, Mono, Reveal } from '@/components/primitives';
import type { T } from '@/lib/i18n';
import { useT } from '@/lib/i18n';

/**
 * The requirements for holding a node, written as the section's substance.
 * There are no member institutions yet, so the standard is what we can honestly
 * publish — a grid of logos here would be the exact failure the project exists
 * to fix.
 */
const CRITERIA: { n: string; label: T; body: T }[] = [
  {
    body: {
      en: 'Running a node earns nothing. No payment, no fee, no return for holding the copy.',
      es: 'Operar un nodo no genera ingreso. No hay pago, no hay comisión y no hay retorno por sostener la copia.',
    },
    label: { en: 'No yield', es: 'Sin rendimiento' },
    n: '01',
  },
  {
    body: {
      en: 'The organization cannot be a party to, a supplier to, or a beneficiary of the facts its node records.',
      es: 'La organización no puede ser parte, proveedora ni beneficiaria de los hechos que su nodo registra.',
    },
    label: { en: 'No stake in what is witnessed', es: 'Sin interés en lo atestiguado' },
    n: '02',
  },
  {
    body: {
      en: 'Legal name, registration id and responsible person, all published. An anonymous node verifies nothing.',
      es: 'Nombre legal, cédula jurídica y persona responsable, publicados. Un nodo anónimo no verifica nada.',
    },
    label: { en: 'Published identity', es: 'Identidad publicada' },
    n: '03',
  },
  {
    body: {
      en: 'A complete copy of the record, continuous availability, and public notice before withdrawing.',
      es: 'Copia completa del registro, disponibilidad continua y aviso público antes de retirarse.',
    },
    label: { en: 'Operational commitment', es: 'Compromiso operativo' },
    n: '04',
  },
];

export function NodoPublico() {
  const t = useT();

  return (
    <section id="nodo-publico" className="py-24 sm:py-32 lg:py-40">
      <Container>
        <Reveal>
          <Eyebrow>{t({ en: 'Public Node', es: 'Nodo Público' })}</Eyebrow>
          <h2 className="display-2 mt-6 max-w-[15ch]">
            {t({
              en: 'The record cannot be kept by the people who appear in it.',
              es: 'El registro no lo puede guardar quien aparece en él.',
            })}
          </h2>
        </Reveal>

        <Reveal delay={80} className="mt-12 grid max-w-4xl gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-10">
          <p className="lede">
            {t({
              en: "A record that proves what a public institution did cannot sit in that same institution's custody, nor with anyone paid according to what the record says.",
              es: 'Un registro que prueba lo que hizo una institución pública no puede quedar bajo la custodia de esa misma institución, ni bajo la de nadie que cobre según lo que el registro diga.',
            })}
          </p>
          <p className="lede">
            {t({
              en: 'So the record is built to be held by organizations with no financial interest in what they witness: universities, professional colleges, newsrooms and chambers. The custodian institution runs the node, is paid nothing for it, and answers for it by name.',
              es: 'Por eso el registro está hecho para que lo sostengan organizaciones sin interés económico en lo que atestiguan: universidades, colegios profesionales, redacciones y cámaras. La institución custodia opera el nodo, no cobra por hacerlo y responde con su nombre.',
            })}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-24 grid items-center gap-12 sm:mt-32 lg:mt-40 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
            <blockquote className="max-w-[19ch]">
              <p className="display-2">
                {t({
                  en: 'Who holds the record is the entire question.',
                  es: 'Quién sostiene el registro es la pregunta entera.',
                })}
              </p>
            </blockquote>
            {/* The mark reads as the argument here rather than as branding: three
                arms meeting at one hub, three satellites around it. Kept at
                hairline weight so it stays a diagram and does not become a stamp. */}
            {/*
             * Solid ink faded at the element, never a translucent fill. The glyph
             * is three separate arms overlapping at the hub, so a fill carrying
             * its own alpha compounds there and prints a darker patch through the
             * middle of the mark. Fading the element composites it once.
             */}
            <Mark className="hidden h-56 w-56 shrink-0 text-ink opacity-[0.16] lg:block xl:h-72 xl:w-72" />
          </div>
        </Reveal>

        <Reveal className="mt-24 sm:mt-32 lg:mt-40">
          <h3 className="eyebrow">
            {t({ en: 'Criteria for holding a node', es: 'Criterios para sostener un nodo' })}
          </h3>
          <div className="mt-8 grid gap-x-12 gap-y-10 sm:mt-10 sm:grid-cols-2">
            {CRITERIA.map((c) => (
              <div key={c.n} className="rule pt-5">
                <Mono className="text-faint">{c.n}</Mono>
                <h4 className="mt-3 text-xl font-medium tracking-[-0.02em] sm:text-2xl">
                  {t(c.label)}
                </h4>
                <p className="mt-2.5 max-w-[44ch] text-[0.9375rem] leading-relaxed text-muted">
                  {t(c.body)}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* The honest empty state. No institution has taken a node yet, and the
            section says so rather than implying pending partners. */}
        <Reveal delay={60} className="mt-16 sm:mt-20">
          <div className="card p-8 sm:p-12 lg:p-16">
            <Eyebrow>{t({ en: 'Custodian network', es: 'Red de custodia' })}</Eyebrow>
            <h3 className="display-3 mt-5 max-w-[18ch]">
              {t({
                en: 'There is no custodian institution yet.',
                es: 'Todavía no hay ninguna institución custodia.',
              })}
            </h3>
            <p className="lede mt-6 max-w-[54ch]">
              {t({
                en: 'The network is open and the first outside node has not been assigned. When one exists, it will appear here with its name and the date it began holding the copy. Until then this list stays empty, and saying so is part of the method.',
                es: 'La red está abierta y el primer nodo externo no se ha asignado. Cuando exista, aparecerá acá con su nombre y la fecha en que empezó a sostener la copia. Mientras tanto esta lista está vacía, y decirlo es parte del método.',
              })}
            </p>
            <a
              href="/nodo"
              className="group mt-10 inline-flex items-center gap-3 text-lg font-medium tracking-[-0.02em] sm:text-xl"
            >
              <span className="underline decoration-hairline-2 decoration-1 underline-offset-[6px] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:decoration-ink">
                {t({ en: 'Be the first institution', es: 'Ser la primera institución' })}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
              >
                <path
                  d="M2 8h11M9 4l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
