import { Container, Eyebrow, Mono, Reveal } from '@/components/primitives';
import { COUNTRIES } from '@/lib/content';
import type { T } from '@/lib/i18n';
import { useT } from '@/lib/i18n';

/** Counted from the source of truth so the copy cannot drift from the map. */
const PLANNED = COUNTRIES.filter((c) => c.status === 'planned').length;
const LIVE = COUNTRIES.filter((c) => c.status === 'live').length;

const DOORS: { n: string; href: string; title: T; line: T }[] = [
  {
    href: '/verificar',
    line: {
      en: 'Paste an id or a file and check whether it matches the anchored copy.',
      es: 'Pegá un identificador o un archivo y comprobá si coincide con la copia anclada.',
    },
    n: '01',
    title: { en: 'Verify a record', es: 'Verificá un registro' },
  },
  {
    href: '/organizaciones',
    line: {
      en: 'Get listed in the organization registry, next to whoever vouched for you.',
      es: 'Quedá inscrita en el registro de organizaciones, junto a quién respondió por vos.',
    },
    n: '02',
    title: { en: 'Add your organization', es: 'Sumá tu organización' },
  },
  {
    href: '/nodo',
    line: {
      en: 'Hold a complete copy. No yield, and no stake in what you witness.',
      es: 'Sostené una copia completa. Sin rendimiento y sin interés en lo que atestigües.',
    },
    n: '03',
    title: { en: 'Run a node', es: 'Operá un nodo' },
  },
  {
    href: '/financiar',
    line: {
      en: `${LIVE} national portals are live. ${PLANNED} more are planned.`,
      es: `${LIVE} portales nacionales están en línea. Otros ${PLANNED} están planificados.`,
    },
    n: '04',
    title: { en: 'Fund a country', es: 'Financiá un país' },
  },
];

export function Doors() {
  const t = useT();

  return (
    <section id="puertas" className="py-24 sm:py-32 lg:py-40">
      <Container>
        <Reveal>
          <Eyebrow>{t({ en: 'Ways in', es: 'Cómo entrar' })}</Eyebrow>
          <h2 className="display-2 mt-6 max-w-[14ch]">
            {t({ en: 'Four ways in.', es: 'Cuatro maneras de entrar.' })}
          </h2>
          <p className="lede mt-6 max-w-[40ch]">
            {t({
              en: 'All four lead to the same record.',
              es: 'Las cuatro llevan al mismo registro.',
            })}
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-14 sm:mt-20">
          {DOORS.map((d) => (
            <a
              key={d.n}
              href={d.href}
              className="group -mx-6 block rule px-6 py-10 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] last:border-b last:border-hairline hover:bg-ground-2 sm:py-12 lg:-mx-12 lg:px-12 lg:py-14"
            >
              <div className="grid gap-x-8 gap-y-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 sm:grid-cols-[3rem_1fr_auto] sm:items-baseline">
                <Mono className="text-faint">{d.n}</Mono>
                <div>
                  <h3 className="display-3">{t(d.title)}</h3>
                  <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-muted sm:text-lg">
                    {t(d.line)}
                  </p>
                </div>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="hidden h-4 w-4 self-center text-faint transition-[transform,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 group-hover:text-ink sm:block"
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
              </div>
            </a>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
