"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import {
  ASSET_IDS,
  fmtDelta,
  fmtPrice,
  getQuote,
  useMarketVersion,
  useQuote,
} from "@/lib/market";
import { Sparkline } from "@/components/charts/Sparkline";

function QuoteCard({ id }: { id: string }) {
  const q = useQuote(id);
  const up = q.delta >= 0;

  const prev = useRef(q.price);
  const [flash, setFlash] = useState<"" | "px-rise" | "px-fall">("");
  useEffect(() => {
    if (q.price !== prev.current) {
      setFlash(q.price > prev.current ? "px-rise" : "px-fall");
      prev.current = q.price;
      const t = setTimeout(() => setFlash(""), 420);
      return () => clearTimeout(t);
    }
  }, [q.price]);

  return (
    <article
      data-quote-card
      className="glass group w-80 shrink-0 snap-start rounded-3xl p-6 transition-colors duration-300 hover:border-ember/30"
    >
      <div className="flex items-center gap-3">
        <span
          className={`label flex h-10 w-10 items-center justify-center rounded-xl ${
            q.kind === "crypto"
              ? "bg-ember/15 text-ember"
              : "bg-[#7d8fd9]/15 text-[#aebbf0]"
          }`}
        >
          {q.id.slice(0, 1)}
        </span>
        <div>
          <p className="text-[15px] font-semibold leading-tight">{q.name}</p>
          <p className="label text-faint">
            {q.id} · {q.kind === "crypto" ? "Crypto" : "Equity"}
          </p>
        </div>
      </div>

      <div className="mt-5 h-28">
        <Sparkline id={q.id} width={272} height={112} strokeWidth={1.8} areaOpacity={0.2} fluid />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className={`num px text-[22px] font-semibold leading-none ${flash}`}>
            ${fmtPrice(q.price)}
          </p>
          <p className={`num mt-2 text-[12px] font-semibold ${up ? "text-rise" : "text-fall"}`}>
            {fmtDelta(q.delta)} 24H
          </p>
        </div>
        <button className="label rounded-full bg-white/6 px-5 py-2.5 text-bone transition-colors duration-300 group-hover:bg-ember group-hover:text-void">
          Trade
        </button>
      </div>
    </article>
  );
}

type Tab = "trending" | "movers";

/** Live-price carousel: tabs, arrows, chart-forward cards, snap scroll. */
export function MarketStrip() {
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("trending");
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  useMarketVersion();

  const ids =
    tab === "trending"
      ? ASSET_IDS
      : [...ASSET_IDS].sort(
          (a, b) => Math.abs(getQuote(b).delta) - Math.abs(getQuote(a).delta),
        );

  const measure = () => {
    const el = scroller.current;
    if (!el) return;
    setPages(Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth)));
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const nudge = (dir: 1 | -1) => {
    scroller.current?.scrollBy({
      left: dir * (scroller.current.clientWidth * 0.9),
      behavior: "smooth",
    });
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-quote-card]", {
          y: 48,
          rotateX: -14,
          transformPerspective: 900,
          autoAlpha: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="markets"
      className="relative z-10 -mt-px px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-[1720px]">
        <div className="mb-9 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {(
              [
                ["trending", "Trending"],
                ["movers", "Top movers"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`label rounded-full px-5 py-3 transition-colors duration-300 ${
                  tab === key
                    ? "bg-ember text-void"
                    : "glass text-mute hover:text-bone"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => nudge(-1)}
              aria-label="Previous"
              className="glass flex h-11 w-11 items-center justify-center rounded-full text-mute transition-colors duration-300 hover:text-bone"
            >
              ←
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="Next"
              className="glass flex h-11 w-11 items-center justify-center rounded-full text-mute transition-colors duration-300 hover:text-bone"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          onScroll={measure}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:none]"
        >
          {ids.map((id) => (
            <QuoteCard key={id} id={id} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === page ? "w-6 bg-ember" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
