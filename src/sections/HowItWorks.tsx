"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { fmtDelta, fmtPrice, useQuote } from "@/lib/market";
import { Sparkline } from "@/components/charts/Sparkline";

const STEPS = [
  {
    num: "01",
    title: "Pick any market",
    body: "Equities and tokens live in one search. AAPL sits next to BTC — no separate apps, no separate balances.",
  },
  {
    num: "02",
    title: "Fund it with crypto",
    body: "The sell leg is quoted live from your balance. You see exactly what 0.18 BTC buys before you commit.",
  },
  {
    num: "03",
    title: "Own it in seconds",
    body: "Both legs settle atomically at T+0. The position lands in the same balance you funded from.",
  },
];

function ScreenMarkets() {
  return (
    <div className="flex h-full flex-col">
      <p className="label text-faint">Markets</p>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5">
        <span className="text-faint">⌕</span>
        <span className="text-[12px] text-faint">Search everything…</span>
      </div>
      <div className="mt-3 space-y-1.5">
        {["AAPL", "NVDA", "TSLA", "BTC"].map((id) => (
          <MiniRow key={id} id={id} />
        ))}
      </div>
    </div>
  );
}

function MiniRow({ id }: { id: string }) {
  const q = useQuote(id);
  const up = q.delta >= 0;
  return (
    <div className="flex items-center justify-between rounded-xl bg-ink-3/60 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span
          className={`label flex h-7 w-7 items-center justify-center rounded-lg ${
            q.kind === "crypto"
              ? "bg-ember/15 text-ember"
              : "bg-[#8b7cf6]/15 text-[#c0b3fa]"
          }`}
        >
          {q.id.slice(0, 1)}
        </span>
        <div>
          <p className="text-[12px] font-semibold leading-tight">{q.id}</p>
          <p className="text-[10px] text-faint">{q.name}</p>
        </div>
      </div>
      <Sparkline id={id} width={54} height={20} />
      <div className="text-right">
        <p className="num text-[11px] font-semibold">${fmtPrice(q.price)}</p>
        <p className={`num text-[10px] font-semibold ${up ? "text-rise" : "text-fall"}`}>
          {fmtDelta(q.delta)}
        </p>
      </div>
    </div>
  );
}

function ScreenTicket() {
  const btc = useQuote("BTC");
  const aapl = useQuote("AAPL");
  return (
    <div className="flex h-full flex-col">
      <p className="label text-faint">New order</p>
      <div className="mt-4 rounded-2xl bg-ink-3/60 p-4">
        <p className="label text-faint">You sell</p>
        <p className="num mt-1.5 text-[24px] font-semibold">
          0.1800 <span className="text-[14px] text-mute">BTC</span>
        </p>
        <p className="num text-[11px] text-faint">≈ ${fmtPrice(btc.price * 0.18)}</p>
      </div>
      <div className="relative z-10 mx-auto -my-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-ember text-[14px] text-void ring-4 ring-ink-2">
        ↓
      </div>
      <div className="rounded-2xl bg-ink-3/60 p-4">
        <p className="label text-faint">You buy</p>
        <p className="num mt-1.5 text-[24px] font-semibold">
          {((btc.price * 0.18) / aapl.price).toFixed(2)}{" "}
          <span className="text-[14px] text-mute">AAPL</span>
        </p>
        <p className="num text-[11px] text-faint">@ ${fmtPrice(aapl.price)}</p>
      </div>
      <div className="mt-auto">
        <div className="label rounded-xl bg-ember py-3.5 text-center text-void">
          Slide to confirm →
        </div>
      </div>
    </div>
  );
}

