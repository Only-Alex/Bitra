"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { heroState } from "@/lib/motion/heroProgress";
import { fmtPrice, useQuote } from "@/lib/market";
import { LiveChart } from "@/components/charts/LiveChart";

const HeroCanvas = dynamic(
  () => import("@/components/three/HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false },
);

function HandoffPanel() {
  const btc = useQuote("BTC");
  return (
    <div className="glass w-[min(560px,86vw)] rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="label text-faint">BTC / USD · Live</p>
        <span className="num text-[15px] font-semibold">${fmtPrice(btc.price)}</span>
      </div>
      <LiveChart id="BTC" height={180} />
      <p className="label mt-4 text-center text-faint">Entering the exchange</p>
    </div>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const buildTimeline = (endPct: number) => {
        const proxy = { p: 0 };
        let lastP = 0;
        let lastT = performance.now();

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${endPct}%`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // the master progress value — the 3D scene reads this each frame
        tl.to(
          proxy,
          {
            p: 1,
            duration: 1,
            onUpdate: () => {
              const now = performance.now();
              const dt = Math.max(16, now - lastT);
              heroState.vel = Math.abs(proxy.p - lastP) / (dt / 1000);
              lastP = proxy.p;
              lastT = now;
              heroState.p = proxy.p;
            },
          },
          0,
        );

        /* DOM choreography on the same clock (positions = story progress) */
        tl.to("[data-cue]", { autoAlpha: 0, duration: 0.06 }, 0.1)
          // copy dims only after the object has clearly started moving
          .to("[data-open-copy]", { autoAlpha: 0, y: -44, duration: 0.14 }, 0.16)
          .to("[data-stage]", { autoAlpha: 1, duration: 0.14 }, 0.44)
          .fromTo(
            "[data-ghost]",
            { autoAlpha: 0 },
            { autoAlpha: 0.5, duration: 0.14 },
            0.5,
          )
          .to("[data-ghost]", { xPercent: -5, duration: 0.5 }, 0.5)
          .fromTo(
            "[data-copy-a]",
            { autoAlpha: 0, y: 44 },
            { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" },
            0.52,
          )
          .fromTo(
            "[data-copy-b]",
            { autoAlpha: 0, y: 44 },
            { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" },
            0.58,
          )
          .fromTo(
            "[data-handoff]",
            { autoAlpha: 0, scale: 0.62 },
            { autoAlpha: 1, scale: 1, duration: 0.12, ease: "power2.out" },
            0.88,
          )
          .to("[data-copy-a], [data-copy-b]", { autoAlpha: 0.25, duration: 0.1 }, 0.9);

        return tl;
      };

      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, mobile } = ctx.conditions as {
            desktop: boolean;
            mobile: boolean;
          };

          if (desktop || mobile) {
            heroState.frozen = false;
            heroState.mobile = mobile;
            const tl = buildTimeline(desktop ? 320 : 220);

            if (desktop) {
              const onMove = (e: MouseEvent) => {
                heroState.px = e.clientX / window.innerWidth - 0.5;
                heroState.py = e.clientY / window.innerHeight - 0.5;
              };
              window.addEventListener("mousemove", onMove);
              return () => {
                window.removeEventListener("mousemove", onMove);
                tl.scrollTrigger?.kill();
                tl.kill();
              };
            }
            return () => {
              tl.scrollTrigger?.kill();
              tl.kill();
            };
          }

          // reduced motion: static settled composition, everything readable
          heroState.frozen = true;
          heroState.p = 0.8;
          gsap.set("[data-open-copy], [data-copy-a], [data-copy-b], [data-stage]", {
            autoAlpha: 1,
            y: 0,
          });
          gsap.set("[data-ghost]", { autoAlpha: 0.35 });
          gsap.set("[data-cue], [data-handoff]", { autoAlpha: 0 });
        },
      );

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-void">
      {/* backdrop: establish gradient, then product stage */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #04060c 0%, #090b12 45%, #050508 100%)",
          }}
        />
        <div data-stage className="stage-bg absolute inset-0 opacity-0">
          <div className="stage-grid absolute inset-x-0 bottom-0 h-[60%]" />
        </div>
        {/* ghosted word, deep behind the object */}
        <div
          data-ghost
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden text-center opacity-0"
          aria-hidden="true"
        >
          <span className="ghost-word whitespace-nowrap text-[26vw]">BITRA</span>
        </div>
      </div>

      {/* the single WebGL canvas */}
      <div className="absolute inset-0 z-10">
        <HeroCanvas />
      </div>

      {/* copy layers */}
      <div className="relative z-20 h-full">
        {/* opening state */}
        <div
          data-open-copy
          className="absolute bottom-[16vh] left-6 max-w-xl md:left-10"
        >
          <p className="label mb-6 flex items-center gap-3 text-ice">
            <span className="inline-block h-px w-10 bg-ice" />
            Crypto-native market access
          </p>
          <h1 className="display text-[clamp(2.9rem,6.4vw,6.5rem)] tracking-[-0.035em]">
            <span className="reveal-mask">
              <span className="reveal-line">Trade crypto.</span>
            </span>
            <span className="reveal-mask">
              <span className="reveal-line text-ice-hi">Own stocks.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-90 text-[16px] leading-[1.7] text-mute">
            Access live markets from one crypto-first platform.
          </p>
          <a
            href="#exchange"
            className="label mt-8 inline-block rounded-full bg-ice px-7 py-4 text-void transition-colors duration-300 hover:bg-ice-hi"
          >
            Enter the exchange
          </a>
        </div>

        {/* scroll cue */}
        <div
          data-cue
          className="absolute bottom-10 right-6 flex items-center gap-4 md:right-10"
        >
          <span className="label text-faint">Scroll to enter</span>
          <span className="scroll-rail" />
        </div>

        {/* post-threshold pair, opposing corners, around the object */}
        <div data-copy-a className="absolute left-6 top-[16vh] opacity-0 md:left-10">
          <h2 className="display text-[clamp(1.9rem,3.6vw,3.6rem)]">
            Markets, instantly
            <br />
            accessible.
          </h2>
        </div>
        <div
          data-copy-b
          className="absolute bottom-[14vh] right-6 text-right opacity-0 md:right-10"
        >
          <h2 className="display text-[clamp(1.9rem,3.6vw,3.6rem)] text-ice-hi">
            One balance.
          </h2>
          <p className="mt-3 text-[16px] text-mute">More ways to move.</p>
        </div>

        {/* market hand-off */}
        <div
          data-handoff
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0"
        >
          <HandoffPanel />
        </div>
      </div>
    </section>
  );
}
