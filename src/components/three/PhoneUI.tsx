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
      className="pointer-events-none relative flex h-[600px] w-[280px] select-none flex-col overflow-hidden rounded-[2.4rem] bg-[#080d16] px-5 pb-4 pt-3"
    >
      {/* status bar */}
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="num text-[11px] font-semibold text-bone/90">2:47</span>
        <div className="flex items-center gap-1.5">
          {/* signal */}
          <span className="flex items-end gap-[2px]">
            {[3, 5, 7, 9].map((h) => (
              <span key={h} className="w-[2.5px] rounded-sm bg-bone/85" style={{ height: h }} />
            ))}
          </span>
          {/* wifi */}
          <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
            <path
              d="M7 9.2 L2.2 4.4 A6.8 6.8 0 0 1 11.8 4.4 Z"
              fill="rgba(232,236,244,0.85)"
            />
          </svg>
          {/* battery */}
          <span className="flex items-center gap-[1.5px]">
            <span className="relative h-[10px] w-[19px] rounded-[3px] border border-bone/50">
              <span className="absolute inset-[1.5px] right-[5px] rounded-[1.5px] bg-bone/85" />
            </span>
            <span className="h-[4px] w-[1.5px] rounded-r-sm bg-bone/50" />
          </span>
        </div>
      </div>

      {/* dynamic island */}
      <div className="absolute left-1/2 top-2.5 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" />

      <div className="mb-4 mt-3 flex items-center justify-between">
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

      {/* home indicator */}
      <div className="mx-auto mt-2 h-[4px] w-[96px] rounded-full bg-bone/30" />

      {/* screen glass sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[2.4rem]"
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 18%, transparent 32%)",
        }}
      />
    </div>
  );
}
