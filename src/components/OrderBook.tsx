"use client";

import { useMemo } from "react";
import { fmtPrice, useQuote } from "@/lib/market";

const ROWS = 6;

/** Live order book derived from the BTC feed; depth bars per level. */
export function OrderBook() {
  const btc = useQuote("BTC");

  const levels = useMemo(() => {
    const spread = btc.price * 0.0004;
    const mk = (side: 1 | -1) =>
      Array.from({ length: ROWS }, (_, i) => {
        // size wobbles with the live price so rows breathe each tick
        const seed = Math.sin(btc.price * (i + 3) * side) * 0.5 + 0.5;
        return {
          price: btc.price + side * spread * (i + 1),
          size: 0.05 + seed * 1.9,
          depth: 18 + seed * 82,
        };
      });
    return { asks: mk(1).reverse(), bids: mk(-1) };
  }, [btc.price]);

  return (
    <div className="glass w-72 rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="label text-faint">BTC-USD · Book</p>
        <span className="pulse-dot" />
      </div>

      <div className="space-y-1">
        {levels.asks.map((l, i) => (
          <div key={`a${i}`} className="relative flex justify-between px-2 py-1">
            <div className="depth depth-ask" style={{ width: `${l.depth}%` }} />
            <span className="num relative z-10 text-[12px] text-fall">
              {fmtPrice(l.price)}
            </span>
            <span className="num relative z-10 text-[12px] text-mute">
              {l.size.toFixed(3)}
            </span>
          </div>
        ))}
      </div>

      <div className="my-2 flex items-center justify-between px-2">
        <span className="num text-[15px] font-semibold text-bone">
          {fmtPrice(btc.price)}
        </span>
        <span className="label text-faint">Spread 0.04%</span>
      </div>

      <div className="space-y-1">
        {levels.bids.map((l, i) => (
          <div key={`b${i}`} className="relative flex justify-between px-2 py-1">
            <div className="depth depth-bid" style={{ width: `${l.depth}%` }} />
            <span className="num relative z-10 text-[12px] text-rise">
              {fmtPrice(l.price)}
            </span>
            <span className="num relative z-10 text-[12px] text-mute">
              {l.size.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
