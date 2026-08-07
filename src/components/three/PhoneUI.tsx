"use client";

import { useEffect, useRef } from "react";
import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { Sparkline } from "@/components/charts/Sparkline";
import { BitraMark } from "@/components/BitraMark";
import { heroState, seg } from "@/lib/motion/heroProgress";

function WatchRow({ id }: { id: string }) {
  const q = useQuote(id);
  const up = q.delta >= 0;
  return (
    <div className="flex items-center justify-between py-[7px]">
      <div className="flex w-[92px] items-center gap-2.5">
        <span
          className={`label flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] ${
            q.kind === "crypto"
              ? "bg-ice/18 text-ice-hi"
              : "bg-white/10 text-bone/90"
          }`}
        >
          {q.id.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11.5px] font-semibold leading-tight">
            {q.name}
          </p>
          <p className="text-[9.5px] text-faint">{q.id}</p>
        </div>
      </div>
      <Sparkline id={id} width={58} height={20} strokeWidth={1.3} areaOpacity={0} />
      <div className="w-[72px] text-right">
        <p className="num text-[11.5px] font-semibold">${fmtPrice(q.price)}</p>
        <p
          className={`num text-[9.5px] font-semibold ${up ? "text-rise" : "text-fall"}`}
        >
          {up ? "↗" : "↘"} {fmtDelta(q.delta)}
        </p>
      </div>
    </div>
  );
}

/**
 * The live Bitra app on the 3D phone's screen. Real DOM — razor sharp
 * through the dive. Self-fades across the threshold via shared progress.
 */
export function PhoneUI() {
  const btc = useQuote("BTC");
  const eth = useQuote("ETH");
  const ref = useRef<HTMLDivElement>(null);
  const invested = btc.price * 0.62 + eth.price * 5.1;
  const total = invested + 21430.55;
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
      /* 280 x 586 keeps the DOM aspect equal to the device face (1.98 x 4.14)
         so the screen fills it edge to edge with no bezel gap.
         The border lives here, not on the 3D rim: this DOM layer renders
         above the canvas, so anything drawn in WebGL behind it is hidden. */
      className="pointer-events-none relative flex h-[586px] w-[280px] select-none flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#0a1220] to-[#070c15]"
      style={{
        // inline, not utility classes: the global `*` border-color rule
        // outranks a generated border utility, and comma-bearing arbitrary
        // shadow values don't parse
        border: "5px solid #79bfff",
        boxShadow:
          "0 0 26px rgba(121,191,255,0.55), inset 0 0 14px rgba(121,191,255,0.20)",
      }}
    >
      {/* ---- status bar ---- */}
      <div className="flex items-center justify-between px-6 pt-3.5">
        <span className="num text-[12px] font-semibold tracking-tight text-bone">
          2:47
        </span>
        <div className="flex items-center gap-[5px]">
          <span className="flex items-end gap-[2px]">
            {[4, 6, 8, 10].map((h) => (
              <span
                key={h}
                className="w-[3px] rounded-[1px] bg-bone"
                style={{ height: h }}
              />
            ))}
          </span>
          <svg width="15" height="11" viewBox="0 0 15 11" aria-hidden="true">
            <path
              d="M7.5 10.2 L2.6 5.3 A7.4 7.4 0 0 1 12.4 5.3 Z"
              fill="#e8ecf4"
            />
          </svg>
          <span className="flex items-center gap-[1.5px]">
            <span className="relative h-[11px] w-[21px] rounded-[3.5px] border-[1.5px] border-bone/60">
              <span className="absolute inset-[1.5px] right-[4px] rounded-[1px] bg-bone" />
            </span>
            <span className="h-[4px] w-[1.5px] rounded-r-[1px] bg-bone/60" />
          </span>
        </div>
      </div>

      {/* dynamic island */}
      <div className="absolute left-1/2 top-3 h-[20px] w-[76px] -translate-x-1/2 rounded-full bg-black" />

      {/* ---- app header: the mark lives in the display ---- */}
      <div className="mt-4 flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 ring-1 ring-white/10">
            <BitraMark size={17} />
          </span>
          <span className="text-[14px] font-bold tracking-tight">
            Bitra <span className="text-ice">Invest</span>
          </span>
          <span className="text-[9px] text-faint">▼</span>
        </div>
        <div className="flex items-center gap-3.5 text-[13px] text-mute">
          <span>···</span>
          <span className="relative">
            ⌂
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-ice" />
          </span>
        </div>
      </div>

      {/* ---- balance ---- */}
      <div className="mt-4 px-6">
        <p className="num text-[32px] font-bold leading-none tracking-tight">
          ${fmtPrice(total)}
        </p>
        <p
          className={`num mt-1.5 text-[10.5px] font-semibold ${up ? "text-rise" : "text-fall"}`}
        >
          {up ? "↗" : "↘"} {fmtDelta(btc.delta)} last 24h
        </p>
      </div>

      {/* ---- pots ---- */}
      <div className="mt-3.5 grid grid-cols-2 gap-2 px-5">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="label text-[8px] text-faint">Investments</p>
          <p className="num mt-1 text-[13px] font-bold">${fmtPrice(invested)}</p>
          <div className="mt-1.5 h-[34px]">
            <Sparkline id="BTC" width={100} height={34} strokeWidth={1.4} areaOpacity={0.16} fluid />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="label text-[8px] text-faint">Crypto pot</p>
            <p className="num mt-1 text-[13px] font-bold">$14,206.32</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="label text-[8px] text-faint">Spending pot</p>
            <p className="num mt-1 text-[13px] font-bold">$7,224.23</p>
          </div>
        </div>
      </div>

      {/* ---- watchlist sheet ---- */}
      <div className="mt-4 flex-1 rounded-t-[1.6rem] bg-[#101928] px-5 pt-2.5">
        <div className="mx-auto h-1 w-9 rounded-full bg-white/15" />
        <div className="mt-2.5 flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-bone">
            Watchlist
          </span>
          <span className="px-2 py-1.5 text-[10px] font-medium text-faint">
            Top movers
          </span>
          <span className="px-2 py-1.5 text-[10px] font-medium text-faint">
            Losers
          </span>
        </div>
        <div className="mt-1 divide-y divide-white/5">
          {["BTC", "AAPL", "NVDA", "ETH"].map((id) => (
            <WatchRow key={id} id={id} />
          ))}
        </div>
      </div>

      {/* ---- tab bar ---- */}
      <div className="bg-[#101928] px-7 pb-2 pt-1">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-ice">⌂</span>
          <span className="text-faint">◔</span>
          <span className="text-faint">⌕</span>
          <span className="text-faint">▭</span>
          <span className="text-faint">▤</span>
        </div>
        <div className="mx-auto mt-1.5 h-[4px] w-[92px] rounded-full bg-bone/40" />
      </div>

      {/* screen glass sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[2rem]"
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 18%, transparent 32%)",
        }}
      />
    </div>
  );
}
