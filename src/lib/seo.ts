import type { Lang, T } from '@/lib/i18n';

export const SITE = 'https://decentralamerica.com';
export const SITE_NAME = 'DecentralAmerica';

/**
 * Both say what the association does. The previous pair defined the site by what
 * cannot be done to it ("que nadie puede reescribir") and listed three kinds of
 * record; a search result has one line to earn a click, and neither half of that
 * named the thing that is actually running.
 */
export const TITLE: T = {
  en: "DecentralAmerica — Latin America's permanent public record",
  es: 'DecentralAmerica — El registro público permanente de América Latina',
};

export const DESCRIPTION: T = {
  en: 'A permanent record of public facts: what institutions publish and what is verified in the field, sealed the same day. We start in Costa Rica.',
  es: 'Una memoria permanente de hechos públicos: lo que las instituciones publican y lo que se verifica en campo, sellado el mismo día. Empezamos en Costa Rica.',
};

/** Static routes. Post routes are appended by the prerender from the blog index. */
export const ROUTE_PATHS = [
  // '/' is not here. The home page is home.html, a hand-built scroll page served
  // as a real file; React owns everything below it. prerender.mjs writes it last
  // and adds it to the sitemap itself.
  '/verificar',
  '/organizaciones',
  '/nodo',
  '/financiar',
  '/publicaciones',
] as const;

/**
 * Per-route title and description. Without this every page shipped the site
 * title, so a search result for the custody page was indistinguishable from the
 * home page.
 */
export const ROUTE_META: Record<string, { title: T; description: T }> = {
  '/financiar': {
    description: {
      en: 'What funding a country actually buys: the work of bringing one more national record into the memory. Costa Rica is live; five more portals are named and not started.',
      es: 'Qué compra en realidad financiar un país: el trabajo de incorporar un registro nacional más a la memoria. Costa Rica está activo; hay cinco portales más nombrados y sin empezar.',
    },
    title: { en: 'Fund a country — DecentralAmerica', es: 'Financiar un país — DecentralAmerica' },
  },
  '/nodo': {
    description: {
      en: 'The network of institutions that each keep a complete copy of the memory and check it for themselves. What a node is, what it costs, and what it does not pay.',
      es: 'La red de instituciones que guardan cada una una copia completa de la memoria y la verifican por su cuenta. Qué es un nodo, qué cuesta y qué no paga.',
    },
    title: {
      en: 'Nodo Público — DecentralAmerica',
      es: 'Nodo Público — DecentralAmerica',
    },
  },
  '/organizaciones': {
    description: {
      en: 'The record of which organizations are real and, above all, who vouched for them. What it records, what verification means, and what being listed does not mean.',
      es: 'El registro de qué organizaciones son reales y, sobre todo, quién respondió por ellas. Qué registra, qué significa la verificación y qué no significa estar en la lista.',
    },
    title: {
      en: 'Registro de Organizaciones — DecentralAmerica',
      es: 'Registro de Organizaciones — DecentralAmerica',
    },
  },
  '/publicaciones': {
    description: {
      en: 'Articles, findings from the instruments, and periodic reports.',
      es: 'Artículos, hallazgos de los instrumentos e informes periódicos.',
    },
    title: { en: 'Publications — DecentralAmerica', es: 'Publicaciones — DecentralAmerica' },
  },
  '/verificar': {
    description: {
      en: 'Check a public record against the anchored copy. What verification proves, what it does not, and the root anchored on chain, read live from the public node.',
      es: 'Comprobar un registro público contra la copia anclada. Qué demuestra la verificación, qué no, y la raíz anclada en cadena, leída en vivo desde el nodo público.',
    },
    title: {
      en: 'Verify a record — DecentralAmerica',
      es: 'Verificar un registro — DecentralAmerica',
    },
  },
};

export function canonicalFor(path: string) {
  return `${SITE}${path === '/' ? '' : path.replace(/\/$/, '')}`;
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function metaFor(path: string, lang: Lang = 'es') {
  const title = path === '/' ? TITLE[lang] : `${SITE_NAME}`;
  return { description: DESCRIPTION[lang], title };
}
