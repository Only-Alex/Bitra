"use client";

import { useEffect, useRef } from "react";
import { useQuote } from "@/lib/market";

type CandleChartProps = {
  id: string;
  height?: number;
};

type Candle = { o: number; h: number; l: number; c: number; v: number };

function toCandles(history: number[], bucket = 4): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i + bucket <= history.length; i += bucket) {
    const seg = history.slice(i, i + bucket);
    const o = seg[0];
    const c = seg[seg.length - 1];
    out.push({
      o,
      c,
      h: Math.max(...seg),
      l: Math.min(...seg),
      v: Math.abs(c - o) + (Math.sin(i * 12.9898) * 0.5 + 0.5) * Math.abs(o) * 0.0006,
    });
  }
  return out;
}

function fmtAxis(p: number) {
  return p >= 1000
    ? p.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : p.toFixed(2);
}

/**
 * Terminal-grade candle chart: OHLC candles with wicks, volume rows,
 * price grid + right axis, live last-price tag, pointer crosshair.
 * Live values lerp per frame so ticks glide instead of jumping.
 */
export function CandleChart({ id, height = 320 }: CandleChartProps) {
  const q = useQuote(id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef<number[]>(q.history);
  const disp = useRef<number[]>([...q.history]);
  const mouse = useRef<{ x: number; y: number } | null>(null);

  target.current = q.history;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = getComputedStyle(document.documentElement);
    const ice = css.getPropertyValue("--color-ice").trim() || "#79bfff";
    const rise = css.getPropertyValue("--color-rise").trim() || "#4ade9c";
    const fall = css.getPropertyValue("--color-fall").trim() || "#ff5c6e";
    const n = parseInt(ice.replace("#", ""), 16);
    const iceRgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(canvas);
    resize();

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (reduced) draw();
    };
    const onLeave = () => {
      mouse.current = null;
      if (reduced) draw();
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const AXIS_W = 64;
    const VOL_H = 0.16;

    const draw = () => {
      const tgt = target.current;
      const d = disp.current;
      if (d.length !== tgt.length) disp.current = [...tgt];
      for (let i = 0; i < d.length; i++) d[i] += (tgt[i] - d[i]) * 0.14;

      ctx.clearRect(0, 0, w, h);

      const candles = toCandles(d);
      const plotW = w - AXIS_W;
      const volTop = h * (1 - VOL_H);
      const padT = 12;
      const padB = h * VOL_H + 10;
      const min = Math.min(...candles.map((c) => c.l));
      const max = Math.max(...candles.map((c) => c.h));
      const span = max - min || 1;
      const Y = (p: number) => padT + (1 - (p - min) / span) * (h - padT - padB);
      const cw = plotW / candles.length;

      /* grid + right axis */
      ctx.font = "10px ui-monospace, monospace";
      ctx.textAlign = "left";
      for (let g = 0; g <= 4; g++) {
        const gy = padT + ((h - padT - padB) / 4) * g;
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.setLineDash([2, 6]);
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(plotW, gy);
        ctx.stroke();
        ctx.setLineDash([]);
        const price = max - (span / 4) * g;
        ctx.fillStyle = "rgba(151,160,179,0.7)";
        ctx.fillText(fmtAxis(price), plotW + 8, gy + 3);
      }

      /* volume */
      const maxV = Math.max(...candles.map((c) => c.v)) || 1;
      candles.forEach((c, i) => {
        const up = c.c >= c.o;
        const vh = (c.v / maxV) * (h * VOL_H - 8);
        ctx.fillStyle = up ? "rgba(74,222,156,0.28)" : "rgba(255,92,110,0.28)";
        ctx.fillRect(i * cw + cw * 0.22, h - vh, cw * 0.56, vh);
      });
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.moveTo(0, volTop);
      ctx.lineTo(plotW, volTop);
      ctx.stroke();

      /* candles */
      candles.forEach((c, i) => {
        const up = c.c >= c.o;
        const col = up ? rise : fall;
        const x = i * cw + cw / 2;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, Y(c.h));
        ctx.lineTo(x, Y(c.l));
        ctx.stroke();
        const top = Y(Math.max(c.o, c.c));
        const bh = Math.max(1.5, Math.abs(Y(c.o) - Y(c.c)));
        ctx.fillStyle = col;
        if (up) {
          ctx.fillRect(x - cw * 0.28, top, cw * 0.56, bh);
        } else {
          ctx.globalAlpha = 0.9;
          ctx.fillRect(x - cw * 0.28, top, cw * 0.56, bh);
          ctx.globalAlpha = 1;
        }
      });

      /* last price line + tag */
      const last = d[d.length - 1];
      const ly = Y(last);
      ctx.strokeStyle = `rgba(${iceRgb},0.55)`;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(plotW, ly);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = ice;
      const tag = fmtAxis(last);
      ctx.fillRect(plotW, ly - 9, AXIS_W, 18);
      ctx.fillStyle = "#050508";
      ctx.fillText(tag, plotW + 8, ly + 3);

      /* crosshair */
      const m = mouse.current;
      if (m && m.x < plotW) {
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(m.x, 0);
        ctx.lineTo(m.x, h);
        ctx.moveTo(0, m.y);
        ctx.lineTo(plotW, m.y);
        ctx.stroke();
        ctx.setLineDash([]);
        const price = max - ((m.y - padT) / (h - padT - padB)) * span;
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(plotW, m.y - 9, AXIS_W, 18);
        ctx.fillStyle = "rgba(232,236,244,0.95)";
        ctx.fillText(fmtAxis(price), plotW + 8, m.y + 3);
      }
    };

    if (reduced) {
      draw();
    } else {
      const loop = () => {
        draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="block w-full" style={{ height }} />;
}
