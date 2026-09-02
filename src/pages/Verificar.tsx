import { type FormEvent, type ReactNode, useEffect, useId, useState } from 'react';
import { Container, Eyebrow, Mono, Reveal } from '@/components/primitives';
import { type Live, NODE, short } from '@/lib/chain';
import { ANCHOR } from '@/lib/content';
import { useNum, useT } from '@/lib/i18n';

/**
 * `NODE` comes from chain.ts rather than `NODE_URL` in content.ts for the reason
 * NodeProof gives: both hold the same origin, but only chain.ts's is provably
 * the one `fetch` uses, so an address printed beside a value cannot drift from
 * the address the browser actually called.
 */
const ENTRIES_PATH = `/addresses/data/${ANCHOR.account}`;
/** The account has written two transactions in its life, so this is all of them. */
const TX_LIST_PATH = `/transactions/address/${ANCHOR.account}/limit/100`;
const HOST = NODE.replace(/^https?:\/\//, '');

const keyUrl = (key: string) => `${NODE}${ENTRIES_PATH}/${key}`;
const txUrl = (id: string) => `${NODE}/transactions/info/${id}`;
const blockUrl = (height: number) => `${NODE}/blocks/at/${height}`;

const P = 'text-[1.0625rem] leading-relaxed text-muted sm:text-lg';
const STATEMENT = 'text-xl leading-snug font-medium tracking-[-0.02em] text-ink sm:text-2xl';
const LINK =
  'break-all underline decoration-hairline-2 underline-offset-4 transition-colors duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:decoration-ink';

/** One-shot fade as a value lands, and nothing at all under reduced motion. */
const CSS = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes anchor-value-in {
    from { opacity: 0; transform: translate3d(0, 3px, 0); }
    to { opacity: 1; transform: none; }
  }
  .anchor-value-in { animation: anchor-value-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
}
`;

/* -- reading the node ------------------------------------------------------ */

type Entry = { key: string; value: unknown };
type Tx = { data?: unknown; height?: unknown; id?: unknown; timestamp?: unknown };

const isEntries = (v: unknown): v is Entry[] =>
  Array.isArray(v) &&
  v.every((e) => typeof e === 'object' && e !== null && typeof (e as Entry).key === 'string');

/** The address endpoint answers with the transaction list nested one level deep. */
const isTxList = (v: unknown): v is Tx[][] => Array.isArray(v) && Array.isArray(v[0]);

const isTx = (v: unknown): v is Tx =>
  typeof v === 'object' && v !== null && typeof (v as Tx).id === 'string';

/**
 * One read on mount, no interval. A root is written once and the program that
 * holds it will not let it change, so polling would be a request whose answer
 * cannot differ.
 *
 * Always 'loading' on the first render and never a cached value: the page is
 * prerendered, so anything else here is a hydration mismatch. Same reason
 * chain.ts starts every stream that way.
 */
function useRead<T>(path: string, valid: (v: unknown) => v is T): Live<T> {
  const [state, setState] = useState<Live<T>>({ status: 'loading' });

  useEffect(() => {
    let live = true;
    void fetch(`${NODE}${path}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<unknown>;
      })
      .then((body) => {
        if (!live) return;
        setState(valid(body) ? { data: body, status: 'ready' } : { status: 'unavailable' });
      })
      .catch(() => {
        if (live) setState({ status: 'unavailable' });
      });
    return () => {
      live = false;
    };
  }, [path, valid]);

  return state;
}

/**
 * A missing transaction and an unreachable node are different answers and get
 * different words, so this cannot reuse `Live` — a 404 is the node working.
 */
type TxLive =
  | { status: 'loading' }
  | { status: 'ready'; tx: Tx }
  | { status: 'missing' }
  | { status: 'down' };

/* -- the anchor record ----------------------------------------------------- */

type TxRef = { height: number | null; id: string; time: string | null };

type Anchor = {
  archiveSha256: string | null;
  canonVersion: string | null;
  day: string;
  isLatest: boolean;
  metaKey: string;
  recordCount: number | null;
  root: string;
  rootKey: string;
  tx: TxRef | null;
};

type Index = {
  latestDay: string | null;
  rootCount: number;
  roots: { key: string; value: string }[];
  text: (key: string) => string | null;
  txs: Tx[];
};

/**
 * UTC rather than the reader's locale: the timestamp is the network's, not
 * theirs, and a receipt that shifts with the machine reading it is harder to
 * compare against another copy.
 */
function utc(ms: unknown): string | null {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return null;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().replace('T', ' ').slice(0, 19);
}

function dataEntries(tx: Tx): Entry[] {
  if (!Array.isArray(tx.data)) return [];
  return tx.data.filter(
    (d): d is Entry => typeof d === 'object' && d !== null && typeof (d as Entry).key === 'string',
  );
}

function makeIndex(list: Entry[], txs: Tx[]): Index {
  const text = (key: string) => {
    const hit = list.find((e) => e.key === key);
    return typeof hit?.value === 'string' && hit.value.length > 0 ? hit.value : null;
  };
  const roots = list.flatMap((e) =>
    e.key.startsWith('root_') && typeof e.value === 'string' && e.value.length > 0
      ? [{ key: e.key, value: e.value }]
      : [],
  );
  return { latestDay: text(ANCHOR.latestKey), rootCount: roots.length, roots, text, txs };
}

/** The transaction that wrote this key, so the panel can show where it came from. */
function txFor(rootKey: string, txs: Tx[]): TxRef | null {
  const hit = txs.find((tx) => dataEntries(tx).some((d) => d.key === rootKey));
  if (hit === undefined || typeof hit.id !== 'string') return null;
  return {
    height: typeof hit.height === 'number' && hit.height > 0 ? hit.height : null,
    id: hit.id,
    time: utc(hit.timestamp),
  };
}

