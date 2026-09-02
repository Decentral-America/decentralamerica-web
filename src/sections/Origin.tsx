import { Container, Eyebrow, Reveal, Statement } from '@/components/primitives';
import { useT } from '@/lib/i18n';

export function Origin() {
  const t = useT();

  return (
    <Statement id="origen">
      <Container>
        <Reveal className="grid gap-x-16 gap-y-10 lg:grid-cols-[auto_1fr]">
          {/* The date is a counterweight to the display type, not information:
              the first beat already says 1948, so AT would hear it twice. */}
          <p
            aria-hidden="true"
            className="font-mono text-[clamp(3rem,8vw,6.5rem)] text-faint leading-none tracking-[-0.04em] tabular-nums"
          >
            1948
          </p>

          <div className="lg:border-hairline lg:border-l lg:pl-16">
            <Eyebrow className="mb-7">{t({ en: 'Origin', es: 'Origen' })}</Eyebrow>
            <p className="display-3 max-w-[24ch]">
              {t({
                en: 'In 1948 Costa Rica abolished its army and put the budget into schools.',
                es: 'En 1948 Costa Rica abolió su ejército y puso el presupuesto en escuelas.',
              })}
            </p>
            <p className="lede mt-8 max-w-[50ch]">
              {t({
                en: 'It was a bet that a society can hold together without an institution to compel it.',
                es: 'Fue una apuesta a que una sociedad puede sostenerse sin una institución que la obligue.',
              })}
            </p>
          </div>

          {/* The hairline is the whole transition. The third beat then takes the
              full width the first two were denied. */}
          <h2 className="rule display-2 pt-12 lg:col-span-2">
            {t({
              en: 'Seventy-eight years later, we are making the same bet with public information.',
              es: 'Setenta y ocho años después, hacemos la misma apuesta con la información pública.',
            })}
          </h2>
        </Reveal>
      </Container>
    </Statement>
  );
}
