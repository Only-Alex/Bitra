import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });

  if (process.env.NODE_ENV === "development") {
    // debug handles for driving choreography from the console
    (window as unknown as Record<string, unknown>).__gsap = gsap;
    (window as unknown as Record<string, unknown>).__st = ScrollTrigger;
  }
}

export { gsap, ScrollTrigger };
