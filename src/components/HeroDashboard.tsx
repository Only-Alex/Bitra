"use client";

import { useEffect, useRef, useState } from "react";
import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { LiveChart } from "@/components/charts/LiveChart";
import { Sparkline } from "@/components/charts/Sparkline";

function AssetRow({ id }: { id: string }) {
  const q = useQuote(id);
  const up = q.delta >= 0;
  return (
    <div className="flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors duration-300 hover:bg-white/4">
      <div className="flex items-center gap-2.5">
        <span
          className={`label flex h-7 w-7 items-center justify-center rounded-lg ${
            q.kind === "crypto"
              ? "bg-ember/15 text-ember"
              : "bg-[#7d8fd9]/15 text-[#aebbf0]"
          }`}
        >
          {q.id.slice(0, 1)}
        </span>
        <span className="text-[12px] font-medium">{q.id}</span>
      </div>
      <Sparkline id={id} width={64} height={22} />
      <div className="w-20 text-right">
        <p className="num text-[12px] font-semibold">${fmtPrice(q.price)}</p>
        <p className={`num text-[10px] font-semibold ${up ? "text-rise" : "text-fall"}`}>
          {fmtDelta(q.delta)}
        </p>
      </div>
    </div>
  );
}

/** The hero device: a live Bitra terminal, tilted in 3D until scroll lays it flat. */
export function HeroDashboard() {
  const btc = useQuote("BTC");
  const eth = useQuote("ETH");
  const total = btc.price * 1.42 + eth.price * 12.6;
  const up = btc.delta >= 0;

  const prev = useRef(total);
  const [flash, setFlash] = useState<"" | "px-rise" | "px-fall">("");
  useEffect(() => {
    if (total !== prev.current) {
      setFlash(total > prev.current ? "px-rise" : "px-fall");
      prev.current = total;
      const t = setTimeout(() => setFlash(""), 420);
      return () => clearTimeout(t);
    }
  }, [total]);

  return (
    <div className="relative">
      {/* ambient rig light under the device */}
      <div className="absolute -inset-x-20 -bottom-12 h-56 rounded-[100%] bg-ember/16 blur-[100px]" />

      <div className="glass relative overflow-hidden rounded-[1.6rem] p-4 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.9)] md:p-6">
        {/* holo hairline across the top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent" />

        {/* terminal chrome */}
        <div className="flex items-center justify-between">
          <span className="display text-[15px]">
            BITRA<span className="text-ember">.</span>
          </span>
          <nav className="hidden items-center gap-1.5 md:flex">
            {["Exchange", "Borrow", "Stake", "Card"].map((l, i) => (
              <span
                key={l}
                className={`label rounded-full px-3.5 py-1.5 ${
                  i === 0 ? "bg-white/8 text-bone" : "text-faint"
                }`}
              >
                {l}
              </span>
            ))}
          </nav>
          <span className="label flex items-center gap-2 text-faint">
            <span className="pulse-dot" />
            Live
          </span>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[280px_1fr] md:gap-6">
          {/* balance column */}
          <div className="flex flex-col rounded-2xl bg-ink-2/70 p-4">
            <p className="label text-faint">Total balance</p>
            <p className={`num px mt-2.5 text-[26px] font-semibold leading-none ${flash}`}>
              ${fmtPrice(total)}
            </p>
            <p className={`num mt-2 text-[11px] font-semibold ${up ? "text-rise" : "text-fall"}`}>
              {fmtDelta(btc.delta)} 24H
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <span className="label rounded-xl bg-ember py-2.5 text-center text-void">
                Trade
              </span>
              <span className="label rounded-xl bg-white/6 py-2.5 text-center text-bone">
                Deposit
              </span>
            </div>
            <div className="my-4 h-px bg-white/6" />
            <div className="-mx-1 space-y-0.5">
              {["BTC", "ETH", "AAPL", "NVDA"].map((id) => (
                <AssetRow key={id} id={id} />
              ))}
            </div>
          </div>

          {/* chart column */}
          <div className="flex flex-col rounded-2xl bg-ink-2/70 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="label text-faint">BTC / USD</p>
                <p className="num mt-1.5 text-[20px] font-semibold leading-none">
                  ${fmtPrice(btc.price)}
                </p>
              </div>
              <span className={`chip num ${up ? "chip-rise" : "chip-fall"}`}>
                {up ? "▲" : "▼"} {fmtDelta(btc.delta)}
              </span>
            </div>
            <div className="-mx-1 mt-2 flex-1">
              <LiveChart id="BTC" height={252} />
            </div>
            <div className="mt-3 flex gap-1.5">
              {["1H", "1D", "1W", "1M", "ALL"].map((t, i) => (
                <span
                  key={t}
                  className={`label rounded-lg px-3 py-1.5 ${
                    i === 1 ? "bg-ember/15 text-ember" : "text-faint"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
