"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

/** Duration the curtain owns the screen; Hero's entrance waits this long. */
export const PRELOAD_S = 1.9;

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.style.display = "none";
        return;
      }

      const counter = { v: 0 };
      const num = el.querySelector("[data-load-num]") as HTMLElement;

      gsap
        .timeline()
        .to(counter, {
          v: 100,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            num.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        })
        .to("[data-load-bar]", { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0)
        .to(
          "[data-load-inner]",
          { yPercent: -40, autoAlpha: 0, duration: 0.5, ease: "power3.in" },
          1.15,
        )
        .to(el, {
          yPercent: -100,
          duration: 0.85,
          ease: "expo.inOut",
          onComplete: () => {
            el.style.display = "none";
          },
        });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-void"
      aria-hidden="true"
    >
      <div data-load-inner className="flex flex-col items-center gap-6">
        <p className="display text-[28px]">
          BITRA<span className="text-ember">.</span>
        </p>
        <div className="h-px w-44 overflow-hidden bg-white/10">
          <div
            data-load-bar
            className="h-full w-full origin-left scale-x-0 bg-ember"
          />
        </div>
        <p data-load-num className="label num text-faint">
          000
        </p>
      </div>
    </div>
  );
}
