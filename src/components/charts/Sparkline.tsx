"use client";

import { useId } from "react";
import { useQuote } from "@/lib/market";

type SparklineProps = {
  id: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  /** peak opacity of the area fill under the line */
  areaOpacity?: number;
  /** stretch to fill parent box */
  fluid?: boolean;
};

/** Live mini-chart. Stroke follows 24h direction; area fades to nothing. */
export function Sparkline({
  id,
  width = 120,
  height = 36,
  strokeWidth = 1.5,
  areaOpacity = 0.28,
  fluid = false,
}: SparklineProps) {
  const q = useQuote(id);
  const gid = useId();

  const min = Math.min(...q.history);
  const max = Math.max(...q.history);
  const span = max - min || 1;
  const pad = 3;

  const pts = q.history.map((p, i) => {
    const x = (i / (q.history.length - 1)) * width;
    const y = pad + (1 - (p - min) / span) * (height - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const up = q.delta >= 0;
  const stroke = up ? "var(--color-rise)" : "var(--color-fall)";

  return (
    <svg
      width={fluid ? "100%" : width}
      height={fluid ? "100%" : height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity={areaOpacity} />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts.join(" ")} ${width},${height}`}
        fill={`url(#${gid})`}
      />
      <polyline
        points={pts.join(" ")}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