/**
 * The month suffix on a key is not derivable from the day — the one anchored
 * root is `root_2026-08-27_202512` — so keys are matched by prefix rather than
 * built, and the meta key is taken from the root key's own suffix. That is what
 * keeps every row of a result describing one anchor instead of two.
 */
function metaKeyFor(rootKey: string) {
  return `meta_${rootKey.slice('root_'.length)}`;
}

/** `<canonVersion>|<recordCount>|<archiveSha256>`, read in one place only. */
function metaParts(ix: Index, rootKey: string) {
  return (ix.text(metaKeyFor(rootKey)) ?? '').split('|');
}

function anchorAt(ix: Index, rootKey: string): Anchor | null {
  const root = ix.roots.find((r) => r.key === rootKey);
  if (root === undefined) return null;
  const day = rootKey.slice('root_'.length).split('_')[0] ?? '';
  const metaKey = metaKeyFor(rootKey);
  const [canonVersion, count, sha] = metaParts(ix, rootKey);
  return {
    archiveSha256: sha ?? null,
    canonVersion: canonVersion ?? null,
    day,
    isLatest: ix.latestDay !== null && ix.latestDay === day,
    metaKey,
    recordCount: count !== undefined && /^\d+$/.test(count) ? Number(count) : null,
    root: root.value,
    rootKey,
    tx: txFor(rootKey, ix.txs),
  };
}

function anchorOnDay(ix: Index, day: string): Anchor | null {
  const root = ix.roots.find((r) => r.key.startsWith(`root_${day}_`));
  return root === undefined ? null : anchorAt(ix, root.key);
}

function latestAnchor(ix: Index): Anchor | null {
  return ix.latestDay === null ? null : anchorOnDay(ix, ix.latestDay);
}

/* -- what the reader typed ------------------------------------------------- */

type Shape = 'date' | 'root' | 'key' | 'tx' | 'unknown';

/**
 * Trimmed, and forgiving about how a date is written: `2026/8/27` is the same
 * question as `2026-08-27` and refusing it would be pedantry rather than rigour.
 * Nothing else is coerced — a near-miss hash is a different value, not a typo to
 * guess at.
 */
