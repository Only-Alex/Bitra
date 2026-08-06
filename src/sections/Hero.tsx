"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { CineVideo } from "@/components/CineVideo";
import { TradePanel } from "@/components/TradePanel";
import { SplitChars } from "@/components/SplitChars";
import { Magnetic } from "@/components/Magnetic";
import { PRELOAD_S } from "@/components/Preloader";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance — held behind the preloader curtain
        const tl = gsap.timeline({
          delay: PRELOAD_S,
          defaults: { ease: "expo.out" },
        });
        tl.from("[data-nav]", { autoAlpha: 0, y: -18, duration: 1.1 }, 0.25)
          .from(
            "[data-hero-eyebrow]",
            { autoAlpha: 0, y: 14, duration: 0.9 },
            0.4,
          )
          // caps line detonates per-char; italic line glides in whole
          .from(
            "[data-hero-caps] .char",
            {
              yPercent: 118,
              rotate: 5,
              duration: 1.2,
              stagger: 0.024,
            },
            0.45,
          )
          .from(
            "[data-hero-italic]",
            { yPercent: 112, duration: 1.5 },
            0.72,
          )
          .from(
            "[data-hero-sub], [data-hero-cta]",
            { autoAlpha: 0, y: 20, duration: 1.1, stagger: 0.12 },
            1.05,
          )
          .from(
            "[data-hero-panel]",
            { autoAlpha: 0, y: 56, duration: 1.4 },
            0.9,
          )
          .from("[data-hero-foot]", { autoAlpha: 0, duration: 1.2 }, 1.35);

        // idle float on the trade panel
        gsap.to("[data-hero-panel]", {
          y: -14,
          duration: 3.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: PRELOAD_S + 2.4,
        });

        // pointer depth: media drifts against cursor, panel with it
        if (window.matchMedia("(pointer: fine)").matches) {
          const mx = gsap.quickTo("[data-hero-media]", "x", {
            duration: 1.2,
            ease: "power3",
          });
          const my = gsap.quickTo("[data-hero-media]", "y", {
            duration: 1.2,
            ease: "power3",
          });
          const px = gsap.quickTo("[data-hero-panel]", "x", {
            duration: 1,
            ease: "power3",
          });
          const onMove = (e: MouseEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            mx(nx * -20);
            my(ny * -14);
            px(nx * 26);
          };
          window.addEventListener("mousemove", onMove);
          return () => window.removeEventListener("mousemove", onMove);
        }

        // Exit: content lifts and dims, media pushes in — cinematic dolly
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
          .to("[data-hero-content]", { yPercent: -16, autoAlpha: 0 }, 0)
          .to("[data-hero-foot]", { autoAlpha: 0 }, 0)
          .to("[data-hero-media]", { scale: 1.14, yPercent: 6 }, 0);
      });
    },
    { scope: undefined },
  );

  return (
    <section
      ref={root}
      id="hero"
      className="relative h-[100svh] overflow-hidden"
    >
      <div data-hero-media className="absolute inset-0 will-change-transform">
        <CineVideo asset="hero" priority />
      </div>

      <div
        data-hero-content
        className="relative z-10 flex h-full flex-col justify-end px-6 pb-36 md:px-10 md:pb-40"
      >
        <p data-hero-eyebrow className="label mb-7 flex items-center gap-3 text-ember">
          <span className="inline-block h-px w-10 bg-ember" />
          The exchange between markets
        </p>

        <h1
          aria-label="One balance. Every market."
          className="display text-[clamp(3.4rem,8.8vw,9.75rem)] lg:text-[clamp(3.4rem,7vw,8.25rem)]"
        >
          <span className="reveal-mask">
            <span data-hero-caps className="reveal-line" aria-hidden="true">
              <SplitChars text="One balance." />
            </span>
          </span>
          <span className="reveal-mask">
            <span
              data-hero-italic
              className="reveal-line editorial bg-gradient-to-r from-ember-hi via-ember to-ember-lo bg-clip-text pr-[0.08em] text-transparent"
            >
              every market.
            </span>
          </span>
        </h1>

        <div className="mt-10 flex flex-wrap items-center gap-8">
          <span data-hero-cta className="inline-block">
            <Magnetic>
              <a
                href="#exchange"
                className="label group flex items-center gap-3 rounded-full bg-ember px-7 py-4 text-void transition-colors duration-300 hover:bg-ember-hi"
              >
                Start trading
                <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </a>
            </Magnetic>
          </span>
          <p
            data-hero-sub
            className="max-w-105 text-[15px] leading-[1.7] text-mute"
          >
            Trade live equities straight from your crypto balance. Borrow,
            stake, swap, and spend — one account across both markets.
          </p>
        </div>
      </div>

      <div
        data-hero-panel
        className="absolute right-10 top-1/2 z-20 hidden -translate-y-[56%] will-change-transform lg:block xl:right-16"
      >
        <TradePanel />
      </div>

      <div
        data-hero-foot
        className="absolute inset-x-0 bottom-0 z-10 px-6 md:px-10"
      >
        <div className="hairline h-px" />
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="scroll-rail" />
            <span className="label text-faint">Scroll to discover</span>
          </div>
          <div className="label hidden items-center gap-8 text-faint md:flex">
            <span>24/7 markets</span>
            <span className="h-1 w-1 rounded-full bg-faint/50" />
            <span>T+0 settlement</span>
            <span className="h-1 w-1 rounded-full bg-faint/50" />
            <span>Self-custody bridge</span>
          </div>
        </div>
      </div>
    </section>
  );
}
