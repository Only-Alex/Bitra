"use client";

import { useEffect, useRef } from "react";
import { useQuote } from "@/lib/market";

type LiveChartProps = {
  id: string;
  height?: number;
};

/**
 * Canvas price chart: amber line with glow, gradient area, dashed grid,
 * pulsing live endpoint. Displayed values lerp toward the feed each frame
 * so ticks morph fluidly instead of jumping. Static single draw under
 * prefers-reduced-motion.
 */
export function LiveChart({ id, height = 220 }: LiveChartProps) {
  const q = useQuote(id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef<number[]>(q.history);
  const disp = useRef<number[]>([...q.history]);

  target.current = q.history;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = getComputedStyle(document.documentElement);
    const ember = css.getPropertyValue("--color-ember").trim() || "#189ffb";
    const emberHi = css.getPropertyValue("--color-ember-hi").trim() || "#7fd0ff";
    // accent as "r,g,b" so every canvas alpha follows the theme token
    const n = parseInt(ember.replace("#", ""), 16);
    const rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(performance.now());
    });
    ro.observe(canvas);
    resize();

    const draw = (t: number) => {
      const tgt = target.current;
      const d = disp.current;
      if (d.length !== tgt.length) disp.current = [...tgt];
      for (let i = 0; i < d.length; i++) d[i] += (tgt[i] - d[i]) * 0.12;

      ctx.clearRect(0, 0, w, h);

      const padT = 10;
      const padB = 14;
      const min = Math.min(...d);
      const max = Math.max(...d);
      const span = max - min || 1;
      const X = (i: number) => (i / (d.length - 1)) * w;
      const Y = (p: number) =>
        padT + (1 - (p - min) / span) * (h - padT - padB);

      // grid
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.055)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      for (let g = 1; g <= 3; g++) {
        const gy = padT + ((h - padT - padB) / 4) * g;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
      ctx.restore();

      // area
      const grad = ctx.createLinearGradient(0, padT, 0, h);
      grad.addColorStop(0, `rgba(${rgb},0.26)`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < d.length; i++) ctx.lineTo(X(i), Y(d[i]));
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // line
      ctx.beginPath();
      for (let i = 0; i < d.length; i++) {
        const x = X(i);
        const y = Y(d[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = ember;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.shadowColor = `rgba(${rgb},0.55)`;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // live endpoint
      const lx = X(d.length - 1);
      const ly = Y(d[d.length - 1]);
      const pulse = reduced ? 0.5 : (Math.sin(t / 420) + 1) / 2;
      ctx.beginPath();
      ctx.arc(lx, ly, 3 + pulse * 7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${0.28 - pulse * 0.22})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = emberHi;
      ctx.fill();
    };

    if (reduced) {
      draw(performance.now());
    } else {
      const loop = (t: number) => {
        draw(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full"
      style={{ height }}
      aria-hidden="true"
    />
  );
}
