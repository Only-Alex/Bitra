"use client";

import { ASSET_IDS, fmtDelta, fmtPrice, useQuote } from "@/lib/market";

function TapeItem({ id }: { id: string }) {
  const q = useQuote(id);
  const up = q.delta >= 0;
  return (
    <span className="flex items-center gap-3 pr-14">
      <span className="label text-faint">{q.id}</span>
      <span className="num text-[13px] font-medium text-bone/90">
        ${fmtPrice(q.price)}
      </span>
      <span
        className={`num text-[12px] font-semibold ${up ? "text-rise" : "text-fall"}`}
      >
        {fmtDelta(q.delta)}
      </span>
    </span>
  );
}

/** Infinite streaming quote tape bridging hero → markets. */
export function TickerTape() {
  const seq = [...ASSET_IDS, ...ASSET_IDS];
  return (
    <div
      className="tape-mask relative overflow-hidden border-y py-4"
      aria-hidden="true"
    >
      <div className="tape">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {seq.map((id, i) => (
              <TapeItem key={`${copy}-${i}`} id={id} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
