"use client";

import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

/** Nav retreats while scrolling down, returns on any upward intent. */
export function NavMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const hide = gsap.to("[data-nav]", {
        yPercent: -130,
        paused: true,
        duration: 0.45,
        ease: "power3.inOut",
      });

      const st = ScrollTrigger.create({
        start: "top -140",
        end: "max",
        onUpdate: (self) => {
          if (self.direction === 1) hide.play();
          else hide.reverse();
        },
        onLeaveBack: () => hide.reverse(),
      });

      return () => {
        st.kill();
        hide.kill();
      };
    });
  });

  return null;
}
