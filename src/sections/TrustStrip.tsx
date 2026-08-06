"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

const STATS = [
  { value: 8, suffix: "ms", label: "Median execution", decimals: 0 },
  { value: 99.99, suffix: "%", label: "Exchange uptime", decimals: 2 },
  { value: 2.4, prefix: "$", suffix: "B", label: "Daily liquidity", decimals: 1 },
  { value: 180, suffix: "+", label: "Listed equities", decimals: 0 },
];

/** 06 — Infrastructure numbers count up as the strip enters. */
export function TrustStrip() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const nums = gsap.utils.toArray<HTMLElement>("[data-stat-num]");

        nums.forEach((el, i) => {
          const s = STATS[i];
          const counter = { v: 0 };
          gsap.to(counter, {
            v: s.value,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            onUpdate: () => {
              el.textContent = `${s.prefix ?? ""}${counter.v.toFixed(s.decimals)}${s.suffix}`;
            },
          });
        });

        gsap.from("[data-stat-cell]", {
          y: 40,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 82%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1720px]">
        <p className="label mb-14 flex items-center gap-3 text-ember">
          <span className="inline-block h-px w-10 bg-ember" />
          06 — Built like infrastructure
        </p>

        <div className="grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} data-stat-cell className="border-l pl-6">
              <p data-stat-num className="display num text-[clamp(2.6rem,4.6vw,4.5rem)]">
                {`${s.prefix ?? ""}${s.value.toFixed(s.decimals)}${s.suffix}`}
              </p>
              <p className="label mt-4 text-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
