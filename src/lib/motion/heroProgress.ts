/**
 * Single source of truth for the hero story. The pinned ScrollTrigger
 * writes `p`; the R3F scene reads it every frame. Because both sides
 * derive from one normalized value, forward and reverse scroll can
 * never drift out of sync.
 */
export const heroState = {
  /** normalized story progress 0..1 */
  p: 0,
  /** pointer, normalized -0.5..0.5 */
  px: 0,
  py: 0,
  /** recent scroll speed, used to duck idle float + pointer influence */
  vel: 0,
  /** static composition mode (prefers-reduced-motion) */
  frozen: false,
  /** small-viewport framing: smaller object, higher establish position */
  mobile: false,
};

/** clamped sub-range progress: 0 before `a`, 1 after `b` */
export function seg(p: number, a: number, b: number): number {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** smooth ease for segment interpolation (power2-in-out feel) */
export function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
