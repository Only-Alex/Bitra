"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { experience } from "@/lib/experience/progress";
import { EnvironmentLayer } from "@/components/experience/EnvironmentLayer";

const ExperienceCanvas = dynamic(
  () =>
    import("@/components/experience/ExperienceCanvas").then(
      (m) => m.ExperienceCanvas,
    ),
  { ssr: false },
);

/**
 * The pinned experience section.
 *
 * One ScrollTrigger owns the whole journey and is the single scroll-animation
 * authority. It writes the normalized progress that the 3D scene reads each
 * frame, and drives the DOM layers on the same clock — so forward and reverse
 * scrubbing are the same computation run in opposite directions.
 *
 * DOM stays semantic and above the canvas: headings are headings, the CTA is
 * an anchor, and the live phone/terminal UI is real DOM rather than baked
 * pixels.
 */
export function Experience() {
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

        /* Environment playback is derived from progress, not from discrete
           events, so scrubbing backwards resolves to the same state. */
        const spaceVid = root.current?.querySelector<HTMLVideoElement>(
          "[data-space] video",
        );
        const worldVid = root.current?.querySelector<HTMLVideoElement>(
          "[data-world] video",
        );
        const syncVideos = (p: number) => {
          const wantSpace = p <= 0.55;
          const wantWorld = p > 0.4;
          if (spaceVid) {
            if (wantSpace && spaceVid.paused) void spaceVid.play().catch(() => {});
            else if (!wantSpace && !spaceVid.paused) spaceVid.pause();
          }
          if (worldVid) {
            if (wantWorld && worldVid.paused) void worldVid.play().catch(() => {});
            else if (!wantWorld && !worldVid.paused) worldVid.pause();
          }
        };

        // the master progress value — every consumer reads this
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
              syncVideos(proxy.p);
            },
          },
          0,
        );

        /* environment breathes on the same clock */
        tl.fromTo(
          "[data-space] video",
          { scale: 1.02, yPercent: 0 },
          { scale: 1.18, yPercent: -3.5, duration: 0.44 },
          0,
        )
          .fromTo(
            "[data-world] video",
            { scale: 1.3 },
            { scale: 1.04, duration: 0.3, ease: "power1.out" },
            0.45,
          )
          .to("[data-world] video", { scale: 1.1, duration: 0.25 }, 0.75);

        /* DOM choreography, positions expressed as story progress */
        tl.to("[data-cue]", { autoAlpha: 0, duration: 0.06 }, 0.1)
          .to("[data-open-copy]", { autoAlpha: 0, y: -44, duration: 0.14 }, 0.16)
          .to("[data-space]", { autoAlpha: 0, duration: 0.12 }, 0.4)
          .to("[data-stage]", { autoAlpha: 1, duration: 0.14 }, 0.44)
          .to("[data-world]", { autoAlpha: 1, duration: 0.12 }, 0.45)
          .to("[data-world]", { autoAlpha: 0.14, duration: 0.16 }, 0.56)
          .to("[data-ghost]", { autoAlpha: 0.18, duration: 0.16 }, 0.56)
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
            experience.frozen = false;
            experience.mobile = mobile;
            const tl = buildTimeline(desktop ? 320 : 220);

            // pointer parallax is a desktop-only refinement
            if (desktop) {
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

          // reduced motion: settled, readable, no pinning or scrubbing
          experience.frozen = true;
          experience.mobile = false;
          experience.p = 0.8;
          gsap.set(
            "[data-open-copy], [data-copy-a], [data-copy-b], [data-stage], [data-world]",
            { autoAlpha: 1, y: 0 },
          );
          gsap.set("[data-ghost]", { autoAlpha: 0.35 });
          gsap.set("[data-cue], [data-space]", { autoAlpha: 0 });
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
      {/* environment, behind the canvas */}
      <EnvironmentLayer />

      {/* the single persistent WebGL canvas */}
      <div className="absolute inset-0 z-10">
        <ExperienceCanvas />
      </div>

      {/* semantic DOM, above the canvas */}
      <div className="relative z-20 h-full">
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

        <div
          data-cue
          className="absolute bottom-10 right-6 flex items-center gap-4 md:right-10"
        >
          <span className="label text-faint">Scroll to enter</span>
          <span className="scroll-rail" />
        </div>

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
      </div>
    </section>
  );
}
