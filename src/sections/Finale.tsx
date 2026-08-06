"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { CineVideo } from "@/components/CineVideo";
import { Magnetic } from "@/components/Magnetic";

/** 07 — Finale. Full-bleed field, closing headline, footer with giant ghost wordmark. */
export function Finale() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-fin-line]", {
          yPercent: 112,
          duration: 1.4,
          stagger: 0.14,
          ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 55%" },
        });
        gsap.from("[data-fin-cta]", {
          y: 30,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 40%" },
        });

        // slow drift on the ghost wordmark
        gsap.to("[data-ghost]", {
          xPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="cta" className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 opacity-80">
        <CineVideo asset="finale" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-32 text-center">
        <p className="label mb-8 flex items-center gap-3 text-ember">
          <span className="inline-block h-px w-10 bg-ember" />
          07 — Begin
        </p>
        <h2 className="display text-[clamp(3.2rem,9vw,10rem)]">
          <span className="reveal-mask">
            <span data-fin-line className="reveal-line">
              Enter the
            </span>
          </span>
          <span className="reveal-mask">
            <span
              data-fin-line
              className="reveal-line editorial bg-gradient-to-r from-ember-hi via-ember to-ember-lo bg-clip-text pr-[0.08em] text-transparent"
            >
              exchange.
            </span>
          </span>
        </h2>
        <div data-fin-cta className="mt-12">
          <Magnetic>
            <a
              href="#"
              className="label group flex items-center gap-3 rounded-full bg-ember px-9 py-5 text-void transition-colors duration-300 hover:bg-ember-hi"
            >
              Create account
              <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      {/* footer */}
      <footer className="relative z-10 mt-24">
        <div className="hairline mx-6 h-px md:mx-10" />
        <div className="mx-auto grid max-w-[1720px] grid-cols-2 gap-x-8 gap-y-12 px-6 py-14 md:grid-cols-5 md:px-10">
          <div className="col-span-2 md:col-span-2">
            <span className="display text-[20px]">
              BITRA<span className="text-ember">.</span>
            </span>
            <p className="editorial mt-4 text-[20px] text-mute">
              One balance, every market.™
            </p>
            <p className="label mt-8 max-w-80 leading-[1.9] text-faint">
              Digital assets are volatile. Value can fall as well as rise.
              Nothing here is investment advice.
            </p>
          </div>
          {(
            [
              ["Products", ["Exchange", "Borrow", "Stake", "Swap", "Card"]],
              ["Resources", ["Docs", "Trading API", "Fees", "Status", "Proof of reserves"]],
              ["Company", ["About", "Careers", "Press", "Security", "Legal"]],
            ] as const
          ).map(([head, links]) => (
            <nav key={head} aria-label={head}>
              <p className="label mb-5 text-faint">{head}</p>
              <ul className="space-y-3.5">
                {links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[14px] text-mute transition-colors duration-300 hover:text-bone"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mx-auto flex max-w-[1720px] flex-wrap items-center justify-between gap-4 px-6 pb-10 md:px-10">
          <p className="label text-faint">© 2026 Bitra Labs</p>
          <div className="label flex gap-7 text-faint">
            {["X / Twitter", "Discord", "Privacy", "Terms"].map((l) => (
              <a key={l} href="#" className="transition-colors duration-300 hover:text-bone">
                {l}
              </a>
            ))}
          </div>
        </div>

        {/* ghost wordmark */}
        <div className="pointer-events-none relative h-[16vw] overflow-hidden" aria-hidden="true">
          <p
            data-ghost
            className="display absolute left-1/2 top-0 -translate-x-1/2 text-[22vw] leading-[0.8] text-white/4"
          >
            BITRA
          </p>
        </div>
      </footer>
    </section>
  );
}
