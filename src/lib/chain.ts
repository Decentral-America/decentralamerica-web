import { useEffect, useState } from 'react';

export const NODE = 'https://mainnet-node.decentralchain.io';

export type BlockHeader = {
  blocksize: number;
  generator: string;
  height: number;
  id: string;
  timestamp: number;
  transactionCount: number;
  'nxt-consensus': { 'base-target': number };
};

export type Live<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'unavailable' };

type Stream = {
  state: Live<unknown>;
  subs: Set<(v: Live<unknown>) => void>;
  timer: ReturnType<typeof setInterval> | null;
  ms: number;
  inFlight: boolean;
};

/**
 * One request per endpoint, however many components ask for it. Without this,
 * the explorer panel and the footer status strip each open their own interval
 * and the page hits the public node twice as often for the same value.
 */
const streams = new Map<string, Stream>();

function readInto(path: string, valid: (v: unknown) => boolean) {
  const s = streams.get(path);
  // A second component mounting mid-request must wait for it, not start another.
  if (!s || s.inFlight) return;
  s.inFlight = true;
  void fetch(`${NODE}${path}`)
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<unknown>;
    })
    .then((body) => {
      s.state = valid(body) ? { data: body, status: 'ready' } : { status: 'unavailable' };
    })
    .catch(() => {
      s.state = { status: 'unavailable' };
    })
    .finally(() => {
      s.inFlight = false;
      for (const fn of s.subs) fn(s.state);
    });
}

/**
 * Reads the public mainnet node straight from the browser. There is no backend,
 * so this is the real thing — and when the node is unreachable the UI says so
 * rather than rendering a zero.
 */
function usePoll<T>(path: string, ms: number, valid: (v: unknown) => v is T): Live<T> {
  /**
   * Always 'loading' on the first render, never a cached value.
   *
   * The prerendered HTML shows the loading state, so anything else here is a
   * hydration mismatch. That fired for real when the node was unreachable: the
   * request failed fast enough for 'unavailable' to land mid-hydration, and React
   * threw #418. The effect below hands over the cached or fetched state
   * immediately afterwards, so this costs one render and nothing visible.
   */
  const [state, setState] = useState<Live<T>>({ status: 'loading' });

  useEffect(() => {
    let s = streams.get(path);
    if (!s) {
      s = { inFlight: false, ms, state: { status: 'loading' }, subs: new Set(), timer: null };
      streams.set(path, s);
    }

    const onValue = (v: Live<unknown>) => setState(v as Live<T>);
    s.subs.add(onValue);

    // A second consumer wanting it fresher than the first wins the cadence.
    const restart = !s.timer || ms < s.ms;
    if (restart) {
      if (s.timer) clearInterval(s.timer);
      s.ms = Math.min(s.ms, ms);
      s.timer = setInterval(() => readInto(path, valid), s.ms);
    }
    if (s.state.status === 'loading') readInto(path, valid);
    else onValue(s.state);

    return () => {
      const cur = streams.get(path);
      if (!cur) return;
      cur.subs.delete(onValue);
      if (cur.subs.size === 0) {
        if (cur.timer) clearInterval(cur.timer);
        streams.delete(path);
      }
    };
  }, [path, ms, valid]);

  return state;
}

export type FeatureStatus = {
  id: number;
  description: string;
  blockchainStatus: string;
  nodeStatus: string;
  activationHeight?: number;
  supportingBlocks?: number;
};

export type NodeStatus = {
  blockchainHeight: number;
  stateHeight: number;
  updatedTimestamp: number;
};

export type Peers = { peers: { address: string; declaredAddress?: string }[] };

export type Activation = {
  height: number;
  votingInterval: number;
  votingThreshold: number;
  features: FeatureStatus[];
};

const isHeader = (v: unknown): v is BlockHeader =>
  typeof v === 'object' && v !== null && typeof (v as BlockHeader).height === 'number';

const isVersion = (v: unknown): v is { version: string } =>
  typeof v === 'object' && v !== null && typeof (v as { version: unknown }).version === 'string';

const isActivation = (v: unknown): v is Activation =>
  typeof v === 'object' &&
  v !== null &&
  Array.isArray((v as Activation).features) &&
  typeof (v as Activation).votingThreshold === 'number';

const isStatus = (v: unknown): v is NodeStatus =>
  typeof v === 'object' && v !== null && typeof (v as NodeStatus).stateHeight === 'number';

const isPeers = (v: unknown): v is Peers =>
  typeof v === 'object' && v !== null && Array.isArray((v as Peers).peers);

export const useLastBlock = () => usePoll('/blocks/headers/last', 15_000, isHeader);
export const useNodeStatus = () => usePoll('/node/status', 30_000, isStatus);
export const usePeers = () => usePoll('/peers/connected', 60_000, isPeers);
/** The network's own answer on what is on, what is being voted on, and at what height. */
export const useActivation = () => usePoll('/activation/status', 120_000, isActivation);
export const useNodeVersion = () => usePoll('/node/version', 300_000, isVersion);

export const fmt = (n: number) => n.toLocaleString('en-US');
export const short = (s: string, head = 6, tail = 4) =>
  s.length <= head + tail + 1 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;

export function ago(ts: number, now: number) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
}
