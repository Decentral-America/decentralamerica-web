import type { ReactNode } from 'react';
import { Mark } from '@/components/Logo';
import {
  FaqSection,
  RelatedPages,
  StickyCta,
  Takeaways,
} from '@/components/PageExtras';
import { Container, Eyebrow, Mono, Reveal } from '@/components/primitives';
import { ANCLA, CGR, COUNTRIES } from '@/lib/content';
import { useNum, useT } from '@/lib/i18n';

function Section({
  children,
  eyebrow,
  id,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <Reveal as="section" className="rule mt-20 scroll-mt-24 pt-10 sm:mt-28 sm:pt-12" id={id}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="display-3 mt-4 max-w-[24ch]">{title}</h2>
      <div className="mt-8 max-w-[46rem]">{children}</div>
    </Reveal>
  );
}

const P = 'text-[1.0625rem] leading-relaxed text-muted sm:text-lg';

/**
 * Spanish writes 3,04 where English writes 3.04. Done by hand for the same
 * reason fmtNumber avoids Intl: the prerender and the browser must not disagree
 * over locale data on a figure the page is arguing from.
 */

/** Read from the source of truth so the page cannot claim a presence the registry does not have. */
const TARGETS = COUNTRIES.filter((country) => country.status === 'planned');

const COST = { en: `$${ANCLA.runningCostUsdPerYear}`, es: `US$${ANCLA.runningCostUsdPerYear}` };

/**
 * The funding page.
 *
 * Its argument, and the only reason a funder should believe the rest of it:
 * running the instrument costs almost nothing, so the money buys the work of
 * building it for a country and nothing else. A page that is honest about where
 * the money goes can afford to be believed about what the instrument does.
 */
