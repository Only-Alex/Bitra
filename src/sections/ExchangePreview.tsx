"use client";

import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { LiveChart } from "@/components/charts/LiveChart";
import { OrderBook } from "@/components/OrderBook";

/**
 * Below-fold hand-off target. Placeholder for the full Live Exchange
 * section (phase 2) — receives the camera direction and panel motif
 * from the hero's final frame.
 */
export function ExchangePreview() {
  const btc = useQuote("BTC");
  const up = btc.delta >= 0;

  return (
    <section id="exchange" className="relative px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <p className="label mb-10 flex items-center gap-3 text-ice">
          <span className="inline-block h-px w-10 bg-ice" />
          02 — Live exchange · demo data
        </p>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="glass rounded-2xl p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="label text-faint">BTC / USD</p>
                <p className="num mt-2 text-[26px] font-semibold leading-none">
                  ${fmtPrice(btc.price)}
                </p>
              </div>
              <span className={`chip num ${up ? "chip-rise" : "chip-fall"}`}>
                {up ? "▲" : "▼"} {fmtDelta(btc.delta)}
              </span>
            </div>
            <LiveChart id="BTC" height={300} />
          </div>
          <OrderBook />
        </div>

        <p className="label mt-10 text-faint">
          Full exchange chapter lands after hero approval.
        </p>
      </div>
    </section>
  );
}
