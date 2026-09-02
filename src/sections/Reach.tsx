import { IsthmusMap, STATUS_TEXT } from '@/components/IsthmusMap';
import { Container, Eyebrow, Mono, Reveal } from '@/components/primitives';
import { COUNTRIES } from '@/lib/content';
import { useT } from '@/lib/i18n';

const LIVE_COUNT = COUNTRIES.filter((country) => country.status === 'live').length;

/**
 * The regional ladder, stated as a ladder rather than as coverage.
 *
 * One country is running and five are not, and the section is built so that a
 * reader who takes in nothing but the map still comes away with that. The table
 * is the source of truth and the map decorates it, never the other way round.
 */
export function Reach() {
  const t = useT();

  return (
    <section className="py-24 sm:py-32" id="alcance">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <Eyebrow>{t({ en: 'Reach', es: 'Alcance' })}</Eyebrow>
            {/* A ratio rather than a sentence: it cannot be read as five more
                countries being close to ready. */}
            <Mono className="text-faint">
              {LIVE_COUNT}/{COUNTRIES.length} {t(STATUS_TEXT.live)}
            </Mono>
          </div>

          <h2 className="display-2 mt-6 max-w-[24ch] sm:max-w-[15ch]">
            {t({
              en: 'Costa Rica first. The isthmus next.',
              es: 'Costa Rica primero. El istmo después.',
            })}
          </h2>

          <p className="lede mt-7 max-w-[54ch]">
            {t({
              en: 'Costa Rica is where the instrument already runs. The rest of the isthmus has the same problem and the same data shape.',
              es: 'Costa Rica es donde el instrumento ya corre. El resto del istmo tiene el mismo problema y el mismo formato de datos.',
            })}
          </p>
        </Reveal>

        <Reveal className="card mt-14 p-6 sm:mt-16 sm:p-10" delay={90}>
          <IsthmusMap />

          <div className="mt-10 overflow-x-auto md:mt-12">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <caption className="sr-only">
                {t({
                  en: 'The six isthmus countries, their national procurement portal, and whether the registry runs there yet.',
                  es: 'Los seis países del istmo, su portal nacional de compras públicas y si el registro ya corre ahí.',
                })}
              </caption>
              <thead>
                <tr>
                  <th className="eyebrow pb-4 font-medium" scope="col">
                    {t({ en: 'Country', es: 'País' })}
                  </th>
                  <th className="eyebrow pb-4 font-medium" scope="col">
                    {t({ en: 'Portal', es: 'Portal' })}
                  </th>
                  <th className="eyebrow pb-4 text-right font-medium" scope="col">
                    {t({ en: 'Status', es: 'Estado' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COUNTRIES.map((country) => {
                  const live = country.status === 'live';
                  return (
                    <tr key={country.code}>
                      <th
                        className="rule py-4 pr-6 text-[1.0625rem] font-medium tracking-[-0.015em]"
                        scope="row"
                      >
                        {country.name}
                      </th>
                      <td className="rule py-4 pr-6">
                        <Mono className="text-muted">{country.portal}</Mono>
                      </td>
                      <td className="rule py-4 text-right">
                        {live ? (
                          <span className="inline-flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="inline-block size-1.5 rounded-full bg-confirmed"
                            />
                            <Mono className="text-confirmed-ink uppercase tracking-[0.12em]">
                              {t(STATUS_TEXT.live)}
                            </Mono>
                          </span>
                        ) : (
                          <Mono className="text-faint uppercase tracking-[0.12em]">
                            {t(STATUS_TEXT.planned)}
                          </Mono>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-8 max-w-[56ch] text-[0.9375rem] leading-relaxed text-muted">
            {t({
              en: 'Planned means exactly that. Outside Costa Rica nothing is running yet, and no record from any other country has been preserved.',
              es: 'Planeado significa exactamente eso. Fuera de Costa Rica todavía no corre nada, y no hay ningún registro de otro país preservado.',
            })}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
