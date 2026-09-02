import { AnchorRibbon } from '@/components/AnchorRibbon';
import { Container, Reveal } from '@/components/primitives';
import { useT } from '@/lib/i18n';

/**
 * Restraint: a 2px lift and no glow. `translate` is listed alongside `transform`
 * because Tailwind v4's -translate-y-* sets the standalone `translate` property,
 * and a transform-only transition leaves the lift snapping instead of springing.
 */
const SPRING =
  'transition-[transform,translate,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] active:translate-y-0 active:duration-100';

const BUTTON = 'inline-flex items-center justify-center rounded-full px-7 py-3.5 font-medium';

/**
 * The first screen. One claim, one qualification, one place, two ways in, and
 * the ribbon — the only evidence on the screen and the only thing on the page
 * that is alive.
 *
 * Every vertical measure carries a vh term. The hero is worth nothing if the
 * ribbon falls below the fold on a laptop, so the rhythm compresses on a short
 * window and opens up on a tall one rather than being tuned for one height.
 */
export function Hero() {
  const t = useT();

  return (
    <section className="flex min-h-[100svh] flex-col justify-between pt-[clamp(7rem,15vh,10rem)] pb-[clamp(2rem,4vh,3.5rem)]">
      <Container className="flex flex-1 flex-col justify-center">
        <Reveal>
          {/*
           * display-1 sized on width alone runs to three lines and pushes the
           * ribbon off a laptop screen. The height term bounds the same scale by
           * the space actually available; the inline style is what guarantees it
           * wins over the utility's own font-size.
           */}
          <h1
            className="display-1"
            style={{ fontSize: 'clamp(2.75rem, min(9.5vw, 10.5vh), 8.5rem)' }}
          >
            {t({
              en: 'The public memory of Latin America.',
              es: 'La memoria pública de América Latina.',
            })}
          </h1>
        </Reveal>

        <Reveal delay={190}>
          {/*
           * What the memory holds, then what it buys the reader.
           *
           * Two sources rather than three: the published path and the field
           * path are the whole scope, and naming the verifier inside the second
           * carries "who vouched for it" without a third beat. An earlier draft
           * described only the daily mirror of what institutions publish, which
           * is one instrument out of six and made the registry sound like a
           * procurement scraper. The line before that was a three-part list
           * closing on "ningún gobierno puede editarlo", which had the breadth
           * but made the state the subject of our own first screen.
           */}
          <p className="lede mt-[clamp(1rem,3vh,2rem)] max-w-[46ch]">
            {t({
              en: 'A permanent record of public facts: what institutions publish, and what an accredited verifier confirms in the field.',
              es: 'Una memoria permanente de hechos públicos: lo que las instituciones publican y lo que alguien acreditado verifica en campo.',
            })}
          </p>
          <p className="lede mt-[clamp(0.5rem,1.5vh,1rem)] max-w-[46ch]">
            {t({
              en: 'Everything that enters is sealed the same day. Years later, anyone can check it without asking us and without taking our word for it.',
              es: 'Todo lo que entra queda sellado el mismo día. Años después, cualquiera puede comprobarlo sin pedirnos permiso ni creernos nada.',
            })}
          </p>
        </Reveal>

        <Reveal delay={280}>
          <p className="mt-[clamp(1.25rem,3.5vh,2.5rem)] text-[1.0625rem] font-medium tracking-[-0.014em] text-ink sm:text-xl">
            {t({ en: 'We start in Costa Rica.', es: 'Empezamos en Costa Rica.' })}
          </p>
        </Reveal>

        <Reveal delay={360}>
          <div className="mt-[clamp(1.5rem,4vh,3rem)] flex flex-wrap items-center gap-3">
            <a
              className={`${BUTTON} bg-ink text-[0.9375rem] text-ground hover:shadow-[0_10px_28px_rgba(10,10,11,0.16)] ${SPRING}`}
              href="#registro"
            >
              {t({ en: 'See the record', es: 'Ver el registro' })}
            </a>
            <a
              className={`${BUTTON} text-[0.9375rem] text-ink shadow-[inset_0_0_0_1px_var(--color-hairline-2)] hover:shadow-[inset_0_0_0_1px_var(--color-ink)] ${SPRING}`}
              href="#como-funciona"
            >
              {t({ en: 'How it works', es: 'Cómo funciona' })}
            </a>
          </div>
        </Reveal>
      </Container>

      <Reveal className="mt-[clamp(1.5rem,5vh,4rem)]" delay={480}>
        <AnchorRibbon />
      </Reveal>
    </section>
  );
}