export default function Financiar() {
  const t = useT();
  const num = useNum();

  return (
    <Container className="pt-[clamp(7rem,14vh,10rem)] pb-32">
      <Reveal as="header" className="max-w-[52rem]">
        <Eyebrow>{t({ en: 'Fund a country', es: 'Financiar un país' })}</Eyebrow>
        <h1 className="display-2 mt-5">
          {t({
            en: "Building a country's memory costs money. Keeping it does not.",
            es: 'Construir la memoria de un país cuesta. Mantenerla no.',
          })}
        </h1>
        <p className="lede mt-7 max-w-[46ch]">
          {t({
            en: 'Costa Rica and Panamá are live. Four more national procurement portals are named and not started. This page says what the money buys, what it does not, and what happened to the attempts like this one.',
            es: 'Costa Rica y Panamá están en línea. Otros cuatro portales nacionales de compras públicas están nombrados y sin empezar. Esta página dice qué compra el dinero, qué no compra y qué pasó con los intentos parecidos a este.',
          })}
        </p>
      </Reveal>

        <Takeaways cta={{ href: '#empezar', label: { en: 'Start a conversation', es: 'Empezar una conversación' } }} path="/financiar" />

      {/*
       * A funder arrives with one question already formed — the price, the
       * precedent, or what they would be signing — and the index is for them
       * rather than for a reader taking the argument from the top.
       */}
      <Reveal
        as="nav"
        aria-label={t({ en: 'On this page', es: 'En esta página' })}
        className="mt-14"
      >
        <h2 className="eyebrow">{t({ en: 'On this page', es: 'En esta página' })}</h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {(
            [
              ['que-compra', { en: 'What it buys', es: 'Qué compra' }],
              ['un-pais', { en: 'One finished country', es: 'Un país terminado' }],
              ['siguiente', { en: 'Which is next', es: 'Cuál sigue' }],
              ['precedente', { en: 'The precedent', es: 'El precedente' }],
              ['retorno', { en: 'What you get back', es: 'Qué recibe' }],
              ['limites', { en: 'The limits', es: 'Los límites' }],
              ['empezar', { en: 'How it starts', es: 'Cómo empieza' }],
            ] as const
          ).map(([id, label]) => (
            <li key={id}>
              <a
                className="text-[0.9375rem] text-muted underline-offset-4 transition-colors duration-300 hover:text-ink hover:underline"
                href={`#${id}`}
              >
                {t(label)}
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      {/*
       * The core of the page. A funder who is told plainly that the running cost
       * is a rounding error, and that they are paying for people reading a
       * portal's documentation, has a reason to believe the harder claims below.
       */}
      <Section
        id="que-compra"
        eyebrow={t({ en: 'The cost', es: 'El costo' })}
        title={t({ en: 'What the money buys', es: 'Qué compra el dinero' })}
      >
        <p className={P}>
          {t({
            en: 'Start with the awkward part. Keeping the Costa Rican instrument running costs under',
            es: 'Empecemos por lo incómodo. Sostener el instrumento costarricense cuesta menos de',
          })}{' '}
          <Mono className="text-ink">{t(COST)}</Mono>{' '}
          {t({
            en: 'a year, once it is built. That is not a promotional figure. Sealing one fingerprint a day in a public record is a cheap operation and it will stay cheap.',
            es: 'al año, una vez construido. No es una cifra promocional. Sellar una huella diaria en un registro público es una operación barata y va a seguir siéndolo.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'What costs money is bringing in a country that is not in yet. That work is people, and it happens once.',
            es: 'Lo que cuesta es traer un país que todavía no está. Ese trabajo es de personas, y ocurre una sola vez.',
          })}
        </p>

        <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-hairline">
          {(
            [
              {
                en: 'Find the bulk source the country already publishes, and confirm it can be downloaded whole.',
                es: 'Encontrar la fuente masiva que el país ya publica, y comprobar que se puede descargar entera.',
              },
              {
                en: 'Mirror its entire history, not only what is current.',
                es: 'Replicar toda su historia, no solo lo vigente.',
              },
              {
                en: "Write a canonicalizer for that country's schema: the rules that reduce its records to one exact form, so that two people computing the fingerprint separately get the same answer.",
                es: 'Escribir un canonicalizador para el esquema de ese país: las reglas que llevan sus registros a una forma exacta, de modo que dos personas que calculen la huella por separado obtengan lo mismo.',
              },
              {
                en: 'Establish the baseline, which becomes the earliest state of that record anyone will ever be able to prove.',
                es: 'Establecer la línea base, que pasa a ser el estado más antiguo de ese registro que alguien pueda demostrar.',
              },
              {
                en: 'Leave the daily anchoring running.',
                es: 'Dejar el anclaje diario en marcha.',
              },
              {
                en: 'Publish the verifier, so that anyone can recompute it for themselves without asking us for anything.',
                es: 'Publicar el verificador, para que cualquiera pueda recalcularlo por su cuenta sin pedirnos nada.',
              },
            ] as const
          ).map((step, i) => (
            <li className="flex gap-5 bg-ground px-6 py-5" key={step.en}>
              <Mono className="pt-1 text-faint">{String(i + 1).padStart(2, '0')}</Mono>
              <span className="text-[1.0625rem] leading-relaxed text-ink">{t(step)}</span>
            </li>
          ))}
        </ol>

        <p className={`${P} mt-8`}>
          {t({
            en: "That is people's time: reading a portal's documentation, arguing about its schema, and checking a mirror against the source it came from. It is not servers. A funder here is paying for the work, and we are not going to dress it up as infrastructure.",
            es: 'Eso es tiempo de personas: leer la documentación de un portal, discutir su esquema y comparar una réplica contra la fuente de la que salió. No son servidores. Quien financia acá está pagando el trabajo, y no vamos a disfrazarlo de infraestructura.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          <strong className="font-medium text-ink">
            {t({ en: 'This page publishes no price.', es: 'Esta página no publica un precio.' })}
          </strong>{' '}
          {t({
            en: 'Every national source is different, and a number written before reading the one in question would be an invented number. A costed proposal for a specific country is available on request.',
            es: 'Cada fuente nacional es distinta, y un número escrito antes de leer la que corresponda sería un número inventado. Hay una propuesta con costos para un país concreto a pedido.',
          })}
        </p>
      </Section>

      <Section
        id="un-pais"
        eyebrow={t({ en: 'The deliverable', es: 'El entregable' })}
        title={t({
          en: 'What one finished country looks like',
          es: 'Cómo se ve un país terminado',
        })}
      >
        <p className={P}>
          {t({
            en: 'Costa Rica is the only one finished, so it is the only shape we can show.',
            es: 'Costa Rica es el único terminado, así que es la única forma que podemos mostrar.',
          })}
        </p>

        <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          <div>
            <dt className="eyebrow">{t({ en: 'History mirrored', es: 'Historia replicada' })}</dt>
            <dd className={`${P} mt-2`}>
              <Mono className="text-ink">{num(ANCLA.monthlyArchives)}</Mono>{' '}
              {t({ en: 'monthly archives, from', es: 'archivos mensuales, de' })}{' '}
              <Mono className="text-ink">{ANCLA.coverage.from}</Mono> {t({ en: 'to', es: 'a' })}{' '}
              <Mono className="text-ink">{ANCLA.coverage.to}</Mono>.
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{t({ en: 'Records', es: 'Registros' })}</dt>
            <dd className={`${P} mt-2`}>
              {t({ en: 'Approximately', es: 'Aproximadamente' })}{' '}
              <Mono className="text-ink">{num(ANCLA.rowsApprox)}</Mono>{' '}
              {t({ en: 'rows of the published record.', es: 'filas del registro publicado.' })}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{t({ en: 'Actors resolved', es: 'Actores resueltos' })}</dt>
            <dd className={`${P} mt-2`}>
              <Mono className="text-ink">{num(ANCLA.resolvedActors)}</Mono>{' '}
              {t({
                en: 'unique institution and supplier identities across the whole archive.',
                es: 'identidades únicas de instituciones y proveedores en todo el archivo.',
              })}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{t({ en: 'Size', es: 'Tamaño' })}</dt>
            <dd className={`${P} mt-2`}>
              <Mono className="text-ink">{num(ANCLA.archiveGb)} GB</Mono>{' '}
              {t({ en: 'for the complete mirror.', es: 'para la réplica completa.' })}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{t({ en: 'Live since', es: 'En línea desde' })}</dt>
            <dd className={`${P} mt-2`}>
              <Mono className="text-ink">{ANCLA.liveSince}</Mono>.
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{t({ en: 'Running cost', es: 'Costo de operación' })}</dt>
            <dd className={`${P} mt-2`}>
              {t({ en: 'Under', es: 'Menos de' })} <Mono className="text-ink">{t(COST)}</Mono>{' '}
              {t({ en: 'a year.', es: 'al año.' })}
            </dd>
          </div>
        </dl>

        <p className={`${P} mt-9`}>
          {t({
            en: 'The work has already produced a finding in Costa Rica:',
            es: 'El trabajo ya produjo un hallazgo en Costa Rica:',
          })}{' '}
          <Mono className="text-ink">{num(ANCLA.silentlyRevisedMonths)}</Mono>{' '}
          {t({
            en: 'closed months of the national record had been rewritten after their own month end, with no public notice of what changed. The Internet Archive held',
            es: 'meses cerrados del registro nacional habían sido reescritos después del cierre de su propio mes, sin aviso público de qué cambió. El Internet Archive tenía',
          })}{' '}
          <Mono className="text-ink">{num(ANCLA.internetArchiveCaptures)}</Mono>{' '}
          {t({
            en: 'captures of those archives, so there was nothing to compare against and the baseline had to be built from scratch. That is what a country buys: not a dashboard, a baseline that did not exist before.',
            es: 'capturas de esos archivos, así que no había con qué comparar y la línea base hubo que construirla desde cero. Eso es lo que compra un país: no un tablero, sino una línea base que antes no existía.',
          })}
        </p>

        {/* The daily job is written and works but is not yet on a timer. Saying
            so on the page asking for money is the whole method. */}
        <p className={`${P} mt-5`}>
          <strong className="font-medium text-ink">
            {t({ en: 'One correction, ours.', es: 'Una corrección, nuestra.' })}
          </strong>{' '}
          {t({
            en: 'In Costa Rica the daily process is written and tested, but it does not yet run on a timer. Until it does, the anchoring is not a daily series, and we would rather say that here than have a funder find it later.',
            es: 'En Costa Rica el proceso diario está escrito y probado, pero todavía no corre en un horario automático. Hasta que corra, el anclaje no es una serie diaria, y preferimos decirlo acá antes que un financiador lo descubra después.',
          })}
        </p>

        <p className={`${P} mt-5`}>
          {t({
            en: 'These are the Costa Rican figures, not a forecast. Another country starts in another year, holds a different number of rows and will produce different numbers. What repeats is the shape: full history mirrored, a canonicalizer, a baseline, daily anchoring, a public verifier.',
            es: 'Son las cifras de Costa Rica, no un pronóstico. Otro país empieza en otro año, tiene otra cantidad de filas y va a dar otras cifras. Lo que se repite es la forma: historia completa replicada, un canonicalizador, una línea base, anclaje diario y un verificador público.',
          })}
        </p>
      </Section>

      <Section
        id="siguiente"
        eyebrow={t({ en: 'The order', es: 'El orden' })}
        title={t({ en: 'Which country is next', es: 'Cuál país sigue' })}
      >
        <p className={P}>
          {t({
            en: 'We have not decided, and saying otherwise would be a sales line. The order is set by whoever funds first.',
            es: 'No lo hemos decidido, y decir lo contrario sería una línea de venta. El orden lo fija quien financie primero.',
          })}
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left">
            <caption className="sr-only">
              {t({
                en: 'The five national procurement portals where no work has started.',
                es: 'Los cinco portales nacionales de compras públicas donde no se ha empezado.',
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
              {TARGETS.map((country) => (
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
                    <Mono className="text-faint uppercase tracking-[0.12em]">
                      {t({ en: 'not started', es: 'sin empezar' })}
                    </Mono>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={`${P} mt-8`}>
          {t({
            en: 'Elsewhere on this site the same status is called planned. It means this: Costa Rica and Panamá are running, and no record from the other four has been preserved.',
            es: 'En el resto del sitio ese mismo estado se llama planeado. Significa esto: Costa Rica y Panamá corren, y de los otros cuatro no hay ningún registro preservado.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'The portals are named because they exist and can be checked in a minute. Beyond the name we have published no assessment of any of them, and we are not going to describe a source we have not read.',
            es: 'Los portales están nombrados porque existen y se pueden comprobar en un minuto. Más allá del nombre no hemos publicado una evaluación de ninguno, y no vamos a describir una fuente que no hemos leído.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'The first question is the same in every case, and it is cheap to answer: does the portal publish its full history, and can it be mirrored? That answer can be produced, and published, before anyone commits to the rest.',
            es: 'La primera pregunta es la misma en todos los casos, y es barata de responder: ¿el portal publica su historia completa y se puede replicar? Esa respuesta se puede obtener, y publicar, antes de que nadie comprometa el resto.',
          })}
        </p>
      </Section>

      {/*
       * The base rate. A funder who has seen two of these die knows the odds
       * already; the page is worth more for naming them first than for any
       * argument that follows.
       */}
      <Section
        id="precedente"
        eyebrow={t({ en: 'The base rate', es: 'La tasa base' })}
        title={t({
          en: 'What happened to the attempts before this',
          es: 'Qué pasó con los intentos anteriores',
        })}
      >
        <p className={P}>
          {t({
            en: 'There have been three comparable attempts to seal a public procurement record this way. Two died at pilot: Colombia, with the World Economic Forum and the Inter-American Development Bank, and Aragón, in Spain. One reached production: Peru.',
            es: 'Hubo tres intentos comparables de sellar un registro de compras públicas de esta manera. Dos murieron en piloto: el de Colombia, con el Foro Económico Mundial y el Banco Interamericano de Desarrollo, y el de Aragón, en España. Uno llegó a producción: el de Perú.',
          })}
        </p>
        <p className="mt-8 text-xl leading-snug font-medium tracking-[-0.02em] text-ink sm:text-2xl">
          {t({
            en: 'One in three. That is the rate we are arguing against.',
            es: 'Uno de cada tres. Esa es la tasa contra la que argumentamos.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'Hiding it from someone deciding whether to fund the fourth would be a strange way to begin. Three things are different here, and none of them is enthusiasm.',
            es: 'Ocultársela a alguien que está decidiendo si financia el cuarto sería una manera rara de empezar. Hay tres diferencias, y ninguna es el entusiasmo.',
          })}
        </p>

        <div className="mt-9 space-y-8">
          <div>
            <h3 className="text-lg font-bold tracking-[-0.02em]">
              {t({ en: 'It is already running.', es: 'Este ya corre.' })}
            </h3>
            <p className={`${P} mt-3`}>
              {t({
                en: 'Costa Rica is not a proposal. The instrument has been in production since',
                es: 'Costa Rica no es una propuesta. El instrumento está en producción desde el',
              })}{' '}
              <Mono className="text-ink">{ANCLA.liveSince}</Mono>{' '}
              {t({
                en: 'and anyone can query it today. What funding buys is the second country, not the first proof that the method works.',
                es: 'y cualquiera puede consultarlo hoy. Lo que se financia es el segundo país, no la primera prueba de que el método funciona.',
              })}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-[-0.02em]">
              {t({
                en: 'The claim is narrow on purpose.',
                es: 'La afirmación es angosta a propósito.',
              })}
            </h3>
            <p className={`${P} mt-3`}>
              {t({
                en: 'We are not promising less corruption or a faster procedure. The instrument demonstrates one thing: that a published record did or did not change from the moment it was anchored. A small promise is a promise that can be kept, and the pilots that died were not killed by their engineering.',
                es: 'No prometemos menos corrupción ni un trámite más rápido. El instrumento demuestra una sola cosa: que un registro publicado cambió o no cambió a partir del momento en que se ancló. Una promesa pequeña es una promesa que se puede cumplir, y a los pilotos que murieron no los mató su ingeniería.',
              })}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-[-0.02em]">
              {t({
                en: 'It does not need the money to keep arriving.',
                es: 'No necesita que el dinero siga llegando.',
              })}
            </h3>
            <p className={`${P} mt-3`}>
              {t({
                en: 'A pilot usually dies when the pilot budget ends. This costs under',
                es: 'Un piloto suele morir cuando termina el presupuesto del piloto. Esto cuesta menos de',
              })}{' '}
              <Mono className="text-ink">{t(COST)}</Mono>{' '}
              {t({
                en: 'a year to run, so the end of a grant does not switch off what was built. What it does need is a person who notices if the daily process stops. That is the real recurring cost, and it is attention rather than money.',
                es: 'al año, así que el final de un financiamiento no apaga lo que ya se construyó. Lo que sí necesita es alguien que note si el proceso diario se detiene. Ese es el costo recurrente real, y es atención antes que dinero.',
              })}
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="retorno"
        eyebrow={t({ en: 'The exchange', es: 'El intercambio' })}
        title={t({ en: 'What a funder gets back', es: 'Qué recibe quien financia' })}
      >
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow text-confirmed-ink">{t({ en: 'It gives', es: 'Da' })}</h3>
            <ul className={`${P} mt-4 space-y-3`}>
              {(
                [
                  {
                    en: 'A national record mirrored whole, with its history, and a baseline that did not exist before.',
                    es: 'Un registro nacional replicado entero, con su historia, y una línea base que antes no existía.',
                  },
                  {
                    en: "The findings, published, whatever they say. Costa Rica's were published that way.",
                    es: 'Los hallazgos, publicados, digan lo que digan. Los de Costa Rica se publicaron así.',
                  },
                  {
                    en: 'A verifier anyone can use without permission, naming who paid for it to exist.',
                    es: 'Un verificador que cualquiera puede usar sin permiso, con el nombre de quien pagó para que exista.',
                  },
                  {
                    en: 'An instrument the funder does not control, and neither do we.',
                    es: 'Un instrumento que quien financia no controla, y nosotros tampoco.',
                  },
                ] as const
              ).map((x) => (
                <li key={x.en}>{t(x)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow">{t({ en: 'It does not give', es: 'No da' })}</h3>
            <ul className={`${P} mt-4 space-y-3`}>
              {(
                [
                  {
                    en: 'Any say over the findings. If the record you funded comes out badly, it is published anyway.',
                    es: 'Ninguna voz sobre los hallazgos. Si el registro que financió sale mal parado, se publica igual.',
                  },
                  {
                    en: 'Exclusivity. The archive and the verifier are public, and another funder can pay for another country tomorrow.',
                    es: 'Exclusividad. El archivo y el verificador son públicos, y otro financiador puede pagar otro país mañana.',
                  },
                  {
                    en: 'A claim about corruption, efficiency or money saved. The instrument measures none of that.',
                    es: 'Una afirmación sobre corrupción, eficiencia o ahorro. El instrumento no mide nada de eso.',
                  },
                  {
                    en: 'A seat inside a government. Mirroring what a state already publishes needs no agreement with it, and we do not ask for one.',
                    es: 'Un lugar dentro de un gobierno. Replicar lo que un Estado ya publica no exige un convenio con él, y no lo pedimos.',
                  },
                ] as const
              ).map((x) => (
                <li key={x.en}>{t(x)}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xl leading-snug font-medium tracking-[-0.02em] text-ink sm:text-2xl">
          {t({
            en: 'A record its funder can edit proves nothing.',
            es: 'Un registro que su financiador puede editar no demuestra nada.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'The instrument has to be useless to whoever paid for it in that one specific sense. It is the same reason custody of the memory sits with institutions that have nothing to gain from what it says.',
            es: 'El instrumento tiene que ser inútil para quien lo pagó en ese sentido específico. Es la misma razón por la que la custodia de la memoria queda en instituciones que no ganan nada con lo que dice.',
          })}
        </p>
      </Section>

      <Section
        id="limites"
        eyebrow={t({ en: 'The limits', es: 'Los límites' })}
        title={t({ en: 'What it does not prove', es: 'Qué no demuestra' })}
      >
        <p className={P}>
          {t({
            en: 'The instrument proves that a published record did or did not change from the moment of anchoring forward. It does not prove the record is accurate. It says nothing about what happened before the first anchor. It does not detect corruption. And it cannot see anything that was never published.',
            es: 'El instrumento demuestra que un registro publicado cambió o no cambió a partir del momento en que se ancló. No demuestra que el registro sea correcto. No dice nada sobre lo anterior al primer anclaje. No detecta corrupción. Y no ve nada de lo que nunca se publicó.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'That last limit is not theoretical. The Contraloría General de la República reported that',
            es: 'Ese último límite no es teórico. La Contraloría General de la República reportó que el',
          })}{' '}
          <Mono className="text-ink">{num(CGR.outsideSicopPct2021)}%</Mono>{' '}
          {t({
            en: 'of awarded procurement resources',
            es: 'de los recursos adjudicados en compras públicas',
          })}{' '}
          {'('}
          <Mono className="text-ink">
            ₡{num(CGR.outsideSicopMillionsColones)} {t({ en: 'million', es: 'millones' })}
          </Mono>
          {') '}
          {t({
            en: 'moved outside the national system, and that only',
            es: 'se movió fuera del sistema nacional, y que solo',
          })}{' '}
          <Mono className="text-ink">{num(CGR.institutionsUsingFullSicop.used)}</Mono>{' '}
          {t({ en: 'of', es: 'de' })}{' '}
          <Mono className="text-ink">{num(CGR.institutionsUsingFullSicop.of)}</Mono>{' '}
          {t({
            en: 'institutions used it in full. That is a share of resources, never a share of contracts. An instrument that works on the published record sees none of it, and funding one does not fix it.',
            es: 'instituciones lo usaban de forma completa. Es una cuota de recursos, nunca una cuota de contratos. Un instrumento que trabaja sobre el registro publicado no ve nada de eso, y financiarlo no lo arregla.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'For context, the 2025 OECD Digital Government Index, which measures digital maturity and not integrity, places Costa Rica at',
            es: 'Para contexto, el Índice de Gobierno Digital 2025 de la OCDE, que mide madurez digital y no integridad, ubica a Costa Rica en',
          })}{' '}
          <Mono className="text-ink">{num(CGR.oecdDigitalGovIndex2025.costaRica)}</Mono>{' '}
          {t({ en: 'against an average of', es: 'frente a un promedio de' })}{' '}
          <Mono className="text-ink">{num(CGR.oecdDigitalGovIndex2025.average)}</Mono>
          {t({
            en: '. That is the ground the instrument works on, and it does not change it.',
            es: '. Ese es el terreno sobre el que trabaja el instrumento, y no lo cambia.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'What it does instead is remove one specific escape: a record that has been anchored can no longer be quietly revised after the fact. That is a small thing, and it is the whole thing being funded.',
            es: 'Lo que sí hace es cerrar una salida específica: un registro anclado ya no se puede revisar en silencio después. Es algo pequeño, y es exactamente lo que se financia.',
          })}
        </p>
      </Section>

      <Section
        id="empezar"
        eyebrow={t({ en: 'Starting', es: 'Empezar' })}
        title={t({ en: 'How a conversation starts', es: 'Cómo empieza una conversación' })}
      >
        <p className={`${P} mb-8`}>
          {t({
            en: 'What follows is what we propose, not a procedure anyone has completed.',
            es: 'Lo que sigue es lo que proponemos, no un procedimiento que alguien ya haya recorrido.',
          })}
        </p>
        <ol className="grid gap-px overflow-hidden rounded-2xl bg-hairline">
          {(
            [
              {
                en: 'You tell us which country interests you, and why it is that one.',
                es: 'Usted nos dice qué país le interesa, y por qué ese.',
              },
              {
                en: 'We check whether its portal publishes its full history and whether it can be mirrored. That check is short, it happens before anyone commits anything, and the answer is published either way.',
                es: 'Revisamos si su portal publica la historia completa y si se puede replicar. Esa revisión es corta, ocurre antes de que nadie comprometa nada, y el resultado se publica sirva o no sirva.',
              },
              {
                en: 'If the source holds up, a costed proposal for that country: the work, who does it, how long it takes and what it costs. Written against that source, not from a template.',
                es: 'Si la fuente sirve, una propuesta con costos para ese país: el trabajo, quién lo hace, cuánto tarda y cuánto vale. Escrita sobre esa fuente, no sobre una plantilla.',
              },
              {
                en: "If it is funded, the work begins, and that country's baseline is established and published with the date it was set.",
                es: 'Si se financia, empieza el trabajo, y la línea base de ese país queda establecida y publicada con la fecha en que se fijó.',
              },
            ] as const
          ).map((step, i) => (
            <li className="flex gap-5 bg-ground px-6 py-5" key={step.en}>
              <Mono className="pt-1 text-faint">{String(i + 1).padStart(2, '0')}</Mono>
              <span className="text-[1.0625rem] leading-relaxed text-ink">{t(step)}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Honest empty state, as on the custody page. There are no funders. */}
      <Reveal className="mt-20 sm:mt-28">
        <div className="card grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="display-3 max-w-[18ch]">
              {t({
                en: 'The first country is open to fund.',
                es: 'El primer país está abierto para financiar.',
              })}
            </h2>
            <p className={`${P} mt-5 max-w-[46ch]`}>
              {t({
                en: 'Costa Rica was built without a funder, which is why this page can afford to be exact about what the money would do. When someone funds a country, they will appear here by name, with the date it began.',
                es: 'Costa Rica se construyó sin financiador, y por eso esta página se puede permitir ser exacta sobre qué haría el dinero. Cuando alguien financie un país, aparecerá acá con su nombre y la fecha en que empezó.',
              })}
            </p>
            <a
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[0.9375rem] font-medium text-ground transition-[transform,translate,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(10,10,11,0.16)]"
              href="mailto:info@decentralchain.io?subject=Financiar%20un%20pa%C3%ADs"
            >
              {t({ en: 'Start a conversation', es: 'Empezar una conversación' })}
            </a>
            <p className="mt-5 text-[0.9375rem] text-muted">
              {t({
                en: 'Or ask for a costed proposal for one country at',
                es: 'O pida una propuesta con costos para un país a',
              })}{' '}
              <a
                className="underline underline-offset-4 decoration-hairline-2 transition-colors hover:decoration-current"
                href="mailto:info@decentralchain.io?subject=Propuesta%20con%20costos"
              >
                <Mono className="text-ink">info@decentralchain.io</Mono>
              </a>
              .
            </p>
          </div>
          <Mark className="hidden h-44 w-44 shrink-0 text-ink opacity-[0.14] lg:block" />
        </div>
      </Reveal>

      {/* Where the numbers come from, including the ones we refuse to use. */}
      <Reveal className="mt-16">
        <details className="max-w-[46rem] border-t border-hairline pt-6">
          <summary className="eyebrow cursor-pointer text-ink">
            {t({ en: 'Where each figure comes from', es: 'De dónde sale cada cifra' })}
          </summary>
          <p className={`${P} mt-5`}>
            {t({
              en: 'The Costa Rican figures come from our own mirror and can be recomputed from the published archive by anyone who wants to check them. The procurement figures come from report DFOE-CAP-SGP-00005-2021 of the Contraloría General de la República, and the index from the 2025 OECD Digital Government Index.',
              es: 'Las cifras de Costa Rica salen de nuestra propia réplica y cualquiera que quiera comprobarlas puede recalcularlas desde el archivo publicado. Las cifras de compras públicas salen del informe DFOE-CAP-SGP-00005-2021 de la Contraloría General de la República, y el índice, del Índice de Gobierno Digital 2025 de la OCDE.',
            })}
          </p>
          <p className={`${P} mt-4`}>
            {t({
              en: 'Other figures about Costa Rican procurement circulate in the literature and do not survive contact with the sources they cite. We do not use them, here or anywhere else on this site, and we would rather lose an argument than win one with a number that breaks when someone checks it.',
              es: 'Circulan en la literatura otras cifras sobre compras públicas en Costa Rica que no resisten el contraste con las fuentes que citan. No las usamos, ni acá ni en ninguna otra parte del sitio, y preferimos perder una discusión antes que ganarla con un número que se rompe cuando alguien lo revisa.',
            })}
          </p>
        </details>
      </Reveal>

        <FaqSection path="/financiar" />
        <RelatedPages path="/financiar" />
        <StickyCta href="#empezar" label={{ en: 'Start a conversation', es: 'Empezar una conversación' }} />
    </Container>
  );
}
