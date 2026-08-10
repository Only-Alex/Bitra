"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { experience } from "@/lib/experience/progress";
import { scrubJourney } from "@/lib/experience/journeyVideo";
import { EnvironmentLayer } from "@/components/experience/EnvironmentLayer";

const ExperienceCanvas = dynamic(
  () =>
    import("@/components/experience/ExperienceCanvas").then(
      (m) => m.ExperienceCanvas,
    ),
  { ssr: false },
);

const PATHWAYS = ["Swap", "Stake", "Borrow", "Spend"] as const;

/**
 * The pinned Bitra journey.
 *
 * Aurora landscape → market-access threshold → Bitra card → smoked-glass
 * market panel → live exchange chamber, as one continuous, reversible move.
 *
 * A single ScrollTrigger owns the whole thing. It writes the normalized
 * progress that the 3D scene reads, scrubs the environment plate, and drives
 * the DOM on the same clock — so every final transform and opacity is a
 * deterministic function of progress and reverse scrolling reconstructs the
 * journey exactly.
 */
export function Experience() {
  const root = useRef<HTMLElement>(null);

  /* Resolved after mount, never during render: matchMedia is client-only, so
     branching markup on it while rendering produces a hydration mismatch.
     The server and the first client paint both use these defaults; the real
     values arrive in one post-mount update, not on every frame. */
  const [{ reduced, mobile }, setEnv] = useState({
    reduced: false,
    mobile: false,
  });

  useEffect(() => {
    setEnv({
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      mobile: window.matchMedia("(max-width: 767px)").matches,
    });
  }, []);

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
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // the master progress value — 3D, environment and DOM all read this
        tl.to(
          proxy,
          {
            p: 1,
            duration: 1,
            onUpdate: () => {
              const now = performance.now();
              const dt = Math.max(16, now - lastT);
              experience.vel = Math.abs(proxy.p - lastP) / (dt / 1000);
              lastP = proxy.p;
              lastT = now;
              experience.p = proxy.p;
              // plate time is a pure function of progress
              scrubJourney(proxy.p);
            },
          },
          0,
        );

        /* ---- 0.00–0.22 hero arrival: hold the landscape, phone dominant ---- */
        tl.to("[data-cue]", { autoAlpha: 0, duration: 0.05 }, 0.14);

        /* ---- 0.22–0.45 approach: copy recedes as the object moves ---- */
        tl.to(
          "[data-open-copy]",
          { autoAlpha: 0, y: -40, duration: 0.14, ease: "power2.in" },
          0.24,
        );

        /* ---- 0.45–0.64 portal to card ---- */
        tl.fromTo(
          "[data-threshold]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.08 },
          0.44,
        )
          .to("[data-threshold]", { autoAlpha: 0, duration: 0.08 }, 0.6)
          .fromTo(
            "[data-ghost]",
            { autoAlpha: 0 },
            { autoAlpha: 0.42, duration: 0.1 },
            0.5,
          )
          .to("[data-ghost]", { xPercent: -4, duration: 0.42 }, 0.5);

        /* ---- 0.64–0.80 product orbit: live DOM pathway labels ----
           Timed so all four are fully up by ~0.72 and fully gone by ~0.82,
           i.e. entirely inside the orbit hold and clear of the card→panel
           turn that begins at 0.838. */
        tl.fromTo(
          "[data-pathway]",
          { autoAlpha: 0, y: 26, scale: 0.94 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.045,
            stagger: 0.01,
            ease: "power2.out",
          },
          0.645,
        ).to(
          "[data-pathway]",
          { autoAlpha: 0, y: -20, duration: 0.035, stagger: 0.006 },
          0.762,
        );

        /* ---- 0.80–0.92 card to market panel ---- */
        tl.to("[data-ghost]", { autoAlpha: 0.16, duration: 0.06 }, 0.82);

        /* ---- 0.92–1.00 exchange chamber ---- */
        tl.fromTo(
          "[data-chamber]",
          { autoAlpha: 0 },
          { autoAlpha: 0.55, duration: 0.08 },
          0.9,
        )
          .fromTo(
            "[data-final]",
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.06, ease: "power2.out" },
            0.93,
          );

        return tl;
      };

      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const c = ctx.conditions as { desktop: boolean; mobile: boolean };

          if (c.desktop || c.mobile) {
            experience.frozen = false;
            experience.mobile = c.mobile;
            const tl = buildTimeline(c.desktop ? 340 : 240);

            if (c.desktop) {
              const onMove = (e: MouseEvent) => {
                experience.px = e.clientX / window.innerWidth - 0.5;
                experience.py = e.clientY / window.innerHeight - 0.5;
              };
              window.addEventListener("mousemove", onMove, { passive: true });
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

          /* reduced motion: no pin, no scrub, no video — a readable static
             composition holding the proposition, the object, the pathways
             and the CTA. */
          experience.frozen = true;
          experience.mobile = false;
          experience.p = 0.1;
          gsap.set("[data-open-copy], [data-pathway]", { autoAlpha: 1, y: 0 });
          gsap.set("[data-cue], [data-threshold], [data-final]", { autoAlpha: 0 });
          gsap.set("[data-ghost]", { autoAlpha: 0.2 });
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Bitra market access"
      className="relative h-[100svh] overflow-hidden bg-void"
    >
      <EnvironmentLayer reduced={reduced} mobile={mobile} />

      {/* the single persistent WebGL canvas */}
      <div className="absolute inset-0 z-10">
        <ExperienceCanvas />
      </div>

      {/* threshold light, a DOM wash rather than a WebGL flash */}
      <div
        data-threshold
        className="pointer-events-none absolute inset-0 z-[11] opacity-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 46% 40% at 50% 48%, rgba(167,216,255,0.30), rgba(121,191,255,0.10) 45%, transparent 72%)",
        }}
      />

      {/* ===== semantic DOM, above the canvas ===== */}
      <div className="relative z-20 h-full">
        <div
          data-open-copy
          className="absolute bottom-[9vh] left-6 max-w-[36rem] md:bottom-[15vh] md:left-10"
        >
          <p className="label mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-ice">
            <span className="inline-block h-px w-10 bg-ice" />
            Non-KYC • Crypto • Stocks • One balance
          </p>
          <h1 className="display text-[clamp(2.7rem,6.2vw,6.2rem)] tracking-[-0.035em]">
            <span className="reveal-mask">
              <span className="reveal-line">Trade crypto.</span>
            </span>
            <span className="reveal-mask">
              <span className="reveal-line text-ice-hi">Own stocks.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-[30rem] text-[16px] leading-[1.7] text-mute">
            Access live stock markets directly from crypto—without KYC. Swap,
            stake, borrow and spend from one unified balance.
          </p>
          <a
            href="#exchange"
            className="label mt-8 inline-block rounded-full bg-ice px-7 py-4 text-void transition-colors duration-300 hover:bg-ice-hi"
          >
            Enter the exchange
          </a>
        </div>

        <div
          data-cue
          className="absolute bottom-10 right-6 flex items-center gap-4 md:right-10"
        >
          <span className="label text-faint">Scroll to enter</span>
          <span className="scroll-rail" />
        </div>

        {/* product pathways — live DOM, never baked into the artwork */}
        <ul
          className="pointer-events-none absolute inset-0 hidden md:block"
          aria-label="Bitra product pathways"
        >
          {PATHWAYS.map((label, i) => {
            const spots = [
              "left-[12%] top-[26%]",
              "right-[13%] top-[32%]",
              "left-[15%] bottom-[27%]",
              "right-[12%] bottom-[23%]",
            ];
            return (
              <li
                key={label}
                data-pathway
                className={`absolute ${spots[i]} opacity-0`}
              >
                <span className="glass label rounded-full px-5 py-3 text-bone">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>

        {/* mobile pathways: a single readable row, no orbital motion */}
        <ul
          className="pointer-events-none absolute inset-x-0 bottom-[12vh] flex flex-wrap justify-center gap-2 px-6 md:hidden"
          aria-label="Bitra product pathways"
        >
          {PATHWAYS.map((label) => (
            <li key={label} data-pathway className="opacity-0">
              <span className="glass label rounded-full px-4 py-2.5 text-bone">
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* final chamber copy + CTA, semantic and focusable */}
        <div
          data-final
          className="absolute inset-x-0 bottom-[8vh] flex flex-col items-center px-6 text-center opacity-0"
        >
          <h2 className="display text-[clamp(1.6rem,3vw,2.8rem)] text-ice-hi">
            One balance. Every market.
          </h2>
          <a
            href="#exchange"
            className="label pointer-events-auto mt-6 inline-block rounded-full bg-ice px-8 py-4 text-void transition-colors duration-300 hover:bg-ice-hi"
          >
            Enter the exchange
          </a>
        </div>
      </div>
    </section>
  );
}
