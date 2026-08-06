import { useSyncExternalStore } from "react";

/**
 * Simulated live market feed. Histories are seeded with a deterministic
 * PRNG so server and client render identical charts (no hydration diff);
 * the live random walk only starts client-side, and never under
 * prefers-reduced-motion.
 */

export type Quote = {
  id: string;
  name: string;
  kind: "crypto" | "stock";
  price: number;
  /** 24h % change */
  delta: number;
  history: number[];
};

type AssetDef = {
  id: string;
  name: string;
  kind: "crypto" | "stock";
  base: number;
  vol: number;
  bias24: number;
};

const DEFS: AssetDef[] = [
  { id: "BTC", name: "Bitcoin", kind: "crypto", base: 67241.18, vol: 0.0016, bias24: 2.41 },
  { id: "ETH", name: "Ethereum", kind: "crypto", base: 3524.86, vol: 0.002, bias24: 1.87 },
  { id: "SOL", name: "Solana", kind: "crypto", base: 172.35, vol: 0.0028, bias24: -0.94 },
  { id: "AAPL", name: "Apple", kind: "stock", base: 213.42, vol: 0.0008, bias24: 0.62 },
  { id: "NVDA", name: "NVIDIA", kind: "stock", base: 128.77, vol: 0.0015, bias24: 3.12 },
  { id: "TSLA", name: "Tesla", kind: "stock", base: 244.19, vol: 0.002, bias24: -1.38 },
];

export const HISTORY = 90;
const TICK_MS = 900;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const quotes = new Map<string, Quote>();
const rngs = new Map<string, () => number>();

for (const d of DEFS) {
  const rng = mulberry32(hash(d.id));
  rngs.set(d.id, rng);
  // walk backwards-seeded history that lands exactly on base
  const steps: number[] = [];
  let p = d.base;
  for (let i = 0; i < HISTORY; i++) {
    steps.push(p);
    p *= 1 - (rng() - 0.485) * 2 * d.vol;
  }
  steps.reverse();
  quotes.set(d.id, {
    id: d.id,
    name: d.name,
    kind: d.kind,
    price: d.base,
    delta: d.bias24,
    history: steps,
  });
}

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let version = 0;

function tick() {
  version++;
  for (const d of DEFS) {
    const q = quotes.get(d.id)!;
    const rng = rngs.get(d.id)!;
    // random walk with mean reversion so prices stay near base long-term
    const pull = (q.price / d.base - 1) * 0.012;
    const price = q.price * (1 + (rng() - 0.5) * 2 * d.vol - pull);
    const history = [...q.history.slice(1), price];
    const delta = d.bias24 + (price / d.base - 1) * 100;
    quotes.set(d.id, { ...q, price, delta, history });
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (
    !timer &&
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    timer = setInterval(tick, TICK_MS);
  }
  return () => {
    listeners.delete(l);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useQuote(id: string): Quote {
  return useSyncExternalStore(
    subscribe,
    () => quotes.get(id)!,
    () => quotes.get(id)!,
  );
}

export const ASSET_IDS = DEFS.map((d) => d.id);

/** re-renders on every feed tick; use for derived views (sorting, totals) */
export function useMarketVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
}

export function getQuote(id: string): Quote {
  return quotes.get(id)!;
}

export function fmtPrice(p: number) {
  return p.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtDelta(d: number) {
  return `${d >= 0 ? "+" : ""}${d.toFixed(2)}%`;
}
