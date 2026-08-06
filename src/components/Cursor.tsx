"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

/** Trailing cursor ring; swells over interactive elements. Fine pointers only. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useGSAP(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
  });

  useGSAP(
    () => {
      if (!enabled || !dot.current || !ring.current) return;

      gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50 });
      const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power2" });
      const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power2" });
      const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
      const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });

      const onMove = (e: MouseEvent) => {
        dx(e.clientX);
        dy(e.clientY);
        rx(e.clientX);
        ry(e.clientY);
      };

      const onOver = (e: MouseEvent) => {
        const hit = (e.target as Element).closest?.(
          "a, button, [data-magnetic]",
        );
        gsap.to(ring.current, {
          scale: hit ? 2.1 : 1,
          opacity: hit ? 0.9 : 0.5,
          duration: 0.35,
          ease: "power3.out",
        });
        gsap.to(dot.current, {
          scale: hit ? 0 : 1,
          duration: 0.35,
          ease: "power3.out",
        });
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseover", onOver);
      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseover", onOver);
      };
    },
    { dependencies: [enabled] },
  );

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200]" aria-hidden="true">
      <div
        ref={dot}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-ember"
      />
      <div
        ref={ring}
        className="fixed left-0 top-0 h-9 w-9 rounded-full border border-ember/60 opacity-50"
      />
    </div>
  );
}
