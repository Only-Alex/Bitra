"use client";

import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { CandleChart } from "@/components/charts/CandleChart";
import { OrderBook } from "@/components/OrderBook";

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="label text-faint">{k}</p>
      <p className="num mt-1 text-[13px] font-medium text-bone/90">{v}</p>
    </div>
  );
}

/**
 * Below-fold hand-off target. Placeholder for the full Live Exchange
 * section (phase 2) — terminal-grade chart, book, and demo stats.
 */
export function ExchangePreview() {
  const btc = useQuote("BTC");
  const up = btc.delta >= 0;
  const hi = Math.max(...btc.history);
  const lo = Math.min(...btc.history);

  return (
    <section id="exchange" className="relative px-6 py-28 md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <p className="label mb-10 flex items-center gap-3 text-ice">
          <span className="inline-block h-px w-10 bg-ice" />
          02 — Live exchange · demo data
        </p>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="glass rounded-2xl p-6">
            {/* terminal header: pair, price, session stats */}
            <div className="mb-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <div className="flex items-end gap-6">
                <div>
                  <p className="label text-faint">BTC / USD · Perp</p>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="num text-[26px] font-semibold leading-none">
                      ${fmtPrice(btc.price)}
                    </p>
                    <span className={`chip num ${up ? "chip-rise" : "chip-fall"}`}>
                      {up ? "▲" : "▼"} {fmtDelta(btc.delta)}
                    </span>
                  </div>
                </div>
                <div className="hidden gap-8 border-l pl-6 sm:flex">
                  <Stat k="24h high" v={`$${fmtPrice(hi)}`} />
                  <Stat k="24h low" v={`$${fmtPrice(lo)}`} />
                  <Stat k="Mark" v={`$${fmtPrice(btc.price)}`} />
                </div>
              </div>
              <div className="flex gap-1.5">
                {["1m", "15m", "1H", "1D", "1W"].map((t, i) => (
                  <span
                    key={t}
                    className={`label rounded-lg px-3 py-1.5 ${
                      i === 3 ? "bg-ice/15 text-ice" : "text-faint"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <CandleChart id="BTC" height={340} />
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
