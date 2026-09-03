import type { T } from '@/lib/i18n';

/**
 * Every figure this site publishes. Nothing on the page may state a fact that is
 * not in this file, and nothing enters this file without a source in the comment
 * above it. Carried over from the DecentralChain site's SOURCE-OF-TRUTH rule,
 * which exists because sourced facts and editorial framing were being mixed in
 * the same sentence with nothing to tell them apart.
 */

export const NODE_URL = 'https://mainnet-node.decentralchain.io';

/** Source: github.com/dylanpersonguy/ancla README, verified 2026-08-26/27. */
export const ANCLA = {
  archiveGb: 3.04,
  /** First and last monthly archive in the mirror. */
  coverage: { from: '2010-12', to: '2026-08' },
  /**
   * Captures of the procurement archives held by the Internet Archive, checked
   * 2026-08-26. Source: ancla/findings/2026-08-26-cross-source.md. Zero is the
   * whole reason a baseline had to be built from scratch: there was nothing to
   * diff against.
   */
  internetArchiveCaptures: 0,
  liveSince: '2026-08-27',
  monthlyArchives: 189,
  resolvedActors: 72_105,
  rowsApprox: 6_000_000,
  /** Running cost of the daily anchor. Source: ancla/README.md. */
  runningCostUsdPerYear: 1,
  /** Closed month-archives revised outside the normal daily window, 2024–2026. */
  silentlyRevisedMonths: 14,
} as const;

/**
 * The five republication events. Archives normally freeze on the last day of
 * their month; these all landed after their own month end, with no public record
 * of what changed. The 2022 cluster is the initial load and is deliberately
 * excluded. Source: github.com/dylanpersonguy/ancla README; reproducible from
 * that repository with `node packages/ingest/src/cli.ts survey`.
 */
export const REPUBLICATIONS = [
  { date: '2024-09-20', months: 7, range: '2024-01 … 2024-08', sizeMb: 144.5 },
  { date: '2024-10-03', months: 1, range: '2024-07', sizeMb: 13.8 },
  { date: '2024-10-04', months: 1, range: '2024-09', sizeMb: 51.1 },
  { date: '2025-05-06', months: 3, range: '2025-02 … 2025-04', sizeMb: 105.2 },
  { date: '2026-08-10', months: 2, range: '2026-06 … 2026-07', sizeMb: 105.7 },
] as const;

/**
 * Contraloría General de la República figures. Source: DFOE-CAP-SGP-00005-2021,
 * and the 2025 OECD Digital Government Index.
 *
 * Never cite the "$135M annual corruption cost" or "37.5% faster processing"
 * figures that circulate in the LACCEI paper: neither survives contact with the
 * report it claims as its source.
 */
export const CGR = {
  institutionsUsingFullSicop: { of: 182, used: 9 },
  oecdDigitalGovIndex2025: { average: 0.7, costaRica: 0.45 },
  /**
   * Millions of colones. Held as a number, not a formatted string: the grouping
   * separator differs by language (₡542.505 in Spanish, ₡542,505 in English) and
   * a pre-formatted value was rendering with English grouping inside Spanish
   * prose. Facts here, presentation at the call site.
   */
  outsideSicopMillionsColones: 542_505,
  /** Share of awarded procurement *resources* — not of contracts. */
  outsideSicopPct2021: 27.1,
} as const;

export type ProgramState = 'live' | 'built' | 'ready' | 'opening';

export type Program = {
  slug: string;
  name: string;
  /** Never "data writer" — that names the plumbing, not the purpose. */
  records: T;
  detail: T;
  state: ProgramState;
  metric: T | null;
};

/**
 * One registry, five instruments that write into it, one custodian network.
 * Ancla is an instrument, not a synonym for the registry — the Registro Público
 * de Integridad is the memory itself.
 */
