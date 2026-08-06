"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";

const QA = [
  {
    q: "How do I buy stocks with crypto?",
    a: "Fund your Bitra balance with any supported token, pick an equity, and place the order. The bridge sells your crypto and settles the stock leg in the same transaction — you never touch a fiat on-ramp.",
  },
  {
    q: "Do I need a bank account?",
    a: "No. Accounts fund and withdraw in crypto. A linked bank account is optional, only for fiat withdrawals if you ever want them.",
  },
  {
    q: "What happens when stock markets close?",
    a: "The crypto side never closes. Equity orders placed after hours queue with price protection and execute at the next open — or trade 24/5 synthetic sessions where supported.",
  },
  {
    q: "Is Bitra self-custodial?",
    a: "Hybrid. Trade from Bitra custody for speed, or connect your own wallet through the self-custody bridge — assets only touch the exchange at settlement.",
  },
];

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-7 text-left"
      >
        <span className="text-[17px] font-semibold md:text-[19px]">{q}</span>
        <span
          className={`text-ember transition-transform duration-400 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl pb-7 text-[16px] leading-[1.75] text-mute">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Compact accordion before the finale. */
export function Faq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-faq] > *", {
          y: 30,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: root.current, start: "top 78%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1100px]">
        <p className="label mb-12 flex items-center gap-3 text-ember">
          <span className="inline-block h-px w-10 bg-ember" />
          Questions
        </p>
        <div data-faq className="border-t">
          {QA.map((item, i) => (
            <Item
              key={item.q}
              {...item}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
