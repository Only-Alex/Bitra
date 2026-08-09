"use client";

import { useEffect, useRef } from "react";
import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { Sparkline } from "@/components/charts/Sparkline";
import { BitraLogo } from "@/components/BitraMark";
import { heroState, seg } from "@/lib/motion/heroProgress";

const WATCH = [
  { id: "BTC", label: "Bitcoin", badge: "#f7931a", fg: "#fff" },
  { id: "AAPL", label: "Apple", badge: "#111114", fg: "#fff" },
  { id: "NVDA", label: "NVIDIA", badge: "#76b900", fg: "#fff" },
  { id: "ETH", label: "Ethereum", badge: "#dfe3f5", fg: "#3c3c5a" },
];

function Pot({ title, value, id }: { title: string; value: string; id: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-white/8 bg-[#0d1522] px-5 pb-3 pt-4">
      <p className="text-[13px] tracking-wide text-[#93a0b4]">{title}</p>
      <p className="num mt-2 text-[26px] font-semibold leading-none text-white">
        {value}
      </p>
      <div className="mt-2 h-[46px]">
        <Sparkline id={id} width={220} height={46} strokeWidth={2} areaOpacity={0.3} fluid />
      </div>
    </div>
  );
}

function Row({
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
    <div className="grid grid-cols-[1.6fr_1fr_1fr_1.3fr_1fr] items-center border-t border-white/6 py-[11px]">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold"
          style={{ background: badge, color: fg }}
        >
          {id.slice(0, 1)}
        </span>
        <span className="text-[15px] text-white">{label}</span>
      </div>
      <span className="text-[15px] text-[#93a0b4]">{id}</span>
      <span className="num text-[15px] text-white">${fmtPrice(q.price)}</span>
      <div className="h-[26px] w-[150px]">
        <Sparkline id={id} width={150} height={26} strokeWidth={1.8} areaOpacity={0.22} fluid />
      </div>
      <span
        className="num text-right text-[15px] font-medium"
        style={{ color: up ? "#25d07d" : "#ff5c6e" }}
      >
        {up ? "↗" : "↘"} {fmtDelta(q.delta)}
      </span>
    </div>
  );
}

/**
 * Live Bitra terminal, mapped onto the screen artwork's display area so the
 * render supplies the hardware and every number moves in real time.
 */
export function DashboardUI() {
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
        // rides in with the laptop swap, holds through the exit
        ref.current.style.opacity = String(seg(heroState.p, 0.73, 0.86));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none flex h-[1000px] w-[1600px] select-none flex-col overflow-hidden bg-[#080e18] px-9 py-7"
      style={{ borderRadius: 26 }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <BitraLogo height={30} />
          <nav className="flex items-center gap-8 text-[14px] tracking-wide text-[#93a0b4]">
            <span className="text-white">EXCHANGE</span>
            <span>MARKETS</span>
            <span>EARN</span>
            <span>CARD</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-52 items-center rounded-full border border-white/10 bg-white/4 px-4 text-[14px] text-[#6d7a8d]">
            ⌕
          </span>
          <span className="rounded-full border border-white/12 px-5 py-2.5 text-[13px] tracking-wide text-white">
            DEPOSIT
          </span>
          <span className="rounded-full bg-[#2f9bff] px-6 py-2.5 text-[13px] font-semibold tracking-wide text-white">
            TRADE
          </span>
          <span className="text-[16px] text-[#93a0b4]">⌂</span>
          <span className="flex h-9 items-center gap-1.5 rounded-full border border-white/12 px-3 text-[13px] text-white">
            JG <span className="text-[10px] text-[#93a0b4]">▾</span>
          </span>
        </div>
      </div>

      {/* balance + pots */}
      <div className="mt-7 flex items-start gap-6">
        <div className="w-[430px] shrink-0">
          <p className="text-[14px] tracking-wide text-[#93a0b4]">TOTAL BALANCE</p>
          <p className="num mt-2 text-[52px] font-bold leading-none tracking-tight text-white">
            ${fmtPrice(total)}
          </p>
          <p
            className="num mt-3 text-[16px] font-medium"
            style={{ color: up ? "#25d07d" : "#ff5c6e" }}
          >
            {up ? "↗" : "↘"} {fmtDelta(btc.delta)} LAST 24H
          </p>
        </div>
        <div className="flex flex-1 gap-4">
          <Pot title="INVESTMENTS" value={`$${fmtPrice(investments)}`} id="BTC" />
          <Pot title="CRYPTO POT" value="$14,206.32" id="ETH" />
          <Pot title="SPENDING POT" value="$7,224.23" id="AAPL" />
        </div>
      </div>

      {/* portfolio performance */}
      <div className="mt-6 rounded-2xl border border-white/8 bg-[#0b121e] px-6 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[16px] tracking-wide text-white">PORTFOLIO PERFORMANCE</p>
          <div className="flex gap-2">
            {["1D", "1W", "1M", "1Y"].map((k, i) => (
              <span
                key={k}
                className={`rounded-full px-4 py-1.5 text-[13px] ${
                  i === 0
                    ? "border border-[#2f9bff]/50 bg-[#2f9bff]/15 text-white"
                    : "border border-white/10 text-[#93a0b4]"
                }`}
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 h-[250px]">
          <Sparkline id="BTC" width={1480} height={250} strokeWidth={2.4} areaOpacity={0.34} fluid />
        </div>
        <div className="mt-1 flex justify-between px-1 text-[12px] text-[#6d7a8d]">
          {["12 AM", "3 AM", "6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>

      {/* watchlist */}
      <div className="mt-6 flex-1 rounded-2xl border border-white/8 bg-[#0b121e] px-6 py-4">
        <div className="flex items-center gap-6">
          <p className="text-[16px] tracking-wide text-white">MY WATCHLIST</p>
          <div className="flex gap-2">
            {["ALL", "STOCKS", "CRYPTO"].map((k, i) => (
              <span
                key={k}
                className={`rounded-full px-4 py-1.5 text-[13px] ${
                  i === 0
                    ? "border border-white/15 bg-white/8 text-white"
                    : "text-[#93a0b4]"
                }`}
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[1.6fr_1fr_1fr_1.3fr_1fr] text-[12px] tracking-wide text-[#6d7a8d]">
          <span>ASSET</span>
          <span>TICKER</span>
          <span>PRICE</span>
          <span>CHART</span>
          <span className="text-right">CHANGE</span>
        </div>
        <div className="mt-1">
          {WATCH.map((r) => (
            <Row key={r.id} {...r} />
          ))}
        </div>
      </div>
    </div>
  );
}
