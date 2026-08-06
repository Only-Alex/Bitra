"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { LiveChart } from "@/components/charts/LiveChart";
import { OrderBook } from "@/components/OrderBook";
import { Sparkline } from "@/components/charts/Sparkline";

function ChartCard() {
  const nvda = useQuote("NVDA");
  const up = nvda.delta >= 0;
  return (
    <div className="glass w-105 rounded-3xl p-6">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="label mb-2 text-faint">NVDA · NVIDIA</p>
          <p className="num text-[24px] font-semibold leading-none">
            ${fmtPrice(nvda.price)}
          </p>
        </div>
        <span className={`chip num ${up ? "chip-rise" : "chip-fall"}`}>
          {up ? "▲" : "▼"} {fmtDelta(nvda.delta)}
        </span>
      </div>
      <div className="-mx-2">
        <LiveChart id="NVDA" height={150} />
      </div>
    </div>
  );
}

function PairCard() {
  const eth = useQuote("ETH");
  return (
    <div className="glass w-64 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="label mb-2 text-faint">ETH → TSLA</p>
          <p className="num text-[17px] font-semibold">
            1 ≈ {fmtPrice(eth.price / 244.19)}
          </p>
        </div>
        <Sparkline id="ETH" width={72} height={34} />
      </div>
      <button className="label mt-4 w-full rounded-xl bg-white/6 py-3 text-bone transition-colors duration-300 hover:bg-white/12">
        One-tap trade
      </button>
    </div>
  );
}

/**
 * 03 — Live exchange. Pinned headline; real trading UI drifts past in
 * 3D perspective at three depths, Tren-style.
 */
export function Exchange() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=180%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        tl.from("[data-ex-copy]", { y: 70, autoAlpha: 0, duration: 0.16, ease: "power2.out" }, 0)
          .fromTo(
            "[data-float-1]",
            { y: 480, rotateX: 8, rotateY: -10 },
            { y: -420, rotateX: -3, rotateY: -14, duration: 1 },
            0,
          )
          .fromTo(
            "[data-float-2]",
            { y: 640, rotateX: 6, rotateY: 12 },
            { y: -560, rotateX: -4, rotateY: 16, duration: 1 },
            0,
          )
          .fromTo(
            "[data-float-3]",
            { y: 820, rotateX: 10, rotateY: -6 },
            { y: -700, rotateX: -6, rotateY: -4, duration: 1 },
            0,
          );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="exchange"
      className="relative h-screen overflow-hidden"
    >
      {/* faint cool field — Tren restraint against the warm sections */}
      <div className="absolute inset-0 opacity-35">
        <div className="cine-field">
          <div className="cine-blob cine-b" />
          <div className="cine-vignette" />
          <div className="grain" />
        </div>
      </div>

      <div data-ex-copy className="absolute left-6 top-1/2 z-10 -translate-y-1/2 md:left-10">
        <p className="label mb-6 flex items-center gap-3 text-ember">
          <span className="inline-block h-px w-10 bg-ember" />
          03 — Live exchange
        </p>
        <h2 className="display max-w-3xl text-[clamp(2.6rem,5.4vw,5.8rem)]">
          The floor
          <br />
          <span className="editorial bg-gradient-to-r from-ember-hi to-ember bg-clip-text pr-[0.06em] text-transparent">
            never closes.
          </span>
        </h2>
        <p className="mt-7 max-w-105 text-[16px] leading-[1.7] text-mute">
          A real order book across both markets. Streaming quotes, one-tap
          execution, T+0 settlement — around the clock, including weekends.
        </p>
      </div>

      {/* floating UI at three depths */}
      <div className="persp pointer-events-none absolute inset-y-0 right-[4%] z-0 hidden w-[46%] md:block">
        <div data-float-1 className="absolute right-[38%] top-[30%] will-change-transform">
          <ChartCard />
        </div>
        <div data-float-2 className="absolute right-[2%] top-[42%] will-change-transform">
          <OrderBook />
        </div>
        <div data-float-3 className="absolute right-[52%] top-[58%] will-change-transform">
          <PairCard />
        </div>
      </div>
    </section>
  );
}
