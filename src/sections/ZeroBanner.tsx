"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

/** Typographic panel: the number is the hero. */
export function ZeroBanner() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-zero]", {
          scale: 0.7,
          autoAlpha: 0,
          rotate: -8,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 68%" },
        });
        gsap.from("[data-zero-copy] > *", {
          y: 30,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 68%" },
        });
        // slow shimmer drift across the panel
        gsap.to("[data-zero-sheen]", {
          xPercent: 160,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative px-6 py-16 md:px-10">
      <div className="relative mx-auto max-w-[1720px] overflow-hidden rounded-[2.5rem] border bg-ink">
        <div
          data-zero-sheen
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-ember/6 to-transparent"
        />
        <div className="relative flex flex-col items-center gap-10 px-8 py-16 md:flex-row md:justify-between md:px-16 md:py-20">
          <div data-zero-copy className="max-w-95 text-center md:text-left">
            <h2 className="display text-[clamp(1.8rem,2.6vw,2.6rem)]">
              Straight through.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-mute">
              Crypto to equity in a single settled leg. Nothing parked in a
              fiat account along the way — no wire windows, no ramp fees.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <span
              data-zero
              className="outline-num text-[clamp(9rem,18vw,17rem)] will-change-transform"
              style={{ WebkitTextStroke: "2px var(--color-ember)" }}
            >
              0
            </span>
            <div className="label text-left text-[13px] leading-[1.9] tracking-[0.28em] text-bone">
              FIAT
              <br />
              LEGS
              <br />
              BETWEEN
            </div>
          </div>

          <a
            data-zero-cta
            href="#exchange"
            className="label glass rounded-full px-7 py-4 text-bone transition-colors duration-300 hover:border-ember/40 hover:text-ember"
          >
            See how it works →
          </a>
        </div>
      </div>
    </section>
  );
}
