"use client";

import { useEffect, useRef, useState } from "react";
import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { LiveChart } from "@/components/charts/LiveChart";

/** Floating hero trade ticket: live BTC chart, one-tap crypto→stock order. */
export function TradePanel() {
  const btc = useQuote("BTC");
  const aapl = useQuote("AAPL");
  const up = btc.delta >= 0;

  // flash price on tick
  const prev = useRef(btc.price);
  const [flash, setFlash] = useState<"" | "px-rise" | "px-fall">("");
  useEffect(() => {
    if (btc.price !== prev.current) {
      setFlash(btc.price > prev.current ? "px-rise" : "px-fall");
      prev.current = btc.price;
      const t = setTimeout(() => setFlash(""), 420);
      return () => clearTimeout(t);
    }
  }, [btc.price]);

  return (
    <div className="tilt w-95 select-none">
      <div className="glass rounded-3xl p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="label mb-2 flex items-center gap-2 text-faint">
              <span className="pulse-dot" />
              Live · BTC / USD
            </p>
            <p className={`num px text-[28px] font-semibold leading-none tracking-tight ${flash}`}>
              ${fmtPrice(btc.price)}
            </p>
          </div>
          <span className={`chip num ${up ? "chip-rise" : "chip-fall"}`}>
            {up ? "▲" : "▼"} {fmtDelta(btc.delta)}
          </span>
        </div>

        <div className="-mx-2 mt-4">
          <LiveChart id="BTC" height={170} />
        </div>

        <div className="mt-5 space-y-2">
          <div className="glass flex items-center justify-between rounded-2xl px-4 py-3.5">
            <span className="label text-faint">Sell</span>
            <span className="num text-[15px] font-medium">
              0.4200 <span className="text-mute">BTC</span>
            </span>
          </div>
          <div className="relative">
            <div className="glass flex items-center justify-between rounded-2xl px-4 py-3.5">
              <span className="label text-faint">Buy</span>
              <span className="num text-[15px] font-medium">
                {fmtPrice((0.42 * btc.price) / aapl.price)}{" "}
                <span className="text-mute">AAPL</span>
              </span>
            </div>
            <span className="absolute -top-3.5 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-ink-3 text-[11px] text-ember ring-4 ring-ink">
              ↓
            </span>
          </div>
        </div>

        <button className="label mt-4 w-full rounded-2xl bg-ember py-4 text-void transition-colors duration-300 hover:bg-ember-hi">
          Review order
        </button>

        <p className="label mt-4 text-center text-faint">
          Est. execution 8ms · No fiat leg
        </p>
      </div>
    </div>
  );
}
