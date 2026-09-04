import type { T } from '@/lib/i18n';

/**
 * Takeaways and questions per route, in one place because two very different
 * consumers need the same words: the page renders them, and prerender.mjs emits
 * the questions as FAQPage structured data. Written twice, they would drift, and
 * a rich result that disagrees with the page it points at is worse than none.
 *
 * Answers are plain sentences with no markup. Google renders them as text, and a
 * question whose answer only makes sense next to the surrounding section is not
 * a question a reader arrived with.
 */
export type Faq = { q: T; a: T };
export type PageBrief = { takeaways: T[]; faqs: Faq[] };

export const PAGE_BRIEFS: Record<string, PageBrief> = {
  '/financiar': {
    faqs: [
      {
        a: {
          en: 'The work of bringing in a whole national record: the portal adapter, the daily mirror, the anchoring, and the check that what is published can be verified.',
          es: 'El trabajo de incorporar un registro nacional entero: el adaptador del portal, el espejo diario, el anclaje y la comprobación de que lo publicado se puede verificar.',
        },
        q: { en: 'What does funding a country buy?', es: '¿Qué compra financiar un país?' },
      },
      {
        a: {
          en: 'Costa Rica and Panamá. Guatemala, Honduras, El Salvador and Nicaragua are named and not started.',
          es: 'Costa Rica y Panamá. Guatemala, Honduras, El Salvador y Nicaragua están nombrados y sin empezar.',
        },
        q: { en: 'Which countries already run?', es: '¿Qué países ya corren?' },
      },
      {
        a: {
          en: 'Nobody. It was built without a funder, which is why this page can be exact about what the money would do instead of promising it.',
          es: 'Nadie. Se construyó sin financiador, y por eso esta página puede ser exacta sobre qué haría el dinero en vez de prometerlo.',
        },
        q: { en: 'Who funded Costa Rica?', es: '¿Quién financió Costa Rica?' },
      },
      {
        a: {
          en: 'No. It gets a whole national record mirrored, the findings published whatever they say, and a verifier naming who paid for it. It does not get control of the instrument.',
          es: 'No. Recibe un registro nacional replicado entero, los hallazgos publicados digan lo que digan, y un verificador que nombra a quien pagó. No recibe control sobre el instrumento.',
        },
        q: { en: 'Does a funder control the record?', es: '¿Quien financia controla el registro?' },
      },
    ],
    takeaways: [
      {
        en: 'Funding a country pays for bringing one more national record into the memory.',
        es: 'Financiar un país paga incorporar un registro nacional más a la memoria.',
      },
      {
        en: 'Costa Rica and Panamá already run. Four more portals are named and not started.',
        es: 'Costa Rica y Panamá ya corren. Cuatro portales más están nombrados y sin empezar.',
      },
      {
        en: 'The funder does not control the instrument, and neither do we.',
        es: 'Quien financia no controla el instrumento, y nosotros tampoco.',
      },
    ],
  },
  '/nodo': {
    faqs: [
      {
        a: {
          en: 'A server that keeps a complete copy of the record and checks it for itself, without asking DecentralAmerica for anything. The copy is complete: not a summary, not an index.',
          es: 'Un servidor que guarda una copia completa del registro y la comprueba por su cuenta, sin pedirle nada a DecentralAmerica. La copia es completa: no es un resumen ni un índice.',
        },
        q: { en: 'What is a Nodo Público node?', es: '¿Qué es un nodo de Nodo Público?' },
      },
      {
        a: {
          en: 'The server is the only recurring cost. A machine that suffices rents for tens of dollars a month from any provider.',
          es: 'El servidor es el único costo recurrente. Un equipo suficiente se alquila por decenas de dólares al mes en cualquier proveedor.',
        },
        q: { en: 'What does running a node cost?', es: '¿Cuánto cuesta operar un nodo?' },
      },
      {
        a: {
          en: 'No. No payment, no fee, no return for holding the copy. That is a condition of the programme, not a technical limitation.',
          es: 'No. No hay pago, no hay comisión y no hay retorno por sostener la copia. Es una condición del programa, no una limitación técnica.',
        },
        q: { en: 'Does a node earn anything?', es: '¿Un nodo genera ingresos?' },
      },
      {
        a: {
          en: 'Organizations with no financial interest in what they witness: universities, professional colleges, newsrooms and chambers. The organization cannot be a party to, a supplier to, or a beneficiary of the facts its node records.',
          es: 'Organizaciones sin interés económico en lo que atestiguan: universidades, colegios profesionales, redacciones y cámaras. La organización no puede ser parte, proveedora ni beneficiaria de los hechos que su nodo registra.',
        },
        q: { en: 'Which organizations can hold a node?', es: '¿Qué organizaciones pueden sostener un nodo?' },
      },
    ],
    takeaways: [
      {
        en: 'A node keeps a complete copy of the memory and checks it for itself.',
        es: 'Un nodo guarda una copia completa de la memoria y la comprueba por su cuenta.',
      },
      {
        en: 'Running one earns nothing. The server is the only recurring cost.',
        es: 'Operarlo no genera ingreso. El servidor es el único costo recurrente.',
      },
      {
        en: 'A custodian may have no stake in what it witnesses, and its identity is published.',
        es: 'El custodio no puede tener interés en lo que atestigua, y su identidad se publica.',
      },
    ],
  },
  '/organizaciones': {
    faqs: [
      {
        a: {
          en: 'Legal name, registration id, type, year established, and who vouched for the organization. That last field is what gives the rest its value.',
          es: 'El nombre legal, la cédula jurídica, el tipo, el año de constitución y quién respondió por la organización. Ese último campo es lo que le da valor a los demás.',
        },
        q: {
          en: 'What does the organization registry record?',
          es: '¿Qué registra el Registro de Organizaciones?',
        },
      },
      {
        a: {
          en: 'That someone identifiable put their name behind the data. It is not a quality seal, and not a recommendation from DecentralAmerica.',
          es: 'Que alguien identificable puso su nombre detrás de los datos. No es un sello de calidad ni una recomendación de DecentralAmerica.',
        },
        q: { en: 'What does being listed mean?', es: '¿Qué significa estar inscrita?' },
      },
      {
        a: {
          en: 'No, nor one it controls, nor one that controls it. It is the same rule that governs custody of the record, for the same reason.',
          es: 'No, ni a una que controla, ni a una que la controla a ella. Es la misma regla que gobierna la custodia del registro y por la misma razón.',
        },
        q: {
          en: 'Can an organization verify itself?',
          es: '¿Puede una organización verificarse a sí misma?',
        },
      },
      {
        a: {
          en: 'None yet. The schema is defined and the procedure written, so the first entry can be held to it.',
          es: 'Ninguna todavía. El esquema está definido y el procedimiento escrito, para que la primera entrada se pueda medir con él.',
        },
        q: { en: 'How many organizations are listed?', es: '¿Cuántas organizaciones hay inscritas?' },
      },
    ],
    takeaways: [
      {
        en: 'The registry records which organizations are real and, above all, who vouched for them.',
        es: 'El registro dice qué organizaciones son reales y, sobre todo, quién respondió por ellas.',
      },
      {
        en: 'An organization cannot verify itself, nor one it controls, nor one that controls it.',
        es: 'Una organización no puede verificarse a sí misma, ni a una que controla, ni a una que la controla.',
      },
      {
        en: 'The registry is open and no organization is listed today.',
        es: 'El registro está abierto y hoy no hay ninguna organización inscrita.',
      },
    ],
  },
  '/verificar': {
    faqs: [
      {
        a: {
          en: 'That the copy you hold is identical to the one sealed that day. The Merkle root anchored on DecentralChain is what makes it checkable without asking us.',
          es: 'Que la copia que usted tiene es idéntica a la que se selló ese día. La raíz Merkle anclada en DecentralChain es lo que lo hace comprobable sin pedirnos permiso.',
        },
        q: { en: 'What does verifying a record prove?', es: '¿Qué demuestra verificar un registro?' },
      },
      {
        a: {
          en: 'It does not prove the original datum is correct. If the source published an error, the record preserves the error and the date it was published.',
          es: 'No demuestra que el dato original sea correcto. Si la fuente publicó un error, el registro conserva el error y la fecha en que lo publicó.',
        },
        q: { en: 'What does it not prove?', es: '¿Qué no demuestra?' },
      },
      {
        a: {
          en: 'No. The procedure uses a root anchored on a public chain, and anyone can repeat it against a node that is not ours.',
          es: 'No. El procedimiento usa la raíz anclada en una cadena pública, y cualquiera puede repetirlo contra un nodo que no sea el nuestro.',
        },
        q: { en: 'Do I have to trust DecentralAmerica?', es: '¿Hay que confiar en DecentralAmerica?' },
      },
      {
        a: {
          en: 'This page publishes neither the file nor a link to download it. The copy comes from the original source or from a custodian.',
          es: 'Esta página no publica el archivo ni un enlace para descargarlo. La copia viene de la fuente original o de un custodio.',
        },
        q: { en: 'Where do I get that day’s copy?', es: '¿Dónde consigo la copia de ese día?' },
      },
    ],
    takeaways: [
      {
        en: 'Verifying compares a record against the Merkle root anchored on DecentralChain.',
        es: 'Verificar compara un registro contra la raíz Merkle anclada en DecentralChain.',
      },
      {
        en: 'It proves the copy has not changed since it was sealed. It does not prove the source was right.',
        es: 'Demuestra que la copia no cambió desde que se selló. No demuestra que la fuente tuviera razón.',
      },
      {
        en: 'The procedure assumes you already have that day’s copy.',
        es: 'El procedimiento supone que usted ya tiene la copia de ese día.',
      },
    ],
  },
};
