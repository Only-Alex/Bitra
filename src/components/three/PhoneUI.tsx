"use client";

import { useEffect, useRef } from "react";
import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { Sparkline } from "@/components/charts/Sparkline";
import { heroState, seg } from "@/lib/motion/heroProgress";

function Row({ id }: { id: string }) {
  const q = useQuote(id);
  const up = q.delta >= 0;
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/4 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span
          className={`label flex h-7 w-7 items-center justify-center rounded-lg ${
            q.kind === "crypto" ? "bg-ice/15 text-ice" : "bg-white/8 text-bone/80"
          }`}
        >
          {q.id.slice(0, 1)}
        </span>
        <div>
          <p className="text-[11px] font-semibold leading-tight">{q.id}</p>
          <p className="text-[9px] text-faint">{q.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="num text-[11px] font-semibold">${fmtPrice(q.price)}</p>
        <p className={`num text-[9px] font-semibold ${up ? "text-rise" : "text-fall"}`}>
          {fmtDelta(q.delta)}
        </p>
      </div>
    </div>
  );
}

/**
 * The live Bitra app rendered onto the 3D phone's screen. Real DOM —
 * stays razor sharp as the camera dives through it. Fades itself out
 * across the threshold using the shared progress value.
 */
export function PhoneUI() {
  const btc = useQuote("BTC");
  const eth = useQuote("ETH");
  const ref = useRef<HTMLDivElement>(null);
  const total = btc.price * 0.94 + eth.price * 8.2;
  const up = btc.delta >= 0;

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (ref.current) {
        ref.current.style.opacity = String(1 - seg(heroState.p, 0.43, 0.5));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none flex h-[600px] w-[280px] select-none flex-col overflow-hidden rounded-[2.4rem] bg-[#080d16] p-5"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="display text-[14px]">
          BITRA<span className="text-ice">.</span>
        </span>
        <span className="pulse-dot" />
      </div>

      <p className="label text-faint">Portfolio value</p>
      <p className="num mt-2 text-[30px] font-semibold leading-none">
        ${fmtPrice(total)}
      </p>
      <p className={`num mt-2 text-[11px] font-semibold ${up ? "text-rise" : "text-fall"}`}>
        {fmtDelta(btc.delta)} 24H
      </p>

      <div className="mt-4 h-[76px]">
        <Sparkline id="BTC" width={240} height={76} areaOpacity={0.24} fluid />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <span className="label rounded-xl bg-ice py-2.5 text-center text-void">Trade</span>
        <span className="label rounded-xl bg-white/7 py-2.5 text-center text-bone">
          Deposit
        </span>
      </div>

      <div className="mt-4 space-y-1.5">
        {["BTC", "AAPL", "NVDA"].map((id) => (
          <Row key={id} id={id} />
        ))}
      </div>

      <div className="mt-auto flex justify-around pt-3">
        {["◈", "⌕", "⇄", "▤"].map((g, i) => (
          <span key={i} className={`text-[13px] ${i === 0 ? "text-ice" : "text-faint"}`}>
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
