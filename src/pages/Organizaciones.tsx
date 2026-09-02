import type { ReactNode } from 'react';
import { Mark } from '@/components/Logo';
import { Container, Eyebrow, Mono, Reveal } from '@/components/primitives';
import type { T } from '@/lib/i18n';
import { useT } from '@/lib/i18n';

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

/** What the applying organization asserts about itself. Nobody has checked it yet. */
const DECLARED: { field: T; note: T }[] = [
  {
    field: { en: 'Legal name', es: 'Nombre legal' },
    note: { en: 'As it appears in its registration.', es: 'Tal como aparece en su inscripción.' },
  },
  {
    field: { en: 'Trade name', es: 'Nombre comercial' },
    note: { en: 'Only if it differs from the legal one.', es: 'Solo si difiere del legal.' },
  },
  {
    field: { en: 'Legal registration id', es: 'Cédula jurídica' },
    note: {
      en: 'The number the state registered it under.',
      es: 'El número con el que el Estado la inscribió.',
    },
  },
  {
    field: { en: 'Type', es: 'Tipo' },
    note: {
      en: 'Nonprofit, foundation, cooperative, or other.',
      es: 'Organización sin fines de lucro, fundación, cooperativa u otra.',
    },
  },
  {
    field: { en: 'Year established', es: 'Año de constitución' },
    note: { en: 'The year it was constituted.', es: 'El año en que se constituyó.' },
  },
  {
    field: { en: 'Address', es: 'Domicilio' },
    note: { en: 'Province, cantón and district.', es: 'Provincia, cantón y distrito.' },
  },
  {
    field: { en: 'Institutional email', es: 'Correo institucional' },
    note: { en: "The organization's, not a personal one.", es: 'De la organización, no personal.' },
  },
  {
    field: { en: 'A named contact', es: 'Persona de contacto' },
    note: {
      en: 'With a name. An inbox with nobody behind it is not a contact.',
      es: 'Con nombre. Un buzón sin nadie detrás no es un contacto.',
    },
  },
];

/** The half that carries the weight: the act of verification, and who performed it. */
const VERIFICATION: { field: T; note: T }[] = [
  {
    field: { en: 'Who verified', es: 'Quién verificó' },
    note: {
      en: 'The organization that did the review, by name.',
      es: 'La organización que hizo la revisión, con su nombre.',
    },
  },
  {
    field: { en: 'The decision', es: 'La decisión' },
    note: {
      en: 'What that organization concluded about the entry.',
      es: 'Lo que esa organización concluyó sobre la entrada.',
    },
  },
  {
    field: { en: 'The date', es: 'La fecha' },
    note: {
      en: 'The day the decision was made. A verification with no date says nothing.',
      es: 'El día en que se tomó la decisión. Una verificación sin fecha no dice nada.',
    },
  },
  {
    field: { en: 'The fingerprint, on chain', es: 'La huella, en cadena' },
    note: {
      en: 'A digest of the verification, anchored. It can be recomputed later by anyone. What it cannot be is changed without that showing.',
      es: 'Un resumen de la verificación, anclado. Cualquiera puede volver a calcularlo después. Lo que no se puede es cambiarlo sin que se note.',
    },
  },
];

