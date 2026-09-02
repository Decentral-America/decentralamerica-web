import { ProgramCard } from '@/components/ProgramCard';
import { Container, Eyebrow, Reveal } from '@/components/primitives';
import { PROGRAMS } from '@/lib/content';
import { useT } from '@/lib/i18n';

/**
 * Nodo Público is the one entry that is different in kind: it is the custodian
 * network, not an instrument that writes records, so it is pulled out of the
 * grid and given its own divider and row.
 */
const CUSTODIAN_SLUG = 'nodo-publico';

const CUSTODIAN = PROGRAMS.find((p) => p.slug === CUSTODIAN_SLUG);
const INSTRUMENTS = PROGRAMS.filter((p) => p.slug !== CUSTODIAN_SLUG);

/**
 * The two live instruments lead, at full card size; the rest follow smaller.
 * Both groups keep content.ts order internally, so the split is derived from
 * `state` rather than from a hand-kept list that could drift from the source.
 */
const LEAD = INSTRUMENTS.filter((p) => p.state === 'live');
const REST = INSTRUMENTS.filter((p) => p.state !== 'live');

/** Cards arrive in sequence rather than as one block. */
const STEP = 80;

export function Programs() {
  const t = useT();

  return (
    <section id="registro" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <Reveal as="header" className="max-w-[54rem]">
          <Eyebrow>{t({ en: 'The memory', es: 'La memoria' })}</Eyebrow>
          <h2 className="display-2 mt-4">El Registro Público de Integridad</h2>
          {/*
           * Deliberately not "a later publication does not replace the earlier
           * one": most of what the memory holds was never published in the first
           * place. A cleaned beach and a verified organisation enter it the same
           * way a contract does, and the copy has to leave room for them.
           */}
          <p className="lede mt-6 max-w-[46rem]">
            {t({
              en: 'One permanent memory. Nothing that enters it is replaced later: what came before stays, dated, and the difference can be proven. Below are the instruments that write into it, and the network that keeps it.',
              es: 'Una sola memoria permanente. Nada de lo que entra se reemplaza después: lo anterior queda, con su fecha, y la diferencia se puede demostrar. Abajo están los instrumentos que escriben en ella, y la red que la custodia.',
            })}
          </p>
        </Reveal>

        <Reveal className="rule mt-16 pt-8 sm:mt-20">
          <h3 className="eyebrow">{t({ en: 'The instruments', es: 'Los instrumentos' })}</h3>
          <p className="mt-3 max-w-[44rem] text-[1.0625rem] leading-snug tracking-[-0.008em] text-muted">
            {t({
              en: 'Each covers one kind of public fact and records who verified it.',
              es: 'Cada uno cubre un tipo de hecho público y deja constancia de quién lo verificó.',
            })}
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:gap-6 lg:grid-cols-12">
          {LEAD.map((program, i) => (
            <Reveal
              key={program.slug}
              delay={i * STEP}
              className={i === 0 ? 'lg:col-span-7' : 'lg:col-span-5'}
            >
              <ProgramCard program={program} variant="featured" />
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:mt-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {REST.map((program, i) => (
            <Reveal
              key={program.slug}
              delay={(LEAD.length + i) * STEP}
              // An odd card would otherwise sit alone in half a two-column row.
              className={
                i === REST.length - 1 && REST.length % 2 === 1 ? 'sm:col-span-2 lg:col-span-1' : ''
              }
            >
              <ProgramCard program={program} />
            </Reveal>
          ))}
        </div>

        {CUSTODIAN ? (
          <>
            <Reveal className="rule mt-16 pt-8 sm:mt-20">
              <h3 className="eyebrow">{t({ en: 'Custody', es: 'La custodia' })}</h3>
              <p className="mt-3 max-w-[44rem] text-[1.0625rem] leading-snug tracking-[-0.008em] text-muted">
                {t({
                  en: 'Who holds the record when the government changes.',
                  es: 'Quién guarda el registro cuando cambia el gobierno.',
                })}
              </p>
            </Reveal>
            <Reveal className="mt-8">
              <ProgramCard program={CUSTODIAN} variant="custodian" />
            </Reveal>
          </>
        ) : null}
      </Container>
    </section>
  );
}
