"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { Sparkline } from "@/components/charts/Sparkline";
import { LiveChart } from "@/components/charts/LiveChart";
import { Magnetic } from "@/components/Magnetic";
import { Tilt3D } from "@/components/Tilt3D";

/** phone frame with a live mini balance UI */
function PhoneMock() {
  const btc = useQuote("BTC");
  const up = btc.delta >= 0;
  return (
    <div className="mx-auto w-56 rounded-[2.4rem] border border-white/14 bg-ink p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/10" />
      <div className="rounded-[1.8rem] bg-ink-2 p-4">
        <p className="label text-faint">Total balance</p>
        <p className="num mt-2 text-[22px] font-semibold leading-none">
          ${fmtPrice(btc.price * 1.62)}
        </p>
        <p className={`num mt-1.5 text-[11px] font-semibold ${up ? "text-rise" : "text-fall"}`}>
          {fmtDelta(btc.delta)} 24H
        </p>
        <div className="mt-3 h-14">
          <Sparkline id="BTC" width={180} height={56} areaOpacity={0.2} fluid />
        </div>
        <div className="mt-4 flex justify-between">
          {["Buy", "Sell", "Swap", "Send"].map((a) => (
            <div key={a} className="flex flex-col items-center gap-1.5">
              <span className="h-8 w-8 rounded-full bg-ember/15" />
              <span className="text-[9px] text-mute">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** compressed pro-terminal frame */
function TerminalMock() {
  const nvda = useQuote("NVDA");
  return (
    <div className="mx-auto w-full max-w-85 rounded-2xl border border-white/14 bg-ink p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="label text-faint">NVDA · Pro</span>
        <span className="num text-[12px] font-semibold">${fmtPrice(nvda.price)}</span>
      </div>
      <div className="rounded-xl bg-ink-2 p-2">
        <LiveChart id="NVDA" height={110} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {["Limit", "Market", "Stop"].map((o) => (
          <span key={o} className="label rounded-lg bg-white/5 py-2 text-center text-faint">
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}

/** self-custody wallet frame */
function WalletMock() {
  const eth = useQuote("ETH");
  const sol = useQuote("SOL");
  return (
    <div className="mx-auto w-64 rounded-3xl border border-white/14 bg-ink p-4 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between">
        <span className="label text-faint">bitra.eth</span>
        <span className="pulse-dot" />
      </div>
      <p className="num mt-3 text-[20px] font-semibold">
        ${fmtPrice(eth.price * 2.4 + sol.price * 18)}
      </p>
      <div className="mt-4 space-y-2">
        {[
          { q: eth, amt: "2.40" },
          { q: sol, amt: "18.0" },
        ].map(({ q, amt }) => (
          <div key={q.id} className="flex items-center justify-between rounded-xl bg-ink-2 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="label flex h-7 w-7 items-center justify-center rounded-lg bg-ember/15 text-ember">
                {q.id.slice(0, 1)}
              </span>
              <span className="text-[12px] font-medium">{amt} {q.id}</span>
            </div>
            <span className={`num text-[11px] font-semibold ${q.delta >= 0 ? "text-rise" : "text-fall"}`}>
              {fmtDelta(q.delta)}
            </span>
          </div>
        ))}
      </div>
      <p className="label mt-4 text-center text-faint">Keys stay yours</p>
    </div>
  );
}

const PRODUCTS = [
  {
    tag: "Easy & fast",
    title: "Bitra App",
    body: "The whole exchange in your pocket — trade both markets in two taps.",
    Mock: PhoneMock,
  },
  {
    tag: "Advanced",
    title: "Pro Terminal",
    body: "Order-book depth, conditional orders, and APIs for automated flow.",
    Mock: TerminalMock,
  },
  {
    tag: "Your keys",
    title: "Self-custody Bridge",
    body: "Trade from your own wallet. Assets touch Bitra only at settlement.",
    Mock: WalletMock,
  },
];

/** One platform, three ways in — tall product cards with live mockups. */
export function ProductsTrio() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-trio-head] > *", {
          y: 40,
          autoAlpha: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 74%" },
        });
        gsap.from("[data-trio-card]", {
          y: 60,
          autoAlpha: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 62%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1720px]">
        <div data-trio-head className="mx-auto max-w-3xl text-center">
          <p className="label mb-6 flex items-center justify-center gap-3 text-ember">
            <span className="inline-block h-px w-10 bg-ember" />
            One platform, three ways in
            <span className="inline-block h-px w-10 bg-ember" />
          </p>
          <h2 className="display-soft text-[clamp(2.2rem,4.4vw,4.2rem)]">
            However you
            <span className="editorial bg-gradient-to-r from-ember-hi to-ember bg-clip-text pl-3 pr-[0.06em] text-transparent">
              trade.
            </span>
          </h2>
          <div className="mt-9 flex justify-center">
            <Magnetic>
              <a
                href="#cta"
                className="label rounded-full bg-ember px-7 py-4 text-void transition-colors duration-300 hover:bg-ember-hi"
              >
                Create account
              </a>
            </Magnetic>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRODUCTS.map(({ tag, title, body, Mock }) => (
            <Tilt3D key={title} className="h-full">
            <article
              data-trio-card
              className="glass group flex h-full flex-col rounded-[2rem] p-7 transition-colors duration-500 hover:border-ember/30"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="label glass rounded-full px-4 py-2 text-mute">
                  {tag}
                </span>
                <span className="text-ember opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  ↗
                </span>
              </div>
              <div className="flex flex-1 items-center py-4">
                <Mock />
              </div>
              <h3 className="mt-8 text-[20px] font-semibold">{title}</h3>
              <p className="mt-2.5 text-[15px] leading-[1.7] text-mute">
                {body}
              </p>
            </article>
            </Tilt3D>
          ))}
        </div>
      </div>
    </section>
  );
}
