"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

const N_PARTICLES = 42;
const N_CANDLES = 22;

/** deterministic pseudo-random so SSR and client agree */
function prand(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const CANDLES = Array.from({ length: N_CANDLES }, (_, i) => {
  const up = prand(i, 7) > 0.42;
  const h = 18 + prand(i, 13) * 64;
  const y = 12 + prand(i, 29) * (100 - h - 24);
  return { up, h, y, wickTop: y - 6 - prand(i, 31) * 8, wickH: h + 12 + prand(i, 37) * 14 };
});

/**
 * 02 — The Bridge. Pinned 3-act scrub: token spins in, detonates into
 * particles, candlestick market assembles from the debris.
 */
export function Bridge() {
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
            end: "+=250%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        // act 1 — token arrives, spins
        tl.fromTo(
          "[data-coin]",
          { scale: 0.6, autoAlpha: 0, rotateY: 0 },
          { scale: 1.05, autoAlpha: 1, rotateY: 360, duration: 0.32, ease: "power1.out" },
          0,
        )
          .from("[data-bridge-copy-a]", { y: 60, autoAlpha: 0, duration: 0.18, ease: "power2.out" }, 0.04)

          // act 2 — detonation
          .to("[data-coin]", { scale: 0.1, autoAlpha: 0, rotateY: 560, duration: 0.14, ease: "power3.in" }, 0.38)
          .to(
            "[data-particle]",
            {
              opacity: 1,
              duration: 0.03,
              stagger: { each: 0.0012, from: "random" },
            },
            0.44,
          )
          .to(
            "[data-particle]",
            {
              x: (i) => (prand(i, 3) - 0.5) * 900,
              y: (i) => (prand(i, 5) - 0.5) * 620,
              duration: 0.22,
              ease: "power2.out",
            },
            0.46,
          )
          .to("[data-bridge-copy-a]", { y: -50, autoAlpha: 0, duration: 0.1, ease: "power2.in" }, 0.4)

          // act 3 — market assembles
          .to(
            "[data-particle]",
            { opacity: 0, scale: 0.3, duration: 0.12, stagger: { each: 0.001, from: "random" } },
            0.62,
          )
          .fromTo(
            "[data-candle]",
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.3,
              stagger: 0.008,
              ease: "power2.out",
            },
            0.6,
          )
          .fromTo(
            "[data-wick]",
            { scaleY: 0 },
            { scaleY: 1, duration: 0.22, stagger: 0.008, ease: "power2.out" },
            0.66,
          )
          .from("[data-bridge-copy-b]", { y: 60, autoAlpha: 0, duration: 0.16, ease: "power2.out" }, 0.68)
          .to({}, { duration: 0.1 }, 0.9); // settle hold
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-screen overflow-hidden">
      {/* dim horizon field */}
      <div className="absolute inset-0 opacity-60">
        <div className="cine-field">
          <div className="cine-blob cine-c" />
          <div className="cine-vignette" />
          <div className="grain" />
        </div>
      </div>

      {/* stage */}
      <div className="persp absolute inset-0 flex items-center justify-center">
        <div data-coin className="coin will-change-transform">
          <span className="coin-glyph">₿</span>
        </div>

        {/* particle debris (positioned at center, scattered by scrub) */}
        <div className="pointer-events-none absolute left-1/2 top-1/2">
          {Array.from({ length: N_PARTICLES }, (_, i) => (
            <span key={i} data-particle className="particle" />
          ))}
        </div>

        {/* candlestick market */}
        <svg
          className="absolute inset-x-[14%] bottom-[24%] top-[26%] w-[72%]"
          viewBox="0 0 220 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {CANDLES.map((c, i) => {
            const x = (i / N_CANDLES) * 220 + 4;
            const col = c.up ? "var(--color-rise)" : "var(--color-fall)";
            return (
              <g key={i}>
                <rect
                  data-wick
                  x={x + 1.35}
                  y={c.wickTop}
                  width="0.4"
                  height={c.wickH}
                  fill={col}
                  opacity="0.3"
                  style={{ transformOrigin: `${x + 1.55}px 100px` }}
                />
                <rect
                  data-candle
                  x={x}
                  y={c.y}
                  width="3.1"
                  height={c.h}
                  rx="0.6"
                  fill={col}
                  opacity="0.55"
                  style={{ transformOrigin: `${x + 1.55}px 100px` }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* copy — act A */}
      <div
        data-bridge-copy-a
        className="absolute bottom-24 left-6 z-10 md:left-10"
      >
        <p className="label mb-5 flex items-center gap-3 text-ember">
          <span className="inline-block h-px w-10 bg-ember" />
          02 — The bridge
        </p>
        <h2 className="display text-[clamp(2.6rem,6vw,6.5rem)]">
          Crypto in.
        </h2>
      </div>

      {/* copy — act B */}
      <div
        data-bridge-copy-b
        className="absolute bottom-24 right-6 z-10 text-right md:right-10"
      >
        <h2 className="display text-[clamp(2.6rem,6vw,6.5rem)]">
          <span className="editorial bg-gradient-to-r from-ember-hi to-ember bg-clip-text pr-[0.06em] text-transparent">
            equity out.
          </span>
        </h2>
        <p className="mt-5 ml-auto max-w-95 text-[15px] leading-[1.7] text-mute">
          Sell BTC, own AAPL in the same breath. No fiat ramp, no wires — the
          bridge settles both legs at once.
        </p>
      </div>
    </section>
  );
}