export const PROGRAMS: Program[] = [
  {
    detail: {
      en: 'A daily copy of the national procurement record, reduced to a fingerprint and anchored on chain. Any later change becomes provable.',
      es: 'Copia diaria del registro nacional de compras públicas, reducido a una huella y anclado en cadena. Cualquier cambio posterior queda demostrable.',
    },
    metric: { en: '189 months · 6M records', es: '189 meses · 6M registros' },
    name: 'Ancla',
    records: {
      en: 'Every public contract the state signs',
      es: 'Cada contrato público que firma el Estado',
    },
    slug: 'ancla',
    state: 'live',
  },
  {
    detail: {
      en: 'What was charged, when it was approved, and how much traffic passed. Published by the regulator, preserved by us.',
      es: 'Lo que se cobró, cuándo se aprobó y cuánto tránsito pasó. Publicado por el regulador, preservado por nosotros.',
    },
    metric: { en: 'key crgov:aresep:*', es: 'clave crgov:aresep:*' },
    name: 'Servicios Públicos',
    records: {
      en: 'Utility tariffs and toll traffic, from ARESEP',
      es: 'Tarifas de servicios públicos y tránsito en peajes, desde ARESEP',
    },
    slug: 'servicios-publicos',
    state: 'built',
  },
  {
    detail: {
      en: 'Indicators with standardized units and versioned methodology, verified by accredited organizations and aligned to the SDGs, ENEC and Bioeconomía 2030.',
      es: 'Indicadores con unidades estandarizadas y metodología versionada, verificados por organizaciones acreditadas y alineados a ODS, ENEC y Bioeconomía 2030.',
    },
    metric: { en: 'versioned methodology', es: 'metodología versionada' },
    name: 'Registro de Impacto',
    records: {
      en: 'Verified civic and environmental outcomes',
      es: 'Resultados cívicos y ambientales verificados',
    },
    slug: 'registro-de-impacto',
    state: 'built',
  },
  {
    detail: {
      en: 'Legal id, type, year, and the organization that vouched for it. The credentialing layer the other registries depend on.',
      es: 'Cédula jurídica, tipo, año, y la organización que respondió por ella. La capa de acreditación de la que dependen los demás registros.',
    },
    metric: null,
    name: 'Registro de Organizaciones',
    records: {
      en: 'Which organizations are real, and who verified them',
      es: 'Qué organizaciones son reales, y quién las verificó',
    },
    slug: 'registro-de-organizaciones',
    state: 'ready',
  },
  {
    detail: {
      en: 'Quests verified with photo, GPS and review by an accredited organization. Each one updates an indicator in the Registro de Impacto.',
      es: 'Misiones verificadas con foto, GPS y revisión de una organización acreditada. Cada una actualiza un indicador del Registro de Impacto.',
    },
    metric: { en: 'live in Costa Rica', es: 'activo en Costa Rica' },
    name: 'Quests',
    records: {
      en: 'How citizens contribute evidence from the field',
      es: 'Cómo la ciudadanía aporta evidencia desde el campo',
    },
    slug: 'quests',
    state: 'live',
  },
  {
    detail: {
      en: 'Universities, professional colleges and newsrooms running nodes with no yield and no stake in what they witness. Who holds the record is the entire question.',
      es: 'Universidades, colegios profesionales y medios operando nodos sin rendimiento financiero ni interés en lo que atestiguan. Quién sostiene el registro es la pregunta entera.',
    },
    metric: null,
    name: 'Nodo Público',
    records: {
      en: 'The institutions that keep the memory',
      es: 'Las instituciones que custodian la memoria',
    },
    slug: 'nodo-publico',
    state: 'opening',
  },
];

/**
 * The regional ladder. Each is the country's real procurement portal — naming
 * them is what proves the work is done.
 *
 * `live` means the whole evidence chain runs for that country every day:
 * mirrored, canonicalised into records, reduced to a Merkle root, and that root
 * committed to DecentralChain. Nothing may be shown as live on a weaker claim
 * than that, and the account is public, so anyone can check the claim.
 *
 * Costa Rica since 2026-08-27. Panamá since 2026-09-03 — 37 archives, a
 * canonicaliser of its own in `schema-pa.ts`, and `latest_pa` on the anchor
 * account. Honduras is deliberately still `planned`: its archives are mirrored,
 * but ONCAE's certificate expired on 2026-07-05 so the fetch is unauthenticated
 * and opt-in, and there is no canonicalisation schema for it, so no records and
 * no meaningful root. Mirroring a country is not the same as anchoring it.
 */
