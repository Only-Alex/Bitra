"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

const FEATURES = [
  {
    num: "01",
    id: "borrow",
    title: "Borrow",
    line: "Liquidity without selling.",
    body: "Post crypto as collateral, draw stablecoins or fiat buying power against it. Positions stay yours.",
    points: ["Up to 70% LTV", "No fixed term", "Repay any time"],
  },
  {
    num: "02",
    id: "stake",
    title: "Stake",
    line: "Idle assets, working.",
    body: "Native staking routed to audited validators. Rewards land in the same balance you trade from.",
    points: ["ETH · SOL · more", "Auto-compound", "Unstake queue visible"],
  },
  {
    num: "03",
    id: "swap",
    title: "Swap",
    line: "Any pair. One tap.",
    body: "Crypto to crypto, crypto to equity exposure — routed for best execution across venues.",
    points: ["Smart order routing", "Zero slippage guard", "Quotes locked 15s"],
  },
  {
    num: "04",
    id: "spend",
    title: "Spend",
    line: "Your balance, anywhere.",
    body: "The Bitra card draws on crypto or converted fiat at checkout. You pick the asset it burns.",
    points: ["Visa rails", "Real-time FX", "Instant freeze"],
  },
];

/**
 * 04 — Feature sequence. Alethia-style pinned run: giant outlined
 * numbers crossfade while content blocks hand over, scrubbed.
 */
export function Features() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const blocks = gsap.utils.toArray<HTMLElement>("[data-feat-block]");
        const nums = gsap.utils.toArray<HTMLElement>("[data-feat-num]");
        const ticks = gsap.utils.toArray<HTMLElement>("[data-feat-tick]");

        gsap.set(blocks.slice(1), { autoAlpha: 0 });
        gsap.set(nums.slice(1), { autoAlpha: 0, yPercent: 24 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        const SEG = 1 / FEATURES.length;

        FEATURES.forEach((_, i) => {
          const at = i * SEG;

          tl.to(ticks[i], { backgroundColor: "var(--color-ember)", duration: 0.02 }, at);

          if (i === 0) return;

          tl.to(blocks[i - 1], { autoAlpha: 0, y: -46, duration: SEG * 0.3, ease: "power2.in" }, at - SEG * 0.18)
            .to(nums[i - 1], { autoAlpha: 0, yPercent: -24, duration: SEG * 0.3, ease: "power2.in" }, at - SEG * 0.18)
            .fromTo(
              blocks[i],
              { autoAlpha: 0, y: 46 },
              { autoAlpha: 1, y: 0, duration: SEG * 0.3, ease: "power2.out" },
              at + SEG * 0.02,
            )
            .fromTo(
              nums[i],
              { autoAlpha: 0, yPercent: 24 },
              { autoAlpha: 1, yPercent: 0, duration: SEG * 0.3, ease: "power2.out" },
              at + SEG * 0.02,
            )
            .to(ticks[i - 1], { backgroundColor: "rgba(255,255,255,0.12)", duration: 0.02 }, at);
        });

        tl.to({}, { duration: SEG * 0.5 }); // hold on 04
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="features"
      className="relative h-screen overflow-hidden"
    >
      {/* field shifts warmer as sequence runs */}
      <div className="absolute inset-0 opacity-45">
        <div className="cine-field">
          <div className="cine-blob cine-a" style={{ opacity: 0.5 }} />
          <div className="cine-vignette" />
          <div className="grain" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1720px] items-center px-6 md:px-10">
        {/* giant number */}
        <div className="relative hidden w-[42%] md:block">
          {FEATURES.map((f, i) => (
            <p
              key={f.num}
              data-feat-num
              className={`outline-num text-[clamp(10rem,24vw,24rem)] ${i > 0 ? "absolute inset-0" : ""}`}
            >
              {f.num}
            </p>
          ))}
        </div>

        {/* content blocks */}
        <div className="relative w-full md:w-[58%]">
          <p className="label mb-10 flex items-center gap-3 text-ember">
            <span className="inline-block h-px w-10 bg-ember" />
            04 — Everything after the trade
          </p>

          <div className="relative min-h-[340px]">
            {FEATURES.map((f) => (
              <div key={f.id} id={f.id} data-feat-block className="feature-block">
                <h3 className="display text-[clamp(2.4rem,5vw,5.5rem)]">
                  {f.title}
                </h3>
                <p className="editorial mt-2 bg-gradient-to-r from-ember-hi to-ember bg-clip-text pr-[0.06em] text-[clamp(1.6rem,3vw,3rem)] text-transparent">
                  {f.line}
                </p>
                <p className="mt-6 max-w-105 text-[15px] leading-[1.7] text-mute">
                  {f.body}
                </p>
                <ul className="mt-7 flex flex-wrap gap-3">
                  {f.points.map((p) => (
                    <li key={p} className="label glass rounded-full px-4 py-2.5 text-mute">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* progress rail */}
          <div className="mt-12 flex items-center gap-2">
            {FEATURES.map((f) => (
              <span
                key={f.num}
                data-feat-tick
                className="h-1 w-10 rounded-full bg-white/12"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