function Fields({ rows }: { rows: { field: T; note: T }[] }) {
  const t = useT();
  return (
    <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.field.en}>
          <dt className="text-[0.9375rem] font-medium text-ink">{t(row.field)}</dt>
          <dd className="mt-1 text-[0.9375rem] leading-relaxed text-muted">{t(row.note)}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The organization registry.
 *
 * Its argument: a registry of self-asserted entries is worth nothing, so the
 * record is not the organization but the vouching — who reviewed it, when, and
 * a fingerprint of that decision that cannot be revised in silence. Nothing is
 * registered yet, and the page says so instead of showing a sample entry: a
 * fabricated organization in a registry that exists to say what is real would
 * be the exact inversion of its purpose.
 */
export default function Organizaciones() {
  const t = useT();

  return (
    <Container className="pt-[clamp(7rem,14vh,10rem)] pb-32">
      <Reveal as="header" className="max-w-[52rem]">
        <Eyebrow>Registro de Organizaciones</Eyebrow>
        <h1 className="display-2 mt-5">
          {t({
            en: 'Being on a list proves nothing. Who vouches for you does.',
            es: 'Estar en una lista no prueba nada. Quién responde por usted, sí.',
          })}
        </h1>
        <p className="lede mt-7 max-w-[44ch]">
          {t({
            en: 'The Registro de Organizaciones records which organizations exist, who verified each one, and on what date. We accredit nobody. We record that a named organization did, and we keep that record where it cannot be quietly changed.',
            es: 'El Registro de Organizaciones anota qué organizaciones existen, quién verificó cada una y en qué fecha. No acreditamos a nadie. Dejamos constancia de quién lo hizo, y guardamos esa constancia donde no se puede cambiar en silencio.',
          })}
        </p>
      </Reveal>

      {/*
       * Same reason as the node page: a reader arrives wanting one answer —
       * what it records, what being listed means, how to apply — rather than
       * the argument from the top.
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
              ['vacio', { en: 'The gap', es: 'El vacío' }],
              ['quien-responde', { en: 'Who vouched', es: 'Quién responde' }],
              ['que-registra', { en: 'What it records', es: 'Qué registra' }],
              ['verificacion', { en: 'Verification', es: 'La verificación' }],
              ['alcance', { en: 'What it means', es: 'Qué significa' }],
              ['revisar', { en: 'Checking an entry', es: 'Revisar una entrada' }],
              ['inscribirse', { en: 'Getting listed', es: 'Inscribirse' }],
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
        id="vacio"
        eyebrow={t({ en: 'The gap', es: 'El vacío' })}
        title={t({
          en: 'The question nobody can answer today',
          es: 'La pregunta que hoy nadie puede contestar',
        })}
      >
        <p className={P}>
          {t({
            en: 'A funder abroad is about to transfer money. A ministry is about to sign an agreement. Another organization is about to name a counterpart in a report. All three need the same thing: to know whether the organization on the other side is real, and who checked.',
            es: 'Un financiador en otro país está por transferir fondos. Un ministerio está por firmar un convenio. Otra organización está por nombrar a una contraparte en un informe. Los tres necesitan lo mismo: saber si la organización del otro lado existe de verdad, y quién lo comprobó.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'The answer arrives as an attached PDF, a certificate issued months ago, or a website. None of it is checkable by whoever receives it. And a registry where each organization writes its own entry does not fix that. It moves the same unbacked claim to a new address.',
            es: 'La respuesta llega como un PDF adjunto, un certificado emitido hace meses o un sitio web. Nada de eso lo puede comprobar quien lo recibe. Y un registro donde cada organización escribe su propia entrada no arregla nada: solo cambia de dirección la misma afirmación sin respaldo.',
          })}
        </p>
      </Section>

      {/*
       * The core of the page. Everything after this is schema and procedure;
       * this is the claim the registry stands on.
       */}
      <Section
        id="quien-responde"
        eyebrow={t({ en: 'The idea', es: 'La idea' })}
        title={t({
          en: 'The list is not what the registry is worth',
          es: 'El registro no vale por la lista',
        })}
      >
        <p className={P}>
          {t({
            en: 'Anyone can write down a name and a number. What makes an entry mean something is that a second organization, under its own name, reviewed it and said so in writing, on a date, in a form that can still be read years later.',
            es: 'Cualquiera puede escribir un nombre y un número. Lo que hace que una entrada signifique algo es que una segunda organización, con nombre propio, la haya revisado y lo diga por escrito, con fecha, en una forma que se siga pudiendo leer años después.',
          })}
        </p>

        <p className="mt-10 text-xl leading-snug font-medium tracking-[-0.02em] text-ink sm:text-2xl">
          {t({
            en: 'What gets recorded is not the organization. It is who vouched for it, and when.',
            es: 'Lo que queda registrado no es la organización. Es quién respondió por ella, y cuándo.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'So the verification is kept with the same care as the fact it verifies: the organization that performed it, what it decided, the date, and a fingerprint of that decision anchored on chain. If the record is edited afterwards, the fingerprint stops matching and anyone can see it.',
            es: 'Por eso la verificación se guarda con el mismo cuidado que el dato verificado: la organización que la hizo, qué decidió, la fecha, y una huella de esa decisión anclada en cadena. Si después se edita la constancia, la huella deja de coincidir y cualquiera lo puede ver.',
          })}
        </p>
      </Section>

      <Section
        id="que-registra"
        eyebrow={t({ en: 'The schema', es: 'El esquema' })}
        title={t({ en: 'What an entry records', es: 'Qué registra una entrada' })}
      >
        <div className="card p-7 sm:p-9">
          <h3 className="text-xl font-bold tracking-[-0.02em]">
            {t({ en: 'What the organization declares', es: 'Lo que declara la organización' })}
          </h3>
          <Fields rows={DECLARED} />
        </div>
        <p className={`${P} mt-6`}>
          {t({
            en: 'We check none of that. It is what the organization asserts about itself, and it is recorded as an assertion.',
            es: 'Nada de eso lo comprobamos nosotros. Es lo que la organización afirma sobre sí misma, y así queda anotado: como una afirmación.',
          })}
        </p>

        <div className="card mt-10 p-7 sm:p-9">
          <h3 className="text-xl font-bold tracking-[-0.02em]">
            {t({ en: 'What the verification leaves', es: 'Lo que deja la verificación' })}
          </h3>
          <Fields rows={VERIFICATION} />
        </div>
        <p className={`${P} mt-6`}>
          {t({
            en: 'This second half is the one worth reading. The first says what an organization claims. This one says who put their name behind the claim, and makes that impossible to revise later without leaving a trace.',
            es: 'Esta segunda mitad es la que vale la pena leer. La primera dice lo que una organización afirma. Esta dice quién puso su nombre detrás de esa afirmación, y hace que no se pueda corregir después sin dejar rastro.',
          })}
        </p>
      </Section>

      <Section
        id="verificacion"
        eyebrow={t({ en: 'Verification', es: 'La verificación' })}
        title={t({
          en: 'Verification is an act by someone, not a badge from us',
          es: 'Verificar es un acto de alguien, no un sello nuestro',
        })}
      >
        <p className={P}>
          {t({
            en: 'We do not certify organizations. We do not visit them, we do not read their books, and we are in no position to answer for them. What we do is record that a named organization reviewed one, what it decided and when, and put that record beyond the reach of a quiet edit.',
            es: 'No certificamos organizaciones. No las visitamos, no leemos sus libros y no estamos en condiciones de responder por ellas. Lo que hacemos es registrar que una organización con nombre propio revisó a otra, qué decidió y cuándo, y dejar esa constancia fuera del alcance de una edición silenciosa.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'A verifier is itself an organization in this registry, with its own entry and with whoever vouched for it beside it. The chain ends somewhere, and where it ends is in plain sight rather than behind a seal.',
            es: 'Quien verifica es, a su vez, una organización de este mismo registro, con su propia entrada y con quien respondió por ella al lado. La cadena termina en algún punto, y ese punto queda a la vista en lugar de escondido detrás de un sello.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          <strong className="font-medium text-ink">
            {t({ en: 'One rule of conflict.', es: 'Una regla de conflicto.' })}
          </strong>{' '}
          {t({
            en: 'An organization cannot verify itself, nor one it controls, nor one that controls it. It is the same rule that governs custody of the record, for the same reason: whoever stands to gain from an entry is not a witness to it.',
            es: 'Una organización no puede verificarse a sí misma, ni verificar a una que controla, ni a una que la controla a ella. Es la misma regla que gobierna la custodia del registro, y por la misma razón: quien tiene algo que ganar con una entrada no es testigo de esa entrada.',
          })}
        </p>
        <p className={`${P} mt-5`}>
          {t({
            en: 'No verifying organization is listed yet. When one is, its entry will be public like any other, and a reader will be able to see who vouched for the verifier before deciding what its decisions are worth.',
            es: 'Todavía no hay ninguna organización verificadora inscrita. Cuando la haya, su entrada será pública como cualquier otra, y quien lea podrá ver quién respondió por ella antes de decidir cuánto valen sus decisiones.',
          })}
        </p>
      </Section>

      <Section
        id="alcance"
        eyebrow={t({ en: 'Scope', es: 'El alcance' })}
        title={t({
          en: 'What an entry says, and what it does not',
          es: 'Qué dice una entrada, y qué no dice',
        })}
      >
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow text-confirmed-ink">{t({ en: 'It says', es: 'Dice' })}</h3>
            <ul className={`${P} mt-4 space-y-3`}>
              {(
                [
                  {
                    en: 'That the organization asserted these facts about itself.',
                    es: 'Que la organización afirmó estos datos sobre sí misma.',
                  },
                  {
                    en: 'That a second organization, by name, reviewed them and reached a decision.',
                    es: 'Que una segunda organización, con nombre, los revisó y tomó una decisión.',
                  },
                  {
                    en: 'The date of that decision.',
                    es: 'La fecha de esa decisión.',
                  },
                  {
                    en: 'That neither the assertion nor the decision can be altered afterwards without the fingerprint ceasing to match.',
                    es: 'Que ni la afirmación ni la decisión se pueden alterar después sin que la huella deje de coincidir.',
                  },
                ] as const
              ).map((x) => (
                <li key={x.en}>{t(x)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow">{t({ en: 'It does not say', es: 'No dice' })}</h3>
            <ul className={`${P} mt-4 space-y-3`}>
              {(
                [
                  {
                    en: 'That we endorse the organization. We do not know it.',
                    es: 'Que nosotros avalemos a la organización. No la conocemos.',
                  },
                  {
                    en: 'That it is solvent, competent or honest. None of that is in the registry.',
                    es: 'Que sea solvente, competente u honesta. Nada de eso está en el registro.',
                  },
                  {
                    en: 'That the verifier got it right. A verifier can be wrong, and its name sits beside the entry for exactly that reason.',
                    es: 'Que el verificador haya acertado. Un verificador se puede equivocar, y su nombre queda junto a la entrada precisamente por eso.',
                  },
                  {
                    en: 'That the entry still holds today. It carries the date it was verified, and that is all it claims.',
                    es: 'Que la entrada siga vigente hoy. Lleva la fecha en que se verificó, y eso es todo lo que afirma.',
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
            en: 'Being listed is not an endorsement. It is the record of an assertion and of who stood behind it. The reader still has to judge the verifier, and the verifier is named so that they can.',
            es: 'Aparecer en el registro no es un aval. Es la constancia de una afirmación y de quién la respaldó. Quien lee sigue teniendo que juzgar al verificador, y por eso el verificador aparece con nombre.',
          })}
        </p>
      </Section>

      <Section
        id="revisar"
        eyebrow={t({ en: 'How to read it', es: 'Cómo se lee' })}
        title={t({ en: 'How to check an entry', es: 'Cómo se revisa una entrada' })}
      >
        <ol className="grid gap-px overflow-hidden rounded-2xl bg-hairline">
          {(
            [
              {
                en: 'Read what the organization declared about itself.',
                es: 'Lea qué declaró la organización sobre sí misma.',
              },
              {
                en: 'Look at who verified it, and on what date.',
                es: 'Vea quién la verificó, y en qué fecha.',
              },
              {
                en: 'Recompute the fingerprint of that verification and compare it with the one anchored on chain. If they differ, the record changed after it was verified.',
                es: 'Vuelva a calcular la huella de esa verificación y compárela con la anclada en cadena. Si no coinciden, la constancia cambió después de verificarse.',
              },
              {
                en: 'Find the verifier in this same registry and see who vouched for it.',
                es: 'Busque al verificador en este mismo registro y vea quién respondió por él.',
              },
              {
                en: 'Decide for yourself. The registry gives you what it takes to judge; it does not hand you the judgment.',
                es: 'Decida usted. El registro le da con qué juzgar; no le entrega el juicio hecho.',
              },
            ] as const
          ).map((step, i) => (
            <li className="flex gap-5 bg-ground px-6 py-5" key={step.en}>
              <Mono className="pt-1 text-faint">{String(i + 1).padStart(2, '0')}</Mono>
              <span className="text-[1.0625rem] leading-relaxed text-ink">{t(step)}</span>
            </li>
          ))}
        </ol>
        <p className={`${P} mt-6`}>
          {t({
            en: 'There is nothing to check yet, because no entry exists. The procedure is written down first so that the first entry can be held to it.',
            es: 'Todavía no hay nada que revisar, porque no existe ninguna entrada. El procedimiento se escribe antes para que la primera entrada se pueda medir con él.',
          })}
        </p>
      </Section>

      <Section
        id="inscribirse"
        eyebrow={t({ en: 'Getting listed', es: 'Inscribirse' })}
        title={t({
          en: 'How an organization gets listed',
          es: 'Cómo se inscribe una organización',
        })}
      >
        <p className={`${P} mb-8`}>
          {t({
            en: 'No organization has been through this yet. The schema is defined; what follows is the procedure we propose, not one anyone has completed.',
            es: 'Ninguna organización ha pasado por esto todavía. El esquema está definido; lo que sigue es el procedimiento que proponemos, no uno que alguien ya haya recorrido.',
          })}
        </p>
        <ol className="grid gap-px overflow-hidden rounded-2xl bg-hairline">
          {(
            [
              {
                en: 'The organization sends its data in full, with a named person responsible for it.',
                es: 'La organización envía sus datos completos, con una persona responsable con nombre.',
              },
              {
                en: 'A verifying organization checks them against the documents and decides.',
                es: 'Una organización verificadora los revisa contra los documentos y decide.',
              },
              {
                en: 'The decision, its date and the organization that made it are recorded, and the fingerprint is anchored.',
                es: 'La decisión, su fecha y la organización que la tomó quedan registradas, y la huella queda anclada.',
              },
              {
                en: "The entry becomes public, with the verifier's name next to the organization's.",
                es: 'La entrada queda pública, con el nombre del verificador junto al de la organización.',
              },
            ] as const
          ).map((step, i) => (
            <li className="flex gap-5 bg-ground px-6 py-5" key={step.en}>
              <Mono className="pt-1 text-faint">{String(i + 1).padStart(2, '0')}</Mono>
              <span className="text-[1.0625rem] leading-relaxed text-ink">{t(step)}</span>
            </li>
          ))}
        </ol>
        <p className={`${P} mt-6`}>
          {t({
            en: 'Until a verifying organization is listed, step two has nobody to perform it. An application waits, and we say so. An application waiting is better than a verification nobody carried out.',
            es: 'Mientras no haya una organización verificadora inscrita, el paso dos no lo puede hacer nadie. Una solicitud queda en espera, y lo decimos. Una solicitud en espera es mejor que una verificación que nadie hizo.',
          })}
        </p>
      </Section>

      {/* Honest empty state. Nothing is registered, and a sample entry here would
          invert the purpose of a registry that exists to say what is real. */}
      <Reveal className="mt-20 sm:mt-28">
        <div className="card grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="display-3 max-w-[18ch]">
              {t({
                en: 'No organization is registered yet.',
                es: 'Todavía no hay ninguna organización inscrita.',
              })}
            </h2>
            <p className={`${P} mt-5 max-w-[44ch]`}>
              {t({
                en: 'The registry is open and empty. There are no examples either: a sample organization in a record that exists to say which ones are real would be the exact opposite of the point. The first entry will appear here with its name, who verified it, and the date.',
                es: 'El registro está abierto y vacío. Tampoco hay ejemplos: una organización de muestra en un registro que existe para decir cuáles son reales sería exactamente lo contrario del punto. La primera entrada aparecerá acá con su nombre, quién la verificó y la fecha.',
              })}
            </p>
            <a
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[0.9375rem] font-medium text-ground transition-[transform,translate,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(10,10,11,0.16)]"
              href="mailto:info@decentralchain.io?subject=Registro%20de%20Organizaciones"
            >
              {t({ en: 'Apply to be listed', es: 'Solicitar la inscripción' })}
            </a>
          </div>
          <Mark className="hidden h-44 w-44 shrink-0 text-ink opacity-[0.14] lg:block" />
        </div>
      </Reveal>
    </Container>
  );
}