export const COUNTRIES = [
  { code: 'CR', name: 'Costa Rica', portal: 'SICOP', status: 'live' },
  { code: 'PA', name: 'Panamá', portal: 'PanamaCompra', status: 'live' },
  { code: 'GT', name: 'Guatemala', portal: 'Guatecompras', status: 'planned' },
  { code: 'HN', name: 'Honduras', portal: 'HonduCompras', status: 'planned' },
  { code: 'SV', name: 'El Salvador', portal: 'COMPRASAL', status: 'planned' },
  { code: 'NI', name: 'Nicaragua', portal: 'SISCAE', status: 'planned' },
] as const;

/**
 * What operating a node actually involves.
 *
 * Sources: `infra/compose/node-scala.yml:92` for the host sizing ("Scale to 10g
 * for stagenet/mainnet on a 16 GB host") — that is our own operating note, not a
 * published minimum, and the page says so. `infra/LEASING-CUSTODY-DESIGN.md:18`
 * and `website/SOURCE-OF-TRUTH.md` for the generating minimum: feature 1
 * (`SmallerMinimalGeneratingBalance`) would lower it to 1,000 but reads VOTING
 * with zero supporting blocks on mainnet, so 10,000 is the binding figure and
 * the lower one must never be quoted without that condition. Block time from the
 * branding kit.
 */
export const NODE = {
  blockSeconds: 60,
  hostRamGb: 16,
  /** Binding on mainnet today. Feature 1 is not active. */
  minGeneratingBalanceDcc: 10_000,
  software: 'node-scala',
} as const;

/**
 * The anchor account, and the shape of what it holds. All of it is public and
 * readable from a browser: the node reflects the request Origin, so the verifier
 * on this site queries mainnet directly with no backend of ours in between.
 *
 * Keys, from `ancla/contracts/ancla.ride`:
 *   root_<YYYY-MM-DD>_<YYYYMM>   64-char hex Merkle root
 *   meta_<YYYY-MM-DD>_<YYYYMM>   "<canonVersion>|<recordCount>|<archiveSha256>"
 *   latest                       most recent anchored day
 *
 * The contract refuses to overwrite an existing root. A day can only be added,
 * never corrected in place — a system able to rewrite its own history is the
 * thing this exists to detect.
 *
 * ⚠ One day is anchored so far (2026-08-27). The daily job is written and works
 * but is not yet scheduled, per ancla/README.md. Never describe the anchors as a
 * daily series until it runs on a timer.
 */
export const ANCHOR = {
  account: '3DTwG5ZydbJDuLdEmwfgDEH3NuwDrgwQFtF',
  appendOnly: true,
  latestKey: 'latest',
  metaFields: ['canonVersion', 'recordCount', 'archiveSha256'] as const,
} as const;

/**
 * The association's own identity. It is NOT DecentralExchange, the company that
 * operates decentralchain.io — keeping the two apart is not housekeeping, it is
 * the argument the whole custody programme rests on. A record proving what
 * public bodies did cannot be kept by a party with a commercial position in it,
 * and a footer that quietly borrowed a trading company's cédula would hand that
 * objection to the first person who scrolled down.
 *
 * `cedula` is null until the Registro Nacional grants one. An asociación under
 * Ley 218 does not legally exist before registration, so the footer says so in
 * words rather than showing a blank: claiming the status early is exactly the
 * kind of thing this project exists to not do, and it is checkable in a minute.
 */
export const ENTITY = {
  cedula: null,
  /** Where the association operates. True today, and independent of registration. */
  domicile: 'Jacó, Garabito, Costa Rica',
  jurisdiction: 'Costa Rica',
  name: 'DecentralAmerica Asociación',
  registered: false,
} as const;
