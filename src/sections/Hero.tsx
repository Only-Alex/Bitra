"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { CineVideo } from "@/components/CineVideo";
import { HeroDashboard } from "@/components/HeroDashboard";
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
          .from(
            "[data-hero-caps] .char",
            { yPercent: 118, rotate: 5, duration: 1.2, stagger: 0.024 },
            0.45,
          )
          .from("[data-hero-italic]", { yPercent: 112, duration: 1.5 }, 0.72)
          .from(
            "[data-hero-sub], [data-hero-cta] > *",
            { autoAlpha: 0, y: 20, duration: 1.1, stagger: 0.1 },
            1.0,
          )
          .from(
            "[data-dash-outer]",
            { autoAlpha: 0, y: 90, duration: 1.6 },
            0.9,
          );

        // Scroll — the device lays flat and takes the stage as copy exits.
        // Outer wrapper belongs to the entrance; inner belongs to this scrub.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=90%",
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
            },
          })
          .fromTo(
            "[data-dash]",
            { rotateX: 38, y: "9vh", scale: 0.94 },
            { rotateX: 0, y: "-25vh", scale: 1.02, duration: 1 },
            0,
          )
          .to(
            "[data-hero-copy]",
            { yPercent: -34, autoAlpha: 0, duration: 0.4, ease: "power1.in" },
            0.42,
          )
          .to("[data-hero-media]", { scale: 1.1, duration: 1 }, 0);

        // pointer depth on the field
        if (window.matchMedia("(pointer: fine)").matches) {
          const mx = gsap.quickTo("[data-hero-media]", "x", {
            duration: 1.2,
            ease: "power3",
          });
          const my = gsap.quickTo("[data-hero-media]", "y", {
            duration: 1.2,
            ease: "power3",
          });
          const onMove = (e: MouseEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            mx(nx * -18);
            my(ny * -12);
          };
          window.addEventListener("mousemove", onMove);
          return () => window.removeEventListener("mousemove", onMove);
        }
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

      <div className="relative z-10 flex h-full flex-col items-center px-6 pt-[15vh] md:px-10">
        {/* centered copy stack */}
        <div data-hero-copy className="flex flex-col items-center text-center">
          <p
            data-hero-eyebrow
            className="label mb-6 flex items-center gap-3 text-ember"
          >
            <span className="inline-block h-px w-10 bg-ember" />
            The exchange between markets
            <span className="inline-block h-px w-10 bg-ember" />
          </p>

          <h1
            aria-label="One balance. Every market."
            className="display text-[clamp(3rem,7.2vw,7.5rem)]"
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

          <p
            data-hero-sub
            className="mt-6 max-w-130 text-[15px] leading-[1.7] text-mute"
          >
            BTC, ETH, SOL and 180+ listed equities — traded, borrowed against,
            staked, and spent from one account.
          </p>

          <div data-hero-cta className="mt-8 flex items-center gap-7">
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
            <a
              href="#markets"
              className="label text-mute transition-colors duration-300 hover:text-bone"
            >
              View live markets →
            </a>
          </div>
        </div>

        {/* the device */}
        <div
          data-dash-outer
          className="persp mt-[6vh] w-full max-w-[1060px] will-change-transform"
        >
          <div data-dash className="will-change-transform">
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
