"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { CineVideo } from "@/components/CineVideo";

/**
 * 05 — The card. Pinned scrub: the metal card tumbles through studio
 * light between corner-anchored headlines while electric filaments
 * draw across its face. Ghost wordmark drifts behind.
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
          { rotateY: -42, rotateX: 12, rotate: -7, y: 170, scale: 0.8 },
          { rotateY: 32, rotateX: -9, rotate: 6, y: -50, scale: 1.02, duration: 1 },
          0,
        )
          .fromTo(
            "[data-card-sheen]",
            { xPercent: -70 },
            { xPercent: 70, duration: 0.5 },
            0.22,
          )
          .to(
            "[data-filament]",
            { strokeDashoffset: 0, duration: 0.34, stagger: 0.05 },
            0.38,
          )
          .fromTo(
            "[data-card-ghost]",
            { xPercent: 5 },
            { xPercent: -5, duration: 1 },
            0,
          )
          .from(
            "[data-card-copy-a]",
            { y: 60, autoAlpha: 0, duration: 0.18, ease: "power2.out" },
            0.06,
          )
          .from(
            "[data-card-copy-b]",
            { y: 60, autoAlpha: 0, duration: 0.2, ease: "power2.out" },
            0.5,
          )
          .from(
            "[data-card-chips] > *",
            { y: 24, autoAlpha: 0, stagger: 0.05, duration: 0.12, ease: "power2.out" },
            0.62,
          );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="card" className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 opacity-70">
        <CineVideo asset="card" />
      </div>

      {/* ghost wordmark behind the card */}
      <div
        data-card-ghost
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[5] -translate-y-1/2 overflow-hidden text-center"
        aria-hidden="true"
      >
        <span className="outline-num whitespace-nowrap text-[24vw] opacity-40">
          BITRA
        </span>
      </div>

      <div className="persp absolute inset-0 z-10 flex items-center justify-center">
        <div data-card-3d className="bank-card will-change-transform">
          <div
            data-card-sheen
            className="pointer-events-none absolute -inset-[40%]"
            style={{
              background:
                "linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.16) 50%, rgba(24,159,251,0.14) 54%, transparent 62%)",
            }}
          />
          {/* electric filaments */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 353 222"
            fill="none"
            aria-hidden="true"
          >
            {[
              "M-10 40 L90 96 L150 60 L235 128 L364 88",
              "M-10 170 L70 130 L180 186 L260 140 L364 176",
              "M120 -10 L160 70 L230 40 L280 232",
            ].map((d, i) => (
              <path
                key={i}
                data-filament
                className="filament"
                d={d}
                stroke={i === 1 ? "var(--color-flare)" : "var(--color-ember)"}
                strokeWidth={i === 2 ? 0.75 : 1.1}
                opacity={0.85 - i * 0.18}
              />
            ))}
          </svg>
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

      {/* corner-anchored headline pair */}
      <div data-card-copy-a className="absolute left-6 top-24 z-20 md:left-10 md:top-28">
        <p className="label mb-5 flex items-center gap-3 text-ember">
          <span className="inline-block h-px w-10 bg-ember" />
          05 — The card
        </p>
        <h2 className="display text-[clamp(2.4rem,5.2vw,5.6rem)]">Spend the</h2>
      </div>

      <div className="absolute bottom-24 right-6 z-20 text-right md:right-10">
        <div data-card-copy-b>
          <h2 className="display text-[clamp(2.4rem,5.2vw,5.6rem)]">
            <span className="editorial bg-gradient-to-r from-ember-hi to-ember bg-clip-text pr-[0.06em] text-transparent">
              unspendable.
            </span>
          </h2>
          <p className="ml-auto mt-5 max-w-85 text-[16px] leading-[1.7] text-mute">
            Crypto or converted fiat at 40M+ merchants. Pick the asset it
            draws from — switch it mid-week if you like.
          </p>
        </div>
        <div data-card-chips className="mt-5 flex justify-end gap-3">
          <span className="label glass rounded-full px-4 py-2.5 text-mute">Visa rails</span>
          <span className="label glass rounded-full px-4 py-2.5 text-mute">Real-time FX</span>
          <span className="label glass rounded-full px-4 py-2.5 text-mute">Metal</span>
        </div>
      </div>
    </section>
  );
}
