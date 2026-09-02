import { Mono } from '@/components/primitives';
import type { Program, ProgramState } from '@/lib/content';
import { type T, useT } from '@/lib/i18n';

/**
 * `custodian` is Nodo Público. It does not write records into the registry, it
 * holds them, so it gets a wide horizontal card instead of a slot in the
 * instrument grid.
 */
export type ProgramCardVariant = 'custodian' | 'featured' | 'standard';

/**
 * The chip is the only colour the card carries. --color-confirmed is reserved
 * for confirmed state, so nothing but `live` reaches for it and the rest sit on
 * the ground tone at ink or muted.
 */
const CHIP: Record<ProgramState, { label: T; tone: string }> = {
  built: { label: { en: 'built', es: 'construido' }, tone: 'bg-ground-2 text-ink' },
  live: { label: { en: 'live', es: 'activo' }, tone: 'bg-confirmed-wash text-confirmed-ink' },
  opening: { label: { en: 'opening', es: 'abriendo' }, tone: 'bg-ground-2 text-muted' },
  ready: { label: { en: 'ready', es: 'listo' }, tone: 'bg-ground-2 text-muted' },
};

/**
 * Tailwind's translate utilities set the `translate` property, which `card-lift`
 * does not transition, so the rise is written as a plain `transform`. The
 * :hover / :focus-visible specificity is also what lets the bloom beat the
 * `card` utility's own box-shadow regardless of stylesheet order. A rise and a
 * shadow only: no scale, no tilt.
 */
const LIFT = [
  'hover:[transform:translateY(-4px)]',
  'focus-visible:[transform:translateY(-4px)]',
  'hover:shadow-[0_2px_6px_rgba(10,10,11,0.05),0_18px_40px_rgba(10,10,11,0.09),0_0_0_1px_rgba(10,10,11,0.06)]',
].join(' ');

const CHIP_BASE =
  'inline-flex items-center rounded-full pt-1 pr-2 pb-1 pl-2.5 font-mono text-[0.6875rem] font-medium uppercase leading-none tracking-[0.14em]';

export function ProgramCard({
  program,
  variant = 'standard',
}: {
  program: Program;
  variant?: ProgramCardVariant;
}) {
  const t = useT();
  const chip = CHIP[program.state];
  const custodian = variant === 'custodian';
  const large = custodian || variant === 'featured';

  const name = (
    <h4
      className={
        large
          ? 'display-3'
          : 'text-[1.55rem] font-bold leading-[1.1] tracking-[-0.028em] sm:text-[1.75rem]'
      }
    >
      {program.name}
    </h4>
  );

  const records = (
    <p
      className={
        large
          ? 'mt-3 text-lg leading-snug tracking-[-0.014em] sm:text-xl'
          : 'mt-2.5 text-[1.0625rem] leading-snug tracking-[-0.008em]'
      }
    >
      {t(program.records)}
    </p>
  );

  // The custodian card puts the detail in its own column, where the grid gap
  // already supplies the space the stacked cards need above it.
  const detail = (
    <p
      className={`leading-relaxed text-muted ${
        large ? 'text-[0.9375rem] sm:text-base' : 'mt-3 text-sm'
      } ${large && !custodian ? 'mt-4' : ''}`}
    >
      {t(program.detail)}
    </p>
  );

  const metric = program.metric ? (
    <div className="mt-auto pt-6">
      <div className="rule pt-4">
        <Mono className="text-faint">{t(program.metric)}</Mono>
      </div>
    </div>
  ) : null;

  return (
    <a
      href={`/programa/${program.slug}`}
      className={`group card card-lift flex h-full flex-col text-ink no-underline ${LIFT} ${
        custodian ? 'p-7 sm:p-10' : large ? 'p-7 sm:p-9' : 'p-6 sm:p-7'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`${CHIP_BASE} ${chip.tone}`}>{t(chip.label)}</span>
        <span
          aria-hidden="true"
          className="text-faint transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[transform:translateX(4px)]"
        >
          &#8594;
        </span>
      </div>

      {custodian ? (
        <div className="mt-7 grid gap-6 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            {name}
            {records}
          </div>
          <div className="flex flex-col md:col-span-7 md:border-l md:border-hairline md:pl-12">
            {detail}
            {metric}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-1 flex-col">
          {name}
          {records}
          {detail}
          {metric}
        </div>
      )}
    </a>
  );
}
