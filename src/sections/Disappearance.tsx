import { Container, Reveal, Statement } from '@/components/primitives';
import { RepublicationTimeline } from '@/components/RepublicationTimeline';
import { ANCLA, REPUBLICATIONS } from '@/lib/content';
import { type Lang, useT } from '@/lib/i18n';

const MONTH_NAMES: Record<Lang, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
};

const NUMBER_WORDS: Record<Lang, string[]> = {
  en: [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
  ],
  es: [
    'cero',
    'un',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
  ],
};

/**
 * Dates run as ISO strings everywhere else on the page, but a sentence this size
 * cannot carry one. Written out by hand rather than through Intl so the server
 * render and the hydrated render cannot disagree over locale data.
 */
function longDate(iso: string, lang: Lang): string {
  const year = iso.slice(0, 4);
  const month = MONTH_NAMES[lang][Number(iso.slice(5, 7)) - 1] ?? '';
  const day = Number(iso.slice(8, 10));
  return lang === 'es' ? `${day} de ${month} de ${year}` : `${day} ${month} ${year}`;
}

function spell(n: number, lang: Lang): string {
  return NUMBER_WORDS[lang][n] ?? String(n);
}

const sentenceCase = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** The first republication in the survey; the initial 2022 load is excluded. */
const FIRST = REPUBLICATIONS[0];

/** The most recent republication: the one the statement is about. */
const LATEST = REPUBLICATIONS[REPUBLICATIONS.length - 1] ?? REPUBLICATIONS[0];

/**
 * The turn of the page. A statement, the evidence behind it, and the one thing
 * that changed. Every figure and date is read out of `content.ts` rather than
 * written into the copy, so the sentences cannot drift from the findings.
 */
export function Disappearance() {
  const t = useT();

  const opening = t({
    en: `On ${longDate(LATEST.date, 'en')}, ${spell(LATEST.months, 'en')} closed ${LATEST.months === 1 ? 'month' : 'months'} of the national procurement record ${LATEST.months === 1 ? 'was' : 'were'} rewritten.`,
    es: `El ${longDate(LATEST.date, 'es')}, ${spell(LATEST.months, 'es')} ${LATEST.months === 1 ? 'mes cerrado' : 'meses cerrados'} del registro nacional de compras públicas ${LATEST.months === 1 ? 'fue reescrito' : 'fueron reescritos'}.`,
  });

  return (
    <section aria-labelledby="desaparicion-verdicto" id="desaparicion">
      <Container>
        <Statement>
          {/* Three plain lines, then the weight. Staggered on entry, but they are
              one paragraph and read as one with the animation off. */}
          {/* Measure in rem, not ch: a ch on this wrapper resolves against the
              inherited 16px, not against the display size its children carry. */}
          <div className="max-w-[46rem] space-y-6 sm:space-y-8">
            <Reveal as="p" className="display-3" delay={0}>
              {opening}
            </Reveal>
            <Reveal as="p" className="display-3" delay={140}>
              {t({
                en: 'The version they replaced was not kept, so what changed cannot be recovered.',
                es: 'La versión que reemplazaron no se conservó, así que lo que cambió no se puede recuperar.',
              })}
            </Reveal>
          </div>

          <Reveal as="div" className="mt-14 sm:mt-20" delay={460}>
            {/* The verdict is the count, not a lament. "Ahora es imposible
                saberlo" restated the line above it in a more final voice; the
                number says the same thing and can be checked. */}
            <h2 className="display-2 max-w-[16ch]" id="desaparicion-verdicto">
              {t({
                en: `${sentenceCase(spell(ANCLA.silentlyRevisedMonths, 'en'))} closed months, rewritten this way since ${FIRST?.date.slice(0, 4)}.`,
                es: `${sentenceCase(spell(ANCLA.silentlyRevisedMonths, 'es'))} meses cerrados, reescritos así desde ${FIRST?.date.slice(0, 4)}.`,
              })}
            </h2>
          </Reveal>
        </Statement>
      </Container>

      <Container>
        <Reveal className="pb-28 sm:pb-36">
          <RepublicationTimeline />
        </Reveal>
      </Container>

      {/* Panel white rather than the warm ground: the closing line is its own
          screen, not the tail of the exhibit above it. */}
      <div className="bg-panel">
        <Container>
          <Statement>
            <Reveal as="p" className="display-2 max-w-[20ch]" delay={0}>
              {t({
                en: `Since ${longDate(ANCLA.liveSince, 'en')}, any later change is provable.`,
                es: `Desde el ${longDate(ANCLA.liveSince, 'es')}, cualquier cambio posterior queda demostrable.`,
              })}
            </Reveal>
          </Statement>
        </Container>
      </div>
    </section>
  );
}