function ScreenPortfolio() {
  const btc = useQuote("BTC");
  const aapl = useQuote("AAPL");
  const up = aapl.delta >= 0;
  return (
    <div className="flex h-full flex-col">
      <p className="label text-faint">Portfolio</p>
      <p className="num mt-3 text-[28px] font-semibold leading-none">
        ${fmtPrice(btc.price * 0.94 + aapl.price * 57)}
      </p>
      <p className="num mt-2 text-[11px] font-semibold text-rise">
        ▲ +$1,186.20 (5.34%) all time
      </p>
      <div className="mt-4 h-16">
        <Sparkline id="AAPL" width={240} height={64} areaOpacity={0.22} fluid />
      </div>
      <div className="mt-4 rounded-2xl border border-ember/25 bg-ember/8 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="label flex h-8 w-8 items-center justify-center rounded-lg bg-[#8b7cf6]/15 text-[#c0b3fa]">
              A
            </span>
            <div>
              <p className="text-[12px] font-semibold">AAPL · 57 shares</p>
              <p className="label text-ember">Order filled · T+0</p>
            </div>
          </div>
          <p className={`num text-[12px] font-semibold ${up ? "text-rise" : "text-fall"}`}>
            {fmtDelta(aapl.delta)}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Pinned product walkthrough: steps light up in sequence while the
 * floating phone swaps screens — pick, fund, own.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const steps = gsap.utils.toArray<HTMLElement>("[data-hiw-step]");
        const screens = gsap.utils.toArray<HTMLElement>(".hiw-screen");
        const dots = gsap.utils.toArray<HTMLElement>("[data-hiw-dot]");

        gsap.set(steps.slice(1), { opacity: 0.32 });
        gsap.set(screens.slice(1), { autoAlpha: 0 });
        gsap.set(dots[0], { backgroundColor: "var(--color-ember)" });

        const SEG = 1 / STEPS.length;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        tl.from(
          "[data-hiw-phone]",
          { y: 120, rotateY: -14, autoAlpha: 0, duration: SEG * 0.5, ease: "power2.out" },
          0,
        ).fromTo(
          "[data-hiw-fill]",
          { scaleY: 1 / 3 },
          { scaleY: 1, duration: 1 },
          0,
        );

        STEPS.forEach((_, i) => {
          if (i === 0) return;
          const at = i * SEG;
          tl.to(steps[i - 1], { opacity: 0.32, duration: SEG * 0.2 }, at - SEG * 0.1)
            .to(steps[i], { opacity: 1, duration: SEG * 0.2 }, at)
            .to(dots[i - 1], { backgroundColor: "rgba(255,255,255,0.15)", duration: 0.02 }, at)
            .to(dots[i], { backgroundColor: "var(--color-ember)", duration: 0.02 }, at)
            .to(screens[i - 1], { autoAlpha: 0, y: -24, duration: SEG * 0.18 }, at - SEG * 0.06)
            .fromTo(
              screens[i],
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: SEG * 0.2, ease: "power2.out" },
              at + SEG * 0.02,
            )
            .to(
              "[data-hiw-phone]",
              { rotateY: [-6, 0, 6][i], duration: SEG * 0.4, ease: "power1.inOut" },
              at,
            );
        });

        tl.to({}, { duration: SEG * 0.4 }); // hold on the last step
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-screen overflow-hidden">
      <div className="relative z-10 mx-auto grid h-full max-w-[1500px] items-center gap-16 px-6 md:grid-cols-2 md:px-10">
        {/* steps */}
        <div>
          <p className="label mb-8 flex items-center gap-3 text-ember">
            <span className="inline-block h-px w-10 bg-ember" />
            How it works
          </p>
          <h2 className="display-soft text-[clamp(2.2rem,4.2vw,4rem)]">
            Crypto to stock,
            <br />
            <span className="editorial bg-gradient-to-r from-ember-hi to-ember bg-clip-text pr-[0.06em] text-transparent">
              three taps.
            </span>
          </h2>

          <div className="mt-12 flex gap-7">
            {/* progress rail */}
            <div className="relative w-px self-stretch bg-white/10">
              <div
                data-hiw-fill
                className="absolute inset-x-0 top-0 h-full origin-top bg-ember"
                style={{ transform: "scaleY(0.33)" }}
              />
            </div>

            <div className="space-y-10">
              {STEPS.map((s) => (
                <div key={s.num} data-hiw-step className="flex gap-5">
                  <span
                    data-hiw-dot
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white/15"
                  />
                  <div>
                    <p className="label mb-2 text-faint">{s.num}</p>
                    <h3 className="text-[22px] font-semibold">{s.title}</h3>
                    <p className="mt-2.5 max-w-95 text-[15px] leading-[1.7] text-mute">
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* phone */}
        <div className="persp hidden justify-center md:flex">
          <div data-hiw-phone className="relative will-change-transform">
            {/* ambient ring */}
            <div className="absolute -inset-16 rounded-full bg-ember/10 blur-[90px]" />
            <div className="relative w-[310px] rounded-[2.8rem] border border-white/14 bg-ink p-3 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.85)]">
              <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-white/10" />
              <div className="relative h-[430px] overflow-hidden rounded-[2.2rem] bg-ink-2 p-5">
                <div className="hiw-screen p-5">
                  <ScreenMarkets />
                </div>
                <div className="hiw-screen p-5">
                  <ScreenTicket />
                </div>
                <div className="hiw-screen p-5">
                  <ScreenPortfolio />
                </div>
              </div>
              <div className="mt-3 flex justify-around pb-1">
                {["◈", "⌕", "⇄", "▤"].map((g, i) => (
                  <span
                    key={i}
                    className={`text-[15px] ${i === 0 ? "text-ember" : "text-faint"}`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
