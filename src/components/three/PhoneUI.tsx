"use client";

import { useEffect, useRef } from "react";
import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { Sparkline } from "@/components/charts/Sparkline";
import { BitraMark } from "@/components/BitraMark";
import { heroState, seg } from "@/lib/motion/heroProgress";

/** Row styling mirrors the supplied app artwork's cream watchlist sheet. */
const ROWS: { id: string; label: string; badge: string; fg: string }[] = [
  { id: "BTC", label: "Bitcoin", badge: "#f7931a", fg: "#ffffff" },
  { id: "AAPL", label: "Apple", badge: "#111114", fg: "#ffffff" },
  { id: "NVDA", label: "NVIDIA", badge: "#76b900", fg: "#ffffff" },
  { id: "ETH", label: "Ethereum", badge: "#dfe3f5", fg: "#3c3c5a" },
];

function WatchRow({
  id,
  label,
  badge,
  fg,
}: {
  id: string;
  label: string;
  badge: string;
  fg: string;
}) {
  const q = useQuote(id);
  const up = q.delta >= 0;
  return (
    <div className="flex items-center justify-between py-[9px]">
      <div className="flex w-[104px] items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
          style={{ background: badge, color: fg }}
        >
          {id.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight text-[#15171c]">
            {label}
          </p>
          <p className="text-[11px] leading-tight text-[#8b8f99]">{id}</p>
        </div>
      </div>
      <Sparkline id={id} width={62} height={26} strokeWidth={1.6} areaOpacity={0.14} />
      <div className="w-[86px] text-right">
        <p className="num text-[13px] font-semibold text-[#15171c]">
          ${fmtPrice(q.price)}
        </p>
        <p
          className="num text-[11px] font-semibold"
          style={{ color: up ? "#12a05a" : "#d93a4a" }}
        >
          {up ? "↗" : "↘"} {fmtDelta(q.delta)}
        </p>
      </div>
    </div>
  );
}

/**
 * Live Bitra app screen. Sits exactly over the screen region of the phone
 * artwork so the device hardware is the supplied render while the data
 * ticks in real time. Fades out across the threshold with the device.
 */
export function PhoneUI() {
  const btc = useQuote("BTC");
  const eth = useQuote("ETH");
  const ref = useRef<HTMLDivElement>(null);

  const investments = btc.price * 0.62 + eth.price * 5.1;
  const total = investments + 21430.55;
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
      className="pointer-events-none flex h-[655px] w-[320px] select-none flex-col overflow-hidden"
      style={{
        background: "linear-gradient(#121a28, #0d1420)",
        // matches the device screen's corner radius in the artwork, so the
        // overlay clips inside the bezel instead of squaring off over it
        borderRadius: "46px",
      }}
    >
      {/* status bar */}
      <div className="flex items-center justify-between px-6 pt-3">
        <span className="num text-[13px] font-semibold text-white">9:41</span>
        <div className="flex items-center gap-[5px]">
          <span className="flex items-end gap-[2px]">
            {[4, 6, 8, 10].map((h) => (
              <span key={h} className="w-[3px] rounded-[1px] bg-white" style={{ height: h }} />
            ))}
          </span>
          <svg width="15" height="11" viewBox="0 0 15 11" aria-hidden="true">
            <path d="M7.5 10.2 L2.6 5.3 A7.4 7.4 0 0 1 12.4 5.3 Z" fill="#fff" />
          </svg>
          <span className="flex items-center gap-[1.5px]">
            <span className="relative h-[11px] w-[21px] rounded-[3.5px] border-[1.5px] border-white/70">
              <span className="absolute inset-[1.5px] right-[4px] rounded-[1px] bg-white" />
            </span>
            <span className="h-[4px] w-[1.5px] rounded-r-[1px] bg-white/70" />
          </span>
        </div>
      </div>

      {/* dynamic island */}
      <div className="absolute left-1/2 top-2.5 h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-black" />

      {/* app header */}
      <div className="mt-5 flex items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b1220] ring-1 ring-white/10">
            <BitraMark size={20} />
          </span>
          <span className="text-[19px] font-semibold tracking-tight text-white">
            Bitra
          </span>
        </div>
        <div className="flex items-center gap-3.5 text-[15px] text-white/70">
          <span>···</span>
          <span className="relative">
            ⌂
            <span className="absolute -right-1 -top-0.5 h-[7px] w-[7px] rounded-full bg-[#2f9bff]" />
          </span>
        </div>
      </div>

      {/* balance */}
      <div className="mt-3 px-5">
        <p className="num text-[34px] font-bold leading-none tracking-tight text-white">
          ${fmtPrice(total)}
        </p>
        <p
          className="num mt-2 text-[12px] font-semibold"
          style={{ color: up ? "#3ddc91" : "#ff6b7d" }}
        >
          {up ? "↗" : "↘"} {fmtDelta(btc.delta)} last 24h
        </p>
      </div>

      {/* pots */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 px-5">
        <div className="rounded-2xl bg-[#0c131f] p-3">
          <p className="text-[10px] font-semibold tracking-wide text-[#8b93a3]">
            INVESTMENTS
          </p>
          <p className="num mt-1 text-[15px] font-bold text-white">
            ${fmtPrice(investments)}
          </p>
          <div className="mt-2 h-[62px]">
            <Sparkline id="BTC" width={120} height={62} strokeWidth={1.8} areaOpacity={0.3} fluid />
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="rounded-2xl bg-[#0c131f] p-3">
            <p className="text-[10px] font-semibold tracking-wide text-[#8b93a3]">
              CRYPTO POT
            </p>
            <p className="num mt-1 text-[15px] font-bold text-white">$14,206.32</p>
          </div>
          <div className="rounded-2xl bg-[#0c131f] p-3">
            <p className="text-[10px] font-semibold tracking-wide text-[#8b93a3]">
              SPENDING POT
            </p>
            <p className="num mt-1 text-[15px] font-bold text-white">$7,224.23</p>
          </div>
        </div>
      </div>

      {/* cream watchlist sheet */}
      <div className="mt-4 flex-1 rounded-t-[26px] bg-[#faf8f3] px-4 pt-2.5">
        <div className="mx-auto h-[4px] w-10 rounded-full bg-[#d5d2cb]" />
        <div className="mt-3 flex items-center gap-1">
          <span className="rounded-full bg-[#dceeff] px-3 py-1.5 text-[12px] font-semibold text-[#15171c]">
            My watchlist
          </span>
          <span className="px-2.5 py-1.5 text-[12px] font-medium text-[#8b8f99]">
            Top winners
          </span>
          <span className="px-2.5 py-1.5 text-[12px] font-medium text-[#8b8f99]">
            Top losers
          </span>
        </div>
        <div className="mt-1 divide-y divide-[#ebe8e1]">
          {ROWS.map((r) => (
            <WatchRow key={r.id} {...r} />
          ))}
        </div>
      </div>

      {/* tab bar */}
      <div className="flex items-center justify-between bg-white px-7 pb-3 pt-2.5 text-[15px]">
        <span className="text-[#2f9bff]">⌂</span>
        <span className="text-[#9aa0aa]">◔</span>
        <span className="text-[#9aa0aa]">⌕</span>
        <span className="text-[#9aa0aa]">⇄</span>
        <span className="text-[#9aa0aa]">▭</span>
        <span className="text-[#9aa0aa]">···</span>
      </div>
      <div className="bg-white pb-2">
        <div className="mx-auto h-[4px] w-[108px] rounded-full bg-[#15171c]" />
      </div>
    </div>
  );
}
