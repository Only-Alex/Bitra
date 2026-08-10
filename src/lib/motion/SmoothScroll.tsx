"use client";

import { type ReactNode, useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * The single integration point between Lenis, the GSAP ticker and
 * ScrollTrigger. Mounted once at the app root.
 *
 * Exactly one Lenis instance, one ticker callback and one ScrollTrigger.update
 * subscription exist for the whole app — no component adds its own RAF loop or
 * scroll listener. ScrollTrigger handles resize internally, so no resize
 * listener is registered here either; only a post-font refresh is needed,
 * because pin distances measured against fallback metrics are wrong.
 *
 * Under prefers-reduced-motion the whole integration is skipped and the page
 * uses native scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    // one subscription: Lenis position -> ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    if (process.env.NODE_ENV === "development") {
      // debug handle: lets a dev jump the journey to an exact progress
      (window as unknown as Record<string, unknown>).__lenis = lenis;
    }

    // one ticker callback: GSAP clock -> Lenis
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // pin measurements are only trustworthy once webfonts have swapped in
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
