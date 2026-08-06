"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

const BLURBS = [
  {
    title: "Two markets, one book",
    body: "180+ listed equities and 60+ tokens, traded from a single crypto balance.",
  },
  {
    title: "Asset protection",
    body: "Segregated custody with insured cold storage on the crypto side.",
  },
  {
    title: "Near-zero fees",
    body: "0.08% taker on the exchange — tighter as your volume climbs.",
  },
  {
    title: "Secure by design",
    body: "SOC 2 controls and continuous proof-of-reserves, published live.",
  },
];

/** Quiet 4-up reassurance row under the hero. */
export function Blurbs() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-blurb]", {
          y: 30,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: root.current, start: "top 82%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative px-6 pb-6 pt-20 md:px-10">
      <div className="mx-auto grid max-w-[1720px] grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {BLURBS.map((b) => (
          <div key={b.title} data-blurb className="border-t pt-6">
            <h3 className="text-[17px] font-semibold">{b.title}</h3>
            <p className="mt-3 max-w-70 text-[14px] leading-[1.65] text-mute">
              {b.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
