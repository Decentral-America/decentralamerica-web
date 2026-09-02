import type { ReactNode } from 'react';
import { Mark } from '@/components/Logo';
import { NodeProof } from '@/components/NodeProof';
import { Container, Eyebrow, Mono, Reveal } from '@/components/primitives';
import { ANCLA, NODE, NODE_URL } from '@/lib/content';
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
 * The custody page.
 *
 * Its argument, and the reason the page exists at all: keeping the memory
 * requires nothing at stake, and only writing to it does. That distinction is
 * what separates this from a validator programme paying a yield, and it is the
 * one thing a reader has to leave with.
 */
export default function Nodo() {
  const t = useT();
  const num = useNum();

  return (
    <Container className="pt-[clamp(7rem,14vh,10rem)] pb-32">
      <Reveal as="header" className="max-w-[52rem]">
        <Eyebrow>Nodo Público</Eyebrow>
        <h1 className="display-2 mt-5">
          {t({
            en: 'A public memory needs hands with nothing to gain.',
            es: 'Una memoria pública necesita manos que no tengan nada que ganar.',
          })}
        </h1>
        <p className="lede mt-7 max-w-[44ch]">
          {t({
            en: 'Nodo Público is the network of institutions that each keep a complete copy of the memory and check it for themselves. This page explains what that means, what it costs, and what it does not pay.',
            es: 'Nodo Público es la red de instituciones que guardan cada una una copia completa de la memoria y la verifican por su cuenta. Esta página explica qué significa eso, qué cuesta y qué no paga.',
          })}
        </p>
      </Reveal>

      {/*
       * The page became a decision document rather than an explainer, and a
       * board member arrives wanting one specific answer (cost, exit, liability)
       * rather than the argument from the top. The index is for them.
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
              ['que-es', { en: 'What a node is', es: 'Qué es un nodo' }],
              ['distincion', { en: 'Two kinds', es: 'Dos tipos' }],
              ['requisitos', { en: 'Requirements', es: 'Requisitos' }],
              ['intercambio', { en: 'What it gives', es: 'Qué da' }],
              ['empezar', { en: 'How it begins', es: 'Cómo empieza' }],
              ['objeciones', { en: 'Objections', es: 'Objeciones' }],
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

      <Section
        id="que-es"
        eyebrow={t({ en: 'The idea', es: 'La idea' })}
        title={t({ en: 'What a node is', es: 'Qué es un nodo' })}
      >
        <p className={P}>
          {t({
            en: 'A node is a complete copy of the memory, plus the program that checks every new entry before accepting it.',
            es: 'Un nodo es una copia completa de la memoria, más el programa que revisa cada entrada nueva antes de aceptarla.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'It is not a backup. A backup trusts whoever made it. A node trusts nobody: it recomputes every entry for itself and rejects whatever does not add up, wherever it came from. Including from us.',
            es: 'No es un respaldo. Un respaldo confía en quien lo hizo. Un nodo no confía en nadie: vuelve a calcular cada entrada por su cuenta y rechaza lo que no cuadra, venga de donde venga. También de nosotros.',
          })}
        </p>
      </Section>

      {/*
       * The core of the page. Everything else is logistics; this is the argument
       * that separates the programme from a validator set earning a yield, and
       * the figure has to be named for the contrast to mean anything.
       */}
      <Section
        id="distincion"
        eyebrow={t({ en: 'The distinction', es: 'La distinción' })}
        title={t({ en: 'Two kinds of node', es: 'Dos tipos de nodo' })}
      >
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="card p-7">
            <h3 className="text-xl font-bold tracking-[-0.02em]">
              {t({ en: 'The one that watches', es: 'El que observa' })}
            </h3>
            <p className={`${P} mt-3`}>
              {t({
                en: 'Keeps the complete memory and verifies every entry for itself. It needs no balance, no participation, no financial position of any kind. Any institution can run one.',
                es: 'Guarda la memoria completa y verifica cada entrada por su cuenta. No necesita ningún saldo, ninguna participación, ninguna posición financiera. Cualquier institución puede operar uno.',
              })}
            </p>
          </div>
          <div className="card p-7">
            <h3 className="text-xl font-bold tracking-[-0.02em]">
              {t({ en: 'The one that writes', es: 'El que escribe' })}
            </h3>
            <p className={`${P} mt-3`}>
              {t({
                en: 'Also produces new entries. For that the protocol requires a minimum generating balance of',
                es: 'Además produce entradas nuevas. Para eso el protocolo exige un saldo generador mínimo de',
              })}{' '}
              <Mono className="text-ink">{num(NODE.minGeneratingBalanceDcc)} DCC</Mono>.
            </p>
          </div>
        </div>

        <p className="mt-10 text-xl leading-snug font-medium tracking-[-0.02em] text-ink sm:text-2xl">
          {t({
            en: 'Keeping the memory requires nothing at stake. Only writing to it does.',
            es: 'Para guardar la memoria no hace falta tener nada en juego. Solo para escribirla.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'An institution can hold the public record with no position whatsoever in what that record says. That is exactly what makes its copy worth something. A custodian who stands to gain from an entry is not a witness to it.',
            es: 'Una institución puede custodiar el registro público sin ninguna posición en lo que ese registro dice. Eso es exactamente lo que hace que su copia valga algo. Quien tiene algo que ganar con una entrada no es testigo de esa entrada.',
          })}
        </p>
      </Section>

      <Section
        id="dia-a-dia"
        eyebrow={t({ en: 'Day to day', es: 'Día a día' })}
        title={t({ en: 'What it actually does', es: 'Qué hace en realidad' })}
      >
        <ol className="grid gap-px overflow-hidden rounded-2xl bg-hairline">
          {(
            [
              {
                en: 'Receives every new entry as it is published.',
                es: 'Recibe cada entrada nueva conforme se publica.',
              },
              {
                en: 'Checks it against the rules, independently, without asking anyone.',
                es: 'La verifica contra las reglas, por su cuenta, sin preguntarle a nadie.',
              },
              {
                en: 'Stores it alongside everything before it.',
                es: 'La guarda junto a todo lo anterior.',
              },
              {
                en: 'Answers anyone who asks what the memory says.',
                es: 'Responde a cualquiera que pregunte qué dice la memoria.',
              },
              {
                en: 'Refuses anything invalid, and keeps refusing it.',
                es: 'Rechaza lo que no es válido, y lo sigue rechazando.',
              },
            ] as const
          ).map((step, i) => (
            <li className="flex gap-5 bg-ground px-6 py-5" key={step.en}>
              <Mono className="pt-1 text-faint">{String(i + 1).padStart(2, '0')}</Mono>
              <span className="text-[1.0625rem] leading-relaxed text-ink">{t(step)}</span>
            </li>
          ))}
        </ol>
        {/*
         * Item 04 above says a node "answers anyone who asks". Asserting that and
         * showing nothing was the inert part of this page: the panel makes the
         * reader's own browser do the asking, so the claim is demonstrated rather
         * than stated.
         */}
        <NodeProof className="mt-10" />
      </Section>

      <Section
        id="requisitos"
        eyebrow={t({ en: 'Requirements', es: 'Requisitos' })}
        title={t({ en: 'What it takes to run one', es: 'Qué hace falta para operar uno' })}
      >
        <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
          <div>
            <dt className="eyebrow">{t({ en: 'A server', es: 'Un servidor' })}</dt>
            <dd className={`${P} mt-2`}>
              <Mono className="text-ink">{NODE.hostRamGb} GB</Mono>{' '}
              {t({
                en: 'of memory. That is what we run, not a published minimum: a smaller machine may well be enough and nobody has measured the floor.',
                es: 'de memoria. Eso es lo que corremos nosotros, no un mínimo publicado: puede que una máquina menor alcance y nadie ha medido el piso.',
              })}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{t({ en: 'The software', es: 'El programa' })}</dt>
            <dd className={`${P} mt-2`}>
              <Mono className="text-ink">{NODE.software}</Mono>.{' '}
              {t({
                en: 'Open source, MIT licensed. Readable by whoever you ask to audit it.',
                es: 'Código abierto, licencia MIT. Legible por quien usted quiera que lo audite.',
              })}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{t({ en: 'A connection', es: 'Una conexión' })}</dt>
            <dd className={`${P} mt-2`}>
              {t({
                en: 'Continuous, and modest. A new entry arrives roughly every minute.',
                es: 'Continua, y modesta. Llega una entrada nueva aproximadamente cada minuto.',
              })}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{t({ en: 'Attention', es: 'Atención' })}</dt>
            <dd className={`${P} mt-2`}>
              {t({
                en: 'Someone who applies updates and notices when it stops. This is the real cost, and it is a person rather than a machine.',
                es: 'Alguien que aplique actualizaciones y note cuándo se detiene. Este es el costo real, y es una persona antes que una máquina.',
              })}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{t({ en: 'Money', es: 'Dinero' })}</dt>
            <dd className={`${P} mt-2`}>
              {t({
                en: 'The server is the only recurring cost. A machine like that rents for tens of dollars a month from any provider, and the exact figure depends where it is hosted. We have not published ours yet, and we should.',
                es: 'El servidor es el único costo recurrente. Un equipo así se alquila por decenas de dólares al mes en cualquier proveedor, y la cifra exacta depende de dónde se aloje. Todavía no publicamos la nuestra, y deberíamos.',
              })}
            </dd>
          </div>
        </dl>
      </Section>

      <Section
        id="intercambio"
        eyebrow={t({ en: 'The exchange', es: 'El intercambio' })}
        title={t({ en: 'What it gives, and what it does not', es: 'Qué da, y qué no da' })}
      >
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow text-confirmed-ink">{t({ en: 'It gives', es: 'Da' })}</h3>
            <ul className={`${P} mt-4 space-y-3`}>
              {(
                [
                  {
                    en: 'A copy that answers to nobody, including us.',
                    es: 'Una copia que no le responde a nadie, tampoco a nosotros.',
                  },
                  {
                    en: 'The ability to verify any claim about the public record without asking permission.',
                    es: 'La capacidad de verificar cualquier afirmación sobre el registro público sin pedir permiso.',
                  },
                  {
                    en: 'Its name published as a custodian, with the date it began.',
                    es: 'Su nombre publicado como custodia, con la fecha en que empezó.',
                  },
                  {
                    en: 'A say in how custody works, once there is more than one custodian to decide with. There is no governing body today and we will not pretend otherwise.',
                    es: 'Voz en cómo funciona la custodia, cuando haya más de una custodia con quien decidirlo. Hoy no existe un órgano de gobierno y no vamos a fingir que sí.',
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
                    en: 'Money. No yield, no reward, no payment of any kind.',
                    es: 'Dinero. Ningún rendimiento, ninguna recompensa, ningún pago.',
                  },
                  {
                    en: 'Any position in what the memory contains.',
                    es: 'Ninguna posición en lo que la memoria contiene.',
                  },
                  {
                    en: 'Endorsement of any entry. A custodian keeps the record, it does not vouch for it.',
                    es: 'Respaldo de ninguna entrada. Una custodia guarda el registro, no responde por él.',
                  },
                  {
                    en: 'Any duty to answer for the content. A custodian keeps the record, it does not produce it.',
                    es: 'Ninguna obligación de responder por el contenido. Una custodia guarda el registro, no lo produce.',
                  },
                ] as const
              ).map((x) => (
                <li key={x.en}>{t(x)}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className={`${P} mt-9`}>
          {t({
            en: 'The absence of payment is the point, not an oversight. A custodian paid according to what the record says is not independent of it.',
            es: 'La ausencia de pago es el punto, no un descuido. Una custodia pagada según lo que el registro dice no es independiente de él.',
          })}
        </p>
      </Section>

      <Section
        id="quien"
        eyebrow={t({ en: 'Who', es: 'Quién' })}
        title={t({ en: 'Who should keep a copy', es: 'Quién debería guardar una copia' })}
      >
        <p className={P}>
          {t({
            en: 'Universities, professional colleges, newsrooms, chambers, libraries. Organizations that already answer to a public rather than to a shareholder, and that would lose more by being caught altering a record than they could ever gain by it.',
            es: 'Universidades, colegios profesionales, medios, cámaras, bibliotecas. Organizaciones que ya le responden a un público y no a un accionista, y que perderían más al ser sorprendidas alterando un registro de lo que podrían ganar con ello.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          <strong className="font-medium text-ink">
            {t({ en: 'One rule of conflict.', es: 'Una regla de conflicto.' })}
          </strong>{' '}
          {t({
            en: 'An institution should not be the principal custodian of records about itself. It can keep a copy, and several already keeping copies is the point, but the memory of what a body did cannot rest mainly in that body.',
            es: 'Una institución no debería ser la custodia principal de registros sobre sí misma. Puede guardar una copia, y que varias guarden copias es justamente el punto, pero la memoria de lo que hizo un organismo no puede descansar principalmente en ese organismo.',
          })}
        </p>
      </Section>

      <Section
        id="empezar"
        eyebrow={t({ en: 'Starting', es: 'Empezar' })}
        title={t({ en: 'How it would begin', es: 'Cómo empezaría' })}
      >
        <p className={`${P} mb-8`}>
          {t({
            en: 'No institution has done this yet, so what follows is what we propose rather than a procedure anyone has been through. It is deliberately short.',
            es: 'Ninguna institución lo ha hecho todavía, así que lo que sigue es lo que proponemos y no un procedimiento por el que alguien ya pasó. Es corto a propósito.',
          })}
        </p>
        <ol className="grid gap-px overflow-hidden rounded-2xl bg-hairline">
          {(
            [
              {
                en: 'A conversation, so your institution knows exactly what it would be taking on and we know what it needs.',
                es: 'Una conversación, para que su institución sepa exactamente qué asumiría y nosotros sepamos qué necesita.',
              },
              {
                en: 'A trial copy on the test network. Nothing public, no commitment, and it can be abandoned without anyone knowing it happened.',
                es: 'Una copia de prueba en la red de pruebas. Nada público, sin compromiso, y se puede abandonar sin que nadie sepa que ocurrió.',
              },
              {
                en: 'A written agreement naming what each side commits to, short enough for a board to read in full.',
                es: 'Un acuerdo escrito que diga a qué se compromete cada parte, corto como para que una junta lo lea entero.',
              },
              {
                en: 'The node goes live and the institution appears on this page by name, with the date it began.',
                es: 'El nodo entra en operación y la institución aparece en esta página con su nombre y la fecha en que empezó.',
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

      <Section
        id="objeciones"
        eyebrow={t({ en: 'Objections', es: 'Objeciones' })}
        title={t({ en: 'Why not something simpler', es: 'Por qué no algo más simple' })}
      >
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold tracking-[-0.02em]">
              {t({ en: 'Why not the Internet Archive?', es: '¿Por qué no el Internet Archive?' })}
            </h3>
            <p className={`${P} mt-3`}>
              {t({
                en: 'We looked. It holds',
                es: 'Lo revisamos. Tiene',
              })}{' '}
              <Mono className="text-ink">{ANCLA.internetArchiveCaptures}</Mono>{' '}
              {t({
                en: 'captures of the archives in question, so there was nothing to compare against and the baseline had to be built from scratch. Beyond that, a web archive is one organization keeping copies. It answers what a page looked like. It does not let a stranger recompute, for themselves, that a specific record is the one that was published on a specific day.',
                es: 'capturas de los archivos en cuestión, así que no había con qué comparar y la línea base hubo que construirla desde cero. Más allá de eso, un archivo web es una sola organización guardando copias. Responde cómo se veía una página. No permite que un tercero vuelva a calcular, por su cuenta, que un registro determinado es el que se publicó un día determinado.',
              })}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-[-0.02em]">
              {t({
                en: 'Why not a private network run by the institutions themselves?',
                es: '¿Por qué no una red privada operada por las propias instituciones?',
              })}
            </h3>
            <p className={`${P} mt-3`}>
              {t({
                en: 'Because a record operated by the body it describes is not an independent witness. If the institution being examined runs the machines, the institution being examined can rewrite the result, and everyone reading knows it. This is the whole argument, and it is why custody has to sit with organizations that have nothing to gain from what the record says.',
                es: 'Porque un registro operado por el organismo que describe no es un testigo independiente. Si la institución examinada opera las máquinas, la institución examinada puede reescribir el resultado, y quien lo lea lo sabe. Este es el argumento entero, y es la razón de que la custodia tenga que estar en organizaciones que no ganen nada con lo que el registro diga.',
              })}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-[-0.02em]">
              {t({
                en: 'Why not just trust you?',
                es: '¿Por qué no simplemente confiar en ustedes?',
              })}
            </h3>
            <p className={`${P} mt-3`}>
              {t({
                en: 'You should not, and that is the point of the whole programme. Everything on this page exists so that believing us is unnecessary. A custodian who had to take our word for the memory would not be custody. It would be an audience.',
                es: 'No debería, y ese es el sentido de todo el programa. Todo lo de esta página existe para que creernos sea innecesario. Una custodia que tuviera que fiarse de nuestra palabra no sería custodia. Sería público.',
              })}
            </p>
          </div>
        </div>
      </Section>

      {/* Honest empty state. There are no custodians, and saying so is method. */}
      <Reveal className="mt-20 sm:mt-28">
        <div className="card grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="display-3 max-w-[18ch]">
              {t({
                en: 'No institution keeps a copy yet.',
                es: 'Todavía ninguna institución guarda una copia.',
              })}
            </h2>
            <p className={`${P} mt-5 max-w-[44ch]`}>
              {t({
                en: 'When one does, it will appear here with its name and the date it began. Saying so plainly while the list is empty is part of the method: a custody roster nobody can check is worth nothing.',
                es: 'Cuando alguna lo haga, aparecerá aquí con su nombre y la fecha en que empezó. Decirlo mientras la lista está vacía es parte del método: una lista de custodias que nadie puede comprobar no vale nada.',
              })}
            </p>
            <a
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[0.9375rem] font-medium text-ground transition-[transform,translate,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(10,10,11,0.16)]"
              href="mailto:info@decentralchain.io?subject=Nodo%20P%C3%BAblico"
            >
              {t({ en: 'Be the first institution', es: 'Ser la primera institución' })}
            </a>
          </div>
          <Mark className="hidden h-44 w-44 shrink-0 text-ink opacity-[0.14] lg:block" />
        </div>
      </Reveal>

      {/* The one technical disclosure, closed by default, as on the landing page. */}
      <Reveal className="mt-16">
        <details className="max-w-[46rem] border-t border-hairline pt-6">
          <summary className="eyebrow cursor-pointer text-ink">
            {t({
              en: 'For those who want the technical detail',
              es: 'Para quien quiera el detalle técnico',
            })}
          </summary>
          <p className={`${P} mt-5`}>
            {t({
              en: 'The memory is kept on DecentralChain, an open Layer-1 using Leased Proof of Stake, with a new block roughly every minute. The node software is node-scala, MIT licensed. A node that only validates needs no balance; producing blocks requires a minimum generating balance of',
              es: 'La memoria se guarda en DecentralChain, una Layer-1 abierta con Leased Proof of Stake y un bloque nuevo aproximadamente cada minuto. El programa del nodo es node-scala, licencia MIT. Un nodo que solo valida no necesita saldo; producir bloques exige un saldo generador mínimo de',
            })}{' '}
            <Mono className="text-ink">{num(NODE.minGeneratingBalanceDcc)} DCC</Mono>
            {t({
              en: '. A lower figure exists in the code but depends on a protocol feature that is not active on mainnet, so it is not the binding one. Any node answers questions publicly at',
              es: '. Existe una cifra menor en el código, pero depende de una función del protocolo que no está activa en mainnet, así que no es la vigente. Cualquier nodo responde consultas públicamente en',
            })}{' '}
            <a className="underline underline-offset-4" href={NODE_URL}>
              <Mono>{NODE_URL.replace('https://', '')}</Mono>
            </a>
            .
          </p>
        </details>
      </Reveal>
    </Container>
  );
}
