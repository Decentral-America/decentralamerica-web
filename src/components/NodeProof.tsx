import type { ReactNode } from 'react';
import { type BlockHeader, type Live, NODE, useLastBlock } from '@/lib/chain';
import { useNum, useT } from '@/lib/i18n';

/**
 * Must stay identical to the path `useLastBlock` polls in chain.ts. The panel is
 * a receipt: a request line that is not the line the browser actually sent would
 * be the exact kind of unverifiable claim this component exists to replace.
 *
 * `NODE` comes from chain.ts rather than `NODE_URL` in content.ts for the same
 * reason. Both hold the same origin, but only chain.ts's is provably the one
 * `fetch` uses, so the two cannot drift apart on screen.
 */
const PATH = '/blocks/headers/last';
const HOST = NODE.replace(/^https?:\/\//, '');

/**
 * One-shot fade on each new answer, so a reader watching the panel sees the
 * height change rather than finding it changed. Outside the media query nothing
 * animates and the value is simply there, which is all it has to be.
 */
const CSS = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes node-proof-in {
    from { opacity: 0; transform: translate3d(0, 3px, 0); }
    to { opacity: 1; transform: none; }
  }
  .node-proof-in { animation: node-proof-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
}
`;

type View =
  | { kind: 'waiting' }
  | { kind: 'down' }
  | { height: number; id: string | null; kind: 'answered'; time: string | null };

/**
 * UTC rather than the reader's locale: the timestamp is the node's, not theirs,
 * and a receipt that shifts with the machine reading it is harder to compare
 * against another copy. Returns null instead of throwing on a malformed value —
 * `isHeader` in chain.ts only guarantees the height.
 */
function utc(ms: unknown): string | null {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return null;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * A height of zero is not an answer, so it is reported as no answer. Nothing
 * here falls back to a previous value: an unreachable node has to look like an
 * unreachable node.
 */
function toView(block: Live<BlockHeader>): View {
  if (block.status === 'loading') return { kind: 'waiting' };
  if (block.status === 'unavailable') return { kind: 'down' };
  const { height, id, timestamp } = block.data;
  if (typeof height !== 'number' || height <= 0) return { kind: 'down' };
  return {
    height,
    id: typeof id === 'string' && id.length > 0 ? id : null,
    kind: 'answered',
    time: utc(timestamp),
  };
}

function Row({
  children,
  label,
  live = false,
  valueClassName = 'text-ink',
}: {
  children: ReactNode;
  label: string;
  live?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="grid gap-1 border-t border-hairline py-3.5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <dt className="eyebrow">{label}</dt>
      <dd aria-live={live ? 'polite' : undefined} className={`mono-data ${valueClassName}`}>
        {children}
      </dd>
    </div>
  );
}

/**
 * The Nodo Público page says a node answers anyone who asks what the memory
 * says. This asks it, from the reader's own browser, and prints what came back.
 *
 * There is one public endpoint and no custodian institutions yet, so the panel
 * shows exactly one request and one answer. The claim that any other copy would
 * answer the same is stated as the argument it is, not drawn as a network.
 */
export function NodeProof({ className = '' }: { className?: string }) {
  const t = useT();
  const num = useNum();
  const view = toView(useLastBlock());

  return (
    <figure className={`card p-6 sm:p-8 ${className}`}>
      <style>{CSS}</style>

      <p className="eyebrow">
        {t({ en: 'A request from your browser', es: 'Una consulta desde su navegador' })}
      </p>

      <dl className="mt-5">
        <Row label={t({ en: 'Request', es: 'Petición' })}>
          <span className="text-faint">GET</span>{' '}
          <a
            className="break-all underline decoration-hairline-2 underline-offset-4 transition-colors duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:decoration-ink"
            href={`${NODE}${PATH}`}
            rel="noreferrer"
            target="_blank"
          >
            {`${HOST}${PATH}`}
          </a>
        </Row>

        {view.kind === 'waiting' ? (
          <Row label={t({ en: 'Response', es: 'Respuesta' })} live valueClassName="text-faint">
            {t({ en: 'waiting for an answer…', es: 'esperando respuesta…' })}
          </Row>
        ) : null}

        {view.kind === 'down' ? (
          <Row label={t({ en: 'Response', es: 'Respuesta' })} live valueClassName="text-muted">
            {t({
              en: 'the node is not answering right now.',
              es: 'el nodo no está respondiendo en este momento.',
            })}
            <span className="mt-2.5 block font-sans text-[0.9375rem] leading-relaxed text-muted">
              {t({
                en: 'There is no saved copy to show in its place.',
                es: 'No hay una copia guardada para mostrar en su lugar.',
              })}
            </span>
          </Row>
        ) : null}

        {view.kind === 'answered' ? (
          <>
            <Row
              label={t({ en: 'Response', es: 'Respuesta' })}
              live
              valueClassName="text-confirmed-ink"
            >
              <span
                aria-hidden="true"
                className="mr-2.5 inline-block size-1.5 rounded-full bg-confirmed align-[0.15em]"
              />
              {t({ en: 'received', es: 'recibida' })}
            </Row>

            <Row key={`h${view.height}`} label={t({ en: 'Height', es: 'Altura' })}>
              <span className="node-proof-in inline-block text-lg sm:text-xl">
                {num(view.height)}
              </span>
            </Row>

            {view.id !== null ? (
              <Row key={`b${view.id}`} label={t({ en: 'Block', es: 'Bloque' })}>
                <span className="node-proof-in inline-block break-all">{view.id}</span>
              </Row>
            ) : null}

            {view.time !== null ? (
              <Row key={`t${view.time}`} label={t({ en: 'Time (UTC)', es: 'Hora (UTC)' })}>
                <span className="node-proof-in inline-block">{view.time}</span>
              </Row>
            ) : null}
          </>
        ) : null}
      </dl>

      <figcaption className="rule mt-6 max-w-[52ch] pt-6 text-[0.9375rem] leading-relaxed text-muted">
        {view.kind === 'answered'
          ? t({
              en: 'This answer came from the public node straight to your browser, with nothing of ours in between. Any custodian node would answer exactly the same, and independent copies agreeing is what makes the memory checkable.',
              es: 'Esta respuesta llegó del nodo público directamente a su navegador, sin nada nuestro en medio. El nodo de cualquier custodia respondería exactamente lo mismo, y que copias independientes coincidan es lo que hace comprobable la memoria.',
            })
          : t({
              en: 'Your browser sends this request to the public node, with nothing of ours in between. Any custodian node would answer exactly the same, and independent copies agreeing is what makes the memory checkable.',
              es: 'Su navegador le hace esta consulta al nodo público, sin nada nuestro en medio. El nodo de cualquier custodia respondería exactamente lo mismo, y que copias independientes coincidan es lo que hace comprobable la memoria.',
            })}
      </figcaption>
    </figure>
  );
}