function normalize(raw: string): string {
  const q = raw.trim();
  const date = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(q);
  if (date !== null) {
    const [, y = '', m = '', d = ''] = date;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return /^[0-9a-fA-F]{64}$/.test(q) ? q.toLowerCase() : q;
}

/**
 * Shapes cannot collide: a root is exactly 64 hex characters, a transaction id
 * is 43 or 44 base58 ones, and base58 has no `0`, so no string satisfies both.
 */
function shapeOf(q: string): Shape {
  if (/^\d{4}-\d{2}-\d{2}$/.test(q)) return 'date';
  if (/^[0-9a-f]{64}$/.test(q)) return 'root';
  if (q === ANCHOR.latestKey || /^(root|meta)_\d{4}-\d{2}-\d{2}_\d{6}$/.test(q)) return 'key';
  if (/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(q)) return 'tx';
  return 'unknown';
}

type Miss = 'date' | 'root' | 'key' | 'tx-missing' | 'tx-not-anchor';

/** 'sha' is not an input shape: it is a 64-hex query that turned out to be one. */
type Via = 'date' | 'key' | 'latest' | 'root' | 'sha' | 'tx';

type Result =
  | { anchor: Anchor; kind: 'anchor'; via: Via }
  | { kind: 'loading' }
  | { kind: 'down' }
  | { kind: 'empty' }
  | { ix: Index; kind: 'miss'; reason: Miss; value: string }
  | { kind: 'unknown'; value: string };

/**
 * Pure, so every state the panel can show is reachable by reasoning about the
 * inputs rather than by clicking. Nothing falls back to a previous answer: a
 * query in flight is `loading`, not the last result left on screen.
 */
function resolve(
  loading: boolean,
  ix: Index | null,
  submitted: string,
  txLive: { live: TxLive; q: string } | null,
): Result {
  if (loading) return { kind: 'loading' };
  if (ix === null) return { kind: 'down' };

  if (submitted === '') {
    const anchor = latestAnchor(ix);
    return anchor === null ? { kind: 'empty' } : { anchor, kind: 'anchor', via: 'latest' };
  }

  const shape = shapeOf(submitted);

  if (shape === 'date') {
    const anchor = anchorOnDay(ix, submitted);
    return anchor === null
      ? { ix, kind: 'miss', reason: 'date', value: submitted }
      : { anchor, kind: 'anchor', via: 'date' };
  }

  if (shape === 'root') {
    const hit = ix.roots.find((r) => r.value.toLowerCase() === submitted);
    if (hit !== undefined) {
      const anchor = anchorAt(ix, hit.key);
      if (anchor !== null) return { anchor, kind: 'anchor', via: 'root' };
    }
    /*
     * An archive hash is 64 hex characters too, and the panel prints it directly
     * under the root, so it is the other value a reader will paste back in.
     * Answering "no such root" to a number this page just showed them would be
     * true and useless.
     */
    const bySha = ix.roots.find((r) => (metaParts(ix, r.key)[2] ?? '').toLowerCase() === submitted);
    if (bySha !== undefined) {
      const anchor = anchorAt(ix, bySha.key);
      if (anchor !== null) return { anchor, kind: 'anchor', via: 'sha' };
    }
    return { ix, kind: 'miss', reason: 'root', value: submitted };
  }

  if (shape === 'key') {
    const rootKey =
      submitted === ANCHOR.latestKey
        ? (ix.roots.find((r) => r.key.startsWith(`root_${ix.latestDay}_`))?.key ?? '')
        : `root_${submitted.slice(submitted.indexOf('_') + 1)}`;
    const anchor = anchorAt(ix, rootKey);
    return anchor === null
      ? { ix, kind: 'miss', reason: 'key', value: submitted }
      : { anchor, kind: 'anchor', via: 'key' };
  }

  if (shape === 'tx') {
    // The effect that fetches it has not caught up with the field yet.
    if (txLive === null || txLive.q !== submitted || txLive.live.status === 'loading') {
      return { kind: 'loading' };
    }
    if (txLive.live.status === 'down') return { kind: 'down' };
    if (txLive.live.status === 'missing') {
      return { ix, kind: 'miss', reason: 'tx-missing', value: submitted };
    }
    const wrote = dataEntries(txLive.live.tx).find((d) => d.key.startsWith('root_'));
    const anchor = wrote === undefined ? null : anchorAt(ix, wrote.key);
    return anchor === null
      ? { ix, kind: 'miss', reason: 'tx-not-anchor', value: submitted }
      : { anchor, kind: 'anchor', via: 'tx' };
  }

  return { kind: 'unknown', value: submitted };
}

/* -- the panel ------------------------------------------------------------- */

function Row({
  children,
  label,
  valueClassName = 'text-ink',
}: {
  children: ReactNode;
  label: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid gap-1 border-t border-hairline py-3.5 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <dt className="eyebrow">{label}</dt>
      <dd className={`mono-data ${valueClassName}`}>{children}</dd>
    </div>
  );
}

/** The value itself is the link: following it shows the node's own answer for it. */
function Value({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      className={`anchor-value-in inline-block ${LINK}`}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

function Said({ children, tone = 'text-muted' }: { children: ReactNode; tone?: string }) {
  return (
    <p aria-live="polite" className={`mono-data ${tone}`}>
      {children}
    </p>
  );
}

export default function Verificar() {
  const t = useT();
  const num = useNum();

  const entries = useRead(ENTRIES_PATH, isEntries);
  const txList = useRead(TX_LIST_PATH, isTxList);
  const txs = txList.status === 'ready' ? (txList.data[0] ?? []) : [];

  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [txLive, setTxLive] = useState<{ live: TxLive; q: string } | null>(null);
  const fieldId = useId();

  /**
   * Only a transaction id needs a request of its own. Every other shape is
   * answered from the account's own entries, which are already in hand.
   */
  useEffect(() => {
    if (submitted === '' || shapeOf(submitted) !== 'tx') {
      setTxLive(null);
      return;
    }
    let live = true;
    setTxLive({ live: { status: 'loading' }, q: submitted });
    void fetch(txUrl(submitted))
      .then(async (res): Promise<TxLive> => {
        if (res.status === 404) return { status: 'missing' };
        if (!res.ok) return { status: 'down' };
        const body: unknown = await res.json();
        return isTx(body) ? { status: 'ready', tx: body } : { status: 'missing' };
      })
      .then((live2) => {
        if (live) setTxLive({ live: live2, q: submitted });
      })
      .catch(() => {
        if (live) setTxLive({ live: { status: 'down' }, q: submitted });
      });
    return () => {
      live = false;
    };
  }, [submitted]);

  const ix = entries.status === 'ready' ? makeIndex(entries.data, txs) : null;
  const result = resolve(entries.status === 'loading', ix, submitted, txLive);
  const anchor = result.kind === 'anchor' ? result.anchor : null;

  const ask = (raw: string) => {
    const q = normalize(raw);
    setInput(q);
    setSubmitted(q);
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  /**
   * The examples are read from the node like everything else rather than written
   * down. Most visitors have no root or transaction id to hand, and a demo
   * nobody can trigger is a dead demo — but a demo whose values could go stale
   * would be worse than none on a page about things not changing.
   */
  const example = ix === null ? null : latestAnchor(ix);
  const chips: { hint: string; value: string }[] = [];
  if (example !== null) {
    chips.push({ hint: t({ en: 'a date', es: 'una fecha' }), value: example.day });
    chips.push({ hint: t({ en: 'a root', es: 'una raíz' }), value: example.root });
    if (example.tx !== null) {
      chips.push({ hint: t({ en: 'a transaction', es: 'una transacción' }), value: example.tx.id });
    }
  }

  const heading = t({ en: 'Result', es: 'Resultado' });
  const via: Record<Via, string> = {
    date: t({ en: 'matched by day', es: 'coincidencia por día' }),
    key: t({ en: 'matched by key', es: 'coincidencia por clave' }),
    latest: t({
      en: 'no query · the most recent anchor',
      es: 'sin consulta · el ancla más reciente',
    }),
    root: t({ en: 'matched by root', es: 'coincidencia por raíz' }),
    sha: t({ en: 'matched by archive hash', es: 'coincidencia por hash del archivo' }),
    tx: t({ en: 'matched by transaction', es: 'coincidencia por transacción' }),
  };

  return (
    <Container className="pt-[clamp(5.5rem,11vh,8rem)] pb-32">
      <Reveal as="header" className="max-w-[46rem]">
        <Eyebrow>{t({ en: 'Verify', es: 'Verificar' })}</Eyebrow>
        <h1 className="display-2 mt-5">
          {t({
            en: 'Check that a record did not change.',
            es: 'Compruebe que un registro no cambió.',
          })}
        </h1>
        <p className="lede mt-6 max-w-[42ch]">
          {t({
            en: 'That is the only thing a verification proves. Type a day, a root or a transaction, and your browser resolves it against the public node with nothing of ours in between.',
            es: 'Es lo único que prueba una verificación. Escriba un día, una raíz o una transacción, y su navegador la resuelve contra el nodo público sin nada nuestro en medio.',
          })}
        </p>
      </Reveal>

      {/* The instrument, above everything. The argument for it is underneath. */}
      <Reveal as="section" aria-labelledby={`${fieldId}-label`} className="mt-10 sm:mt-12">
        <style>{CSS}</style>

        <search>
          <form onSubmit={onSubmit}>
            <label className="eyebrow" htmlFor={fieldId} id={`${fieldId}-label`}>
              {t({ en: 'Look up an anchor', es: 'Consultar un ancla' })}
            </label>
            <div className="card mt-3 flex flex-col gap-2 p-2.5 focus-within:[outline:2px_solid_var(--color-ink)] focus-within:[outline-offset:3px] sm:flex-row sm:items-center">
              <input
                autoComplete="off"
                className="w-full bg-transparent px-4 py-3 font-mono text-[0.9375rem] tracking-[-0.01em] text-ink placeholder:text-faint focus:outline-none sm:text-base"
                id={fieldId}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t({
                  en: 'a day, a root, a transaction id, an anchor key',
                  es: 'un día, una raíz, un id de transacción, una clave',
                })}
                spellCheck={false}
                type="search"
                value={input}
              />
              <button
                className="shrink-0 rounded-xl bg-ink px-6 py-3 text-[0.9375rem] font-medium text-ground transition-[transform,translate,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_10px_28px_rgba(10,10,11,0.16)]"
                type="submit"
              >
                {t({ en: 'Look up', es: 'Consultar' })}
              </button>
            </div>
          </form>
        </search>

        {chips.length > 0 || submitted !== '' ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            {chips.length > 0 ? (
              <span className="eyebrow">{t({ en: 'Try', es: 'Pruebe' })}</span>
            ) : null}
            {chips.map((chip) => (
              <button
                className="card card-lift mono-data px-3.5 py-2 text-muted hover:-translate-y-[1px] hover:text-ink"
                key={chip.value}
                onClick={() => ask(chip.value)}
                type="button"
              >
                <span className="text-faint">{chip.hint}</span> {short(chip.value, 8, 6)}
              </button>
            ))}
            {submitted !== '' ? (
              <button
                className="text-[0.8125rem] text-muted underline underline-offset-4 transition-colors duration-300 hover:text-ink"
                onClick={() => ask('')}
                type="button"
              >
                {t({ en: 'Back to the latest anchor', es: 'Volver al ancla más reciente' })}
              </button>
            ) : null}
          </div>
        ) : null}

        <figure className="card mt-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="eyebrow">{heading}</p>
            {result.kind === 'anchor' ? <p className="eyebrow">{via[result.via]}</p> : null}
          </div>

          {result.kind === 'loading' ? (
            <div className="mt-5">
              <Said tone="text-faint">
                {t({ en: 'asking the node…', es: 'consultando el nodo…' })}
              </Said>
            </div>
          ) : null}

          {result.kind === 'down' ? (
            <div className="mt-5">
              <Said>
                {t({
                  en: 'the node is not answering right now.',
                  es: 'el nodo no está respondiendo en este momento.',
                })}
              </Said>
              <p className={`${P} mt-3 max-w-[52ch] text-[0.9375rem]`}>
                {t({
                  en: 'There is no saved copy to show in its place, and nothing on this page is filled in from one.',
                  es: 'No hay una copia guardada para mostrar en su lugar, y nada en esta página se rellena con una.',
                })}
              </p>
            </div>
          ) : null}

          {result.kind === 'empty' ? (
            <div className="mt-5">
              <Said>
                {t({
                  en: 'the account answered, and it holds no anchored root.',
                  es: 'la cuenta respondió, y no tiene ninguna raíz anclada.',
                })}
              </Said>
              <p className={`${P} mt-3 max-w-[52ch] text-[0.9375rem]`}>
                {t({
                  en: 'No value is put in its place.',
                  es: 'No se pone ningún valor en su lugar.',
                })}
              </p>
            </div>
          ) : null}

          {result.kind === 'unknown' ? (
            <div className="mt-5">
              <Said>
                {t({
                  en: 'that is not a shape this can look up.',
                  es: 'esa no es una forma que esto pueda consultar.',
                })}
              </Said>
              <p className={`${P} mt-3 max-w-[56ch] text-[0.9375rem]`}>
                {t({
                  en: 'It accepts a day as 2026-08-27, a Merkle root as 64 hexadecimal characters, a transaction id in base58, or an anchor key such as root_2026-08-27_202512.',
                  es: 'Acepta un día como 2026-08-27, una raíz Merkle de 64 caracteres hexadecimales, un id de transacción en base58, o una clave de ancla como root_2026-08-27_202512.',
                })}
              </p>
            </div>
          ) : null}

          {result.kind === 'miss' ? (
            <div className="mt-5">
              <Said>
                {result.reason === 'date'
                  ? t({
                      en: 'no root is published for that day.',
                      es: 'no hay ninguna raíz publicada para ese día.',
                    })
                  : null}
                {result.reason === 'root'
                  ? t({
                      en: 'no published root or archive hash has that value.',
                      es: 'ninguna raíz ni ningún hash de archivo publicado tiene ese valor.',
                    })
                  : null}
                {result.reason === 'key'
                  ? t({ en: 'the account holds no such key.', es: 'la cuenta no tiene esa clave.' })
                  : null}
                {result.reason === 'tx-missing'
                  ? t({
                      en: 'the node has no transaction with that id.',
                      es: 'el nodo no tiene ninguna transacción con ese id.',
                    })
                  : null}
                {result.reason === 'tx-not-anchor'
                  ? t({
                      en: 'that transaction exists and writes no root.',
                      es: 'esa transacción existe y no escribe ninguna raíz.',
                    })
                  : null}
              </Said>

              {/* The common miss by far, because there is one anchored day. */}
              {result.reason === 'date' ? (
                <p className={`${P} mt-3 max-w-[56ch] text-[0.9375rem]`}>
                  {result.ix.rootCount === 1
                    ? t({
                        en: 'One day is anchored so far, and it is',
                        es: 'Hasta ahora hay un solo día anclado, y es',
                      })
                    : t({
                        en: `${num(result.ix.rootCount)} days are anchored so far. The most recent is`,
                        es: `Hasta ahora hay ${num(result.ix.rootCount)} días anclados. El más reciente es`,
                      })}{' '}
                  {result.ix.latestDay !== null ? (
                    <button
                      className={`${LINK} font-mono text-[0.8125rem] text-ink`}
                      onClick={() => ask(result.ix.latestDay ?? '')}
                      type="button"
                    >
                      {result.ix.latestDay}
                    </button>
                  ) : null}
                  {'. '}
                  {t({
                    en: 'A day with no root is the ordinary answer here, not a failure.',
                    es: 'Un día sin raíz es la respuesta habitual acá, no una falla.',
                  })}
                </p>
              ) : null}

              <p className={`${P} mt-3 max-w-[56ch] text-[0.9375rem]`}>
                {t({
                  en: 'This looks up anchors: anchored days, roots, and the transaction that wrote them. A contract number finds nothing here.',
                  es: 'Esto consulta anclas: días anclados, raíces y la transacción que las escribió. Un número de contrato no encuentra nada acá.',
                })}
              </p>
            </div>
          ) : null}

          {anchor !== null ? (
            <dl aria-live="polite" className="mt-5">
              <Row label={t({ en: 'Anchored day', es: 'Día anclado' })}>
                {anchor.isLatest ? (
                  <Value href={keyUrl(ANCHOR.latestKey)}>
                    <span className="text-lg sm:text-xl">{anchor.day}</span>
                  </Value>
                ) : (
                  <span className="anchor-value-in inline-block text-lg sm:text-xl">
                    {anchor.day}
                  </span>
                )}
              </Row>

              <Row label={t({ en: 'Merkle root', es: 'Raíz Merkle' })}>
                <Value href={keyUrl(anchor.rootKey)}>{anchor.root}</Value>
              </Row>

              {anchor.canonVersion !== null ? (
                <Row label={t({ en: 'Canonicalizer', es: 'Canonizador' })}>
                  <Value href={keyUrl(anchor.metaKey)}>{anchor.canonVersion}</Value>
                </Row>
              ) : null}

              {anchor.recordCount !== null ? (
                <Row label={t({ en: 'Records', es: 'Registros' })}>
                  <Value href={keyUrl(anchor.metaKey)}>{num(anchor.recordCount)}</Value>
                </Row>
              ) : null}

              {anchor.archiveSha256 !== null ? (
                <Row label={t({ en: 'Archive SHA-256', es: 'SHA-256 del archivo' })}>
                  <Value href={keyUrl(anchor.metaKey)}>{anchor.archiveSha256}</Value>
                </Row>
              ) : null}

              {anchor.tx !== null ? (
                <Row label={t({ en: 'Written by', es: 'Escrita por' })}>
                  <Value href={txUrl(anchor.tx.id)}>{anchor.tx.id}</Value>
                </Row>
              ) : null}

              {anchor.tx?.height != null ? (
                <Row label={t({ en: 'Block height', es: 'Altura del bloque' })}>
                  <Value href={blockUrl(anchor.tx.height)}>{num(anchor.tx.height)}</Value>
                </Row>
              ) : null}

              {anchor.tx?.time != null ? (
                <Row label={t({ en: 'Time (UTC)', es: 'Hora (UTC)' })}>
                  <Value href={txUrl(anchor.tx.id)}>{anchor.tx.time}</Value>
                </Row>
              ) : null}

              {/* Rendered off the index rather than a fallback, so there is no
                  branch in which this row can print a zero. */}
              {ix !== null ? (
                <Row label={t({ en: 'Roots published', es: 'Raíces publicadas' })}>
                  <span className="anchor-value-in inline-block">{num(ix.rootCount)}</span>
                </Row>
              ) : null}
            </dl>
          ) : null}

          <figcaption className="rule mt-6 max-w-[60ch] pt-6 text-[0.9375rem] leading-relaxed text-muted">
            <span className="block">
              {t({
                en: 'Every value here is read from the public node when you ask for it, and each one links to the request that returns it on its own, so you can make that request yourself and compare. None of it is written into the page.',
                es: 'Cada valor de acá se lee del nodo público en el momento en que usted lo pide, y cada uno enlaza a la consulta que lo devuelve por separado, para que usted la haga por su cuenta y compare. Ninguno está escrito en la página.',
              })}
            </span>
            {ix !== null ? (
              <span className="mt-3 block">
                {ix.rootCount === 1
                  ? t({
                      en: 'One root is published so far, and that is the count the node just returned.',
                      es: 'Hasta ahora hay una sola raíz publicada, y ese es el conteo que acaba de devolver el nodo.',
                    })
                  : t({
                      en: `${num(ix.rootCount)} roots are published so far, and that is the count the node just returned.`,
                      es: `Hasta ahora hay ${num(ix.rootCount)} raíces publicadas, y ese es el conteo que acaba de devolver el nodo.`,
                    })}{' '}
                {t({
                  en: 'The job that anchors a day is written and works, but it does not run on a schedule yet. This is not a daily series and we are not going to draw it as one.',
                  es: 'El trabajo que ancla un día está escrito y funciona, pero todavía no corre en un horario. Esto no es una serie diaria y no la vamos a dibujar como si lo fuera.',
                })}
              </span>
            ) : null}
          </figcaption>
        </figure>

        {/*
         * Directly under the field, where someone who just got nothing back will
         * read it. The page now looks like a tool, which makes overclaiming its
         * reach easier and worse.
         */}
        <p className={`${P} mt-8 max-w-[52rem]`}>
          <strong className="font-medium text-ink">
            {t({
              en: 'This searches anchors, not contracts.',
              es: 'Esto busca anclas, no contratos.',
            })}
          </strong>{' '}
          {t({
            en: 'A contract number returns nothing, because the per-record proofs that would let a single contract be checked are served at no public address. We could put a field here that returned something green, and it would not be checking anything.',
            es: 'Un número de contrato no devuelve nada, porque las pruebas por registro que permitirían comprobar un contrato suelto no se sirven en ninguna dirección pública. Podríamos poner una casilla que devolviera algo en verde, y no estaría comprobando nada.',
          })}
        </p>
      </Reveal>

      <Reveal as="section" className="rule mt-20 scroll-mt-24 pt-10 sm:mt-24 sm:pt-12" id="alcance">
        <Eyebrow>{t({ en: 'The scope', es: 'El alcance' })}</Eyebrow>
        <h2 className="display-3 mt-4 max-w-[24ch]">
          {t({
            en: 'What a verification proves, and what it does not',
            es: 'Qué prueba una verificación, y qué no',
          })}
        </h2>

        <p className={`${P} mt-8 max-w-[46rem]`}>
          {t({
            en: 'The root is computed over the archive as it stood the day it was anchored. Comparing against it answers one question: whether the copy in front of you is the copy from that day.',
            es: 'La raíz se calcula sobre el archivo tal como estaba el día que se ancló. Compararla responde una sola pregunta: si la copia que usted tiene enfrente es la de ese día.',
          })}
        </p>

        {/*
         * Side by side and at the same size on purpose. Split across a page, the
         * limits read as fine print, which is the failure this page exists to
         * avoid — more so now that the tool is the first thing on screen.
         */}
        <div className="mt-9 grid max-w-[52rem] gap-10 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow text-confirmed-ink">{t({ en: 'It proves', es: 'Prueba' })}</h3>
            <ul className={`${P} mt-4 space-y-3`}>
              {(
                [
                  {
                    en: 'That a published record changed, or did not change, forward from the moment it was anchored.',
                    es: 'Que un registro publicado cambió, o no cambió, desde el momento en que se ancló.',
                  },
                  {
                    en: "That the day's archive you hold is the one that was anchored, byte for byte.",
                    es: 'Que el archivo de ese día que usted tiene es el que se ancló, byte por byte.',
                  },
                  {
                    en: 'That the check does not run through us. Anyone holding the archive and the root can do it without asking.',
                    es: 'Que la comprobación no pasa por nosotros. Cualquiera con el archivo y la raíz la hace sin pedir permiso.',
                  },
                ] as const
              ).map((x) => (
                <li key={x.en}>{t(x)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow">{t({ en: 'It does not prove', es: 'No prueba' })}</h3>
            <ul className={`${P} mt-4 space-y-3`}>
              {(
                [
                  {
                    en: 'That the record is true. A badly written contract anchors exactly as well as a correct one.',
                    es: 'Que el registro sea cierto. Un contrato mal hecho se ancla igual de bien que uno correcto.',
                  },
                  {
                    en: 'That there was no wrongdoing. It sees a document change, not a decision.',
                    es: 'Que no hubo un acto indebido. Ve cambiar un documento, no una decisión.',
                  },
                  {
                    en: 'Anything before the day it was anchored. Whatever was edited earlier was already edited when we arrived.',
                    es: 'Nada anterior al día en que se ancló. Lo que se editó antes ya estaba editado cuando llegamos.',
                  },
                  {
                    en: 'Anything that was never published. A record that does not reach the portal does not reach the archive.',
                    es: 'Nada que no se haya publicado. Un registro que no llega al portal no llega al archivo.',
                  },
                ] as const
              ).map((x) => (
                <li key={x.en}>{t(x)}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className={`${STATEMENT} mt-10 max-w-[46rem]`}>
          {t({
            en: 'It does one thing: it stops the published past from being quietly editable.',
            es: 'Sirve para una sola cosa: que el pasado publicado no se pueda editar en silencio.',
          })}
        </p>
        <p className={`${P} mt-5 max-w-[46rem]`}>
          {t({
            en: 'A record that has not changed says nothing about who signed it. Which organizations are real, and who vouched for them, is a separate register and lives in',
            es: 'Que un registro no haya cambiado no dice nada de quién lo firmó. Qué organizaciones son reales y quién respondió por ellas es otro registro, y vive en',
          })}{' '}
          <a className="underline underline-offset-4 hover:text-ink" href="/organizaciones">
            {t({ en: 'Organizaciones', es: 'Organizaciones' })}
          </a>
          .
        </p>
      </Reveal>

      <Reveal as="section" className="rule mt-20 scroll-mt-24 pt-10 sm:mt-24 sm:pt-12" id="regla">
        <Eyebrow>{t({ en: 'The rule', es: 'La regla' })}</Eyebrow>
        <h2 className="display-3 mt-4 max-w-[24ch]">
          {t({ en: 'A root is never overwritten', es: 'Una raíz no se sobrescribe' })}
        </h2>
        <div className="mt-8 max-w-[46rem]">
          <p className={P}>
            {t({
              en: 'The program holding these values refuses to write over a key that already exists. A day can be added. A day cannot be corrected.',
              es: 'El programa que guarda estos valores se niega a escribir sobre una clave que ya existe. Se puede agregar un día. No se puede corregir uno.',
            })}
          </p>
          <p className={`${STATEMENT} mt-8`}>
            {t({
              en: 'A system able to rewrite its own history is the thing this exists to detect.',
              es: 'Un sistema capaz de reescribir su propia historia es justamente lo que esto existe para detectar.',
            })}
          </p>
          <p className={`${P} mt-8`}>
            {t({
              en: 'The rule applies to us first. A mistake of ours cannot be tidied away later: it stays published under the day it was written, and anyone comparing finds it. A verifier able to edit its own record would be worth no more than the word of whoever runs it.',
              es: 'La regla nos aplica a nosotros primero. Un error nuestro no se puede acomodar después: queda publicado bajo el día en que se escribió, y cualquiera que compare lo encuentra. Un verificador capaz de editar su propio registro no valdría más que la palabra de quien lo opera.',
            })}
          </p>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="rule mt-20 scroll-mt-24 pt-10 sm:mt-24 sm:pt-12"
        id="comprobar"
      >
        <Eyebrow>{t({ en: 'The procedure', es: 'El procedimiento' })}</Eyebrow>
        <h2 className="display-3 mt-4 max-w-[24ch]">
          {t({
            en: 'How you would check a record yourself',
            es: 'Cómo comprobaría un registro usted mismo',
          })}
        </h2>
        <div className="mt-8 max-w-[46rem]">
          <p className={`${P} mb-8`}>
            {t({
              en: 'The lookup above gives you the root. What it cannot do is compare a record against it for you, so this is the part you do by hand, and it needs the whole archive for the anchored day.',
              es: 'La consulta de arriba le da la raíz. Lo que no puede hacer es comparar un registro contra ella por usted, así que esta es la parte que se hace a mano, y exige el archivo completo del día anclado.',
            })}
          </p>
          <ol className="grid gap-px overflow-hidden rounded-2xl bg-hairline">
            {(
              [
                {
                  en: 'Get the archive for the anchored day. This page does not publish it, so it is the copy you already hold or one you obtain from the source.',
                  es: 'Consiga el archivo del día anclado. Esta página no lo publica, así que es la copia que usted ya tenga o una que obtenga de la fuente.',
                },
                {
                  en: 'Compute its SHA-256 and compare it with the one above. If they match, the archive you hold is the one that was anchored.',
                  es: 'Calcule su SHA-256 y compárelo con el de arriba. Si coinciden, el archivo que usted tiene es el que se ancló.',
                },
                {
                  en: 'Normalize every record with the canonicalizer version above, and hash each one into a leaf.',
                  es: 'Normalice cada registro con la versión del canonizador de arriba, y calcule la hoja de cada uno.',
                },
                {
                  en: 'Build the tree, take its root, and compare it with the published root. If it matches, your record was in the set anchored that day, with the content you are holding.',
                  es: 'Arme el árbol, tome su raíz y compárela con la raíz publicada. Si coincide, su registro estaba en el conjunto anclado ese día, con el contenido que usted tiene.',
                },
                {
                  en: 'If it does not match, something moved between that day and the copy in your hands. The comparison tells you that it changed, not what changed.',
                  es: 'Si no coincide, algo se movió entre ese día y la copia que tiene en la mano. La comparación le dice que cambió, no qué cambió.',
                },
              ] as const
            ).map((step, i) => (
              <li className="flex gap-5 bg-ground px-6 py-5" key={step.en}>
                <Mono className="pt-1 text-faint">{String(i + 1).padStart(2, '0')}</Mono>
                <span className="text-[1.0625rem] leading-relaxed text-ink">{t(step)}</span>
              </li>
            ))}
          </ol>
          <p className={`${P} mt-9`}>
            {t({
              en: 'The whole archive is needed because checking one record on its own requires the sibling hashes along its branch, and those are not served anywhere public. That single missing piece is the difference between the lookup above and a tool that could answer for one contract.',
              es: 'Hace falta el archivo entero porque comprobar un registro solo exige las hojas hermanas de su rama, y esas no se sirven en ningún lugar público. Esa única pieza que falta es la diferencia entre la consulta de arriba y una herramienta capaz de responder por un contrato.',
            })}
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="rule mt-20 scroll-mt-24 pt-10 sm:mt-24 sm:pt-12" id="falta">
        <Eyebrow>{t({ en: 'Pending', es: 'Pendiente' })}</Eyebrow>
        <h2 className="display-3 mt-4 max-w-[24ch]">
          {t({ en: 'What does not exist yet', es: 'Lo que todavía no existe' })}
        </h2>
        <div className="mt-8 max-w-[52rem]">
          <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
            <div>
              <dt className="eyebrow">
                {t({ en: 'The daily schedule', es: 'El horario diario' })}
              </dt>
              <dd className={`${P} mt-2`}>
                {t({
                  en: 'The job that anchors a day is written and works. Nothing runs it on a timer, which is why the lookup above finds what it finds and no more.',
                  es: 'El trabajo que ancla un día está escrito y funciona. Nada lo ejecuta en automático, y por eso la consulta de arriba encuentra lo que encuentra y no más.',
                })}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">
                {t({ en: 'The lookup service', es: 'El servicio de consulta' })}
              </dt>
              <dd className={`${P} mt-2`}>
                {t({
                  en: 'Per-record proofs are not served anywhere public. Until they are, checking a single contract means holding the archive for its day.',
                  es: 'Las pruebas por registro no se sirven en ningún lugar público. Mientras no lo estén, comprobar un contrato suelto exige tener el archivo de su día.',
                })}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">{t({ en: 'The archive itself', es: 'El archivo mismo' })}</dt>
              <dd className={`${P} mt-2`}>
                {t({
                  en: "This page publishes neither the archive nor a link to download it. The procedure above assumes you already have that day's copy.",
                  es: 'Esta página no publica el archivo ni un enlace para descargarlo. El procedimiento de arriba supone que usted ya tiene la copia de ese día.',
                })}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">
                {t({ en: 'A second opinion', es: 'Una segunda opinión' })}
              </dt>
              <dd className={`${P} mt-2`}>
                {t({
                  en: 'No outside institution keeps a copy of the memory yet. Independent copies agreeing is what would make this check strong, and that part still depends on the custody programme.',
                  es: 'Todavía ninguna institución externa guarda una copia de la memoria. Que copias independientes coincidan es lo que haría fuerte esta comprobación, y esa parte todavía depende del programa de custodia.',
                })}
              </dd>
            </div>
          </dl>
          <p className={`${P} mt-9 max-w-[46rem]`}>
            {t({
              en: 'Each of these will appear here when it works, in a form you can check for yourself rather than take from us.',
              es: 'Cada una de estas aparecerá acá cuando funcione, de una forma que usted pueda comprobar y no que tenga que aceptarnos.',
            })}
          </p>
        </div>
      </Reveal>

      {/* The one technical disclosure, closed by default, as on the other pages. */}
      <Reveal className="mt-16">
        <details className="max-w-[46rem] border-t border-hairline pt-6">
          <summary className="eyebrow cursor-pointer text-ink">
            {t({
              en: 'For those who want the technical detail',
              es: 'Para quien quiera el detalle técnico',
            })}
          </summary>
          <div className={`${P} mt-5 space-y-4`}>
            <p>
              {t({
                en: 'The values live as data entries on the public account',
                es: 'Los valores viven como entradas de datos en la cuenta pública',
              })}{' '}
              <Mono className="break-all text-ink">{ANCHOR.account}</Mono>
              {t({
                en: ', readable without an account or a key at',
                es: ', legibles sin cuenta ni clave en',
              })}{' '}
              <a className={LINK} href={`${NODE}${ENTRIES_PATH}`} rel="noreferrer" target="_blank">
                <Mono>{`${HOST}${ENTRIES_PATH}`}</Mono>
              </a>
              .
            </p>
            <p>
              {t({
                en: 'Each anchored day writes two keys.',
                es: 'Cada día anclado escribe dos claves.',
              })}{' '}
              <Mono className="text-ink">
                {t({ en: 'root_<day>_<YYYYMM>', es: 'root_<día>_<AAAAMM>' })}
              </Mono>{' '}
              {t({
                en: 'holds the Merkle root as 64 hexadecimal characters.',
                es: 'guarda la raíz Merkle como 64 caracteres hexadecimales.',
              })}{' '}
              <Mono className="text-ink">
                {t({ en: 'meta_<day>_<YYYYMM>', es: 'meta_<día>_<AAAAMM>' })}
              </Mono>{' '}
              {t({
                en: 'holds one string of three fields separated by a vertical bar:',
                es: 'guarda un solo texto con tres campos separados por una barra vertical:',
              })}{' '}
              <Mono className="text-ink">{ANCHOR.metaFields.join(' | ')}</Mono>.{' '}
              {t({ en: 'The key', es: 'La clave' })}{' '}
              <Mono className="text-ink">{ANCHOR.latestKey}</Mono>{' '}
              {t({
                en: 'holds the most recent anchored day. The month suffix is not derivable from the day, so a key is found by prefix rather than assembled.',
                es: 'guarda el día anclado más reciente. El sufijo de mes no se deduce del día, así que una clave se encuentra por prefijo y no se arma.',
              })}
            </p>
            <p>
              {t({
                en: 'A day lookup and a root lookup are answered from that one request. A transaction id is asked of',
                es: 'Una consulta por día y una por raíz se responden con esa sola petición. Un id de transacción se le pregunta a',
              })}{' '}
              <Mono className="text-ink">/transactions/info/&lt;id&gt;</Mono>
              {t({
                en: ', and the transaction that wrote each key comes from',
                es: ', y la transacción que escribió cada clave viene de',
              })}{' '}
              <a className={LINK} href={`${NODE}${TX_LIST_PATH}`} rel="noreferrer" target="_blank">
                <Mono>{`${HOST}${TX_LIST_PATH}`}</Mono>
              </a>
              {t({
                en: '. The node reflects the requesting origin, so all of it is queried straight from your browser with nothing of ours in between. Reading any of it from a terminal returns the same JSON, and disagreeing with what is printed above is the point of publishing the addresses.',
                es: '. El nodo refleja el origen que consulta, así que todo se interroga directamente desde su navegador sin nada nuestro en medio. Leer cualquiera de esas direcciones desde una terminal devuelve el mismo JSON, y que discrepe de lo impreso arriba es justamente el motivo de publicarlas.',
              })}
            </p>
          </div>
        </details>
      </Reveal>
    </Container>
  );
}
