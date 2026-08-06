"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { CineVideo } from "@/components/CineVideo";

/**
 * 05 — The card. Pinned scrub: metal card swings through studio light,
 * sheen sweeps the brushed surface. Seedance slot C sits behind.
 */
export function CardSection() {
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
            end: "+=220%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        tl.fromTo(
          "[data-card-3d]",
          { rotateY: -32, rotateX: 9, y: 140, scale: 0.86 },
          { rotateY: 26, rotateX: -7, y: -40, scale: 1, duration: 1 },
          0,
        )
          .fromTo(
            "[data-card-sheen]",
            { xPercent: -70 },
            { xPercent: 70, duration: 0.55 },
            0.2,
          )
          .from("[data-card-copy]", { y: 70, autoAlpha: 0, duration: 0.2, ease: "power2.out" }, 0.08)
          .from("[data-card-stats] > *", { y: 30, autoAlpha: 0, stagger: 0.04, duration: 0.14, ease: "power2.out" }, 0.55);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="card" className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 opacity-70">
        <CineVideo asset="card" />
      </div>

      <div className="persp absolute inset-0 z-10 flex items-center justify-center">
        <div data-card-3d className="bank-card will-change-transform">
          {/* sheen is scrub-driven, override the static ::after with a real node */}
          <div
            data-card-sheen
            className="pointer-events-none absolute -inset-[40%]"
            style={{
              background:
                "linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.16) 50%, rgba(255,174,0,0.12) 54%, transparent 62%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div className="flex items-start justify-between">
              <span className="display text-[22px]">
                BITRA<span className="text-ember">.</span>
              </span>
              <svg width="30" height="22" viewBox="0 0 30 22" fill="none" aria-hidden="true">
                <path d="M4 3a14 14 0 0 1 0 16M9 6a10 10 0 0 1 0 10M14 8.5a6 6 0 0 1 0 5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="card-chip" />
            <div className="flex items-end justify-between">
              <div>
                <p className="num text-[15px] tracking-[0.24em] text-bone/80">
                  ••••&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;4021
                </p>
                <p className="label mt-2 text-faint">One balance</p>
              </div>
              <span className="label text-bone/60">Metal</span>
            </div>
          </div>
        </div>
      </div>

      <div data-card-copy className="absolute bottom-24 left-6 z-20 md:left-10">
        <p className="label mb-5 flex items-center gap-3 text-ember">
          <span className="inline-block h-px w-10 bg-ember" />
          05 — The card
        </p>
        <h2 className="display text-[clamp(2.6rem,6vw,6.5rem)]">
          Spend the
          <br />
          <span className="editorial bg-gradient-to-r from-ember-hi to-ember bg-clip-text pr-[0.06em] text-transparent">
            unspendable.
          </span>
        </h2>
      </div>

      <div
        data-card-stats
        className="absolute bottom-24 right-6 z-20 flex flex-col items-end gap-3 text-right md:right-10"
      >
        <p className="max-w-85 text-[15px] leading-[1.7] text-mute">
          Crypto or converted fiat at 40M+ merchants. Pick the asset it draws
          from — switch it mid-week if you like.
        </p>
        <div className="mt-2 flex gap-3">
          <span className="label glass rounded-full px-4 py-2.5 text-mute">Visa rails</span>
          <span className="label glass rounded-full px-4 py-2.5 text-mute">Real-time FX</span>
          <span className="label glass rounded-full px-4 py-2.5 text-mute">Metal</span>
        </div>
      </div>
    </section>
  );
}
